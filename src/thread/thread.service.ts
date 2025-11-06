import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AddMembersDto } from './dto/add-members-dto';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { GetMembersQueryDto } from './dto/get-members-query.dto';
import { DeleteMembersDto } from './dto/delete-members.dto';
import { AddSourceDto } from './dto/add-source.dto';

@Injectable()
export class ThreadService {
  constructor(
    private prisma: PrismaService,
    private http: HttpService,
  ) {}

  async create(ownerId: string, payload: CreateThreadDto) {
    const { memberIds, sources, ...rest } = payload;
    const validSources = await this.checkSources(sources);
    return this.prisma.thread.create({
      data: {
        ...rest,
        source: { createMany: { data: validSources, skipDuplicates: true } },
        threadMember: {
          createMany: {
            skipDuplicates: true,
            data: [
              ...memberIds.map((id) => ({ userId: id })),
              { userId: ownerId, role: 'OWNER', isEnabled: false },
            ],
          },
        },
      },
    });
  }

  createBroadcast(
    threadId: string,
    ownerId: string,
    payload: CreateBroadcastDto,
  ) {
    return this.prisma.broadcast.create({
      data: { ...payload, threadId, ownerId },
    });
  }

  async findOne(id: string) {
    const { threadMember, ...data } =
      await this.prisma.thread.findUniqueOrThrow({
        where: { id },
        include: { threadMember: { where: { role: 'OWNER' } } },
      });
    return { ...data, ownerId: threadMember.at(0)?.userId };
  }

  async findMany(userId: string) {
    const data = await this.prisma.threadMember.findMany({
      where: { userId },
      include: { thread: true },
    });
    const normalized = data.map(({ thread, ...item }) => ({
      ...item, // item must comes first !!
      ...thread,
      threadMemberId: item.id,
    }));
    return normalized;
  }

  async threadMembers(threadId: string, query: GetMembersQueryDto) {
    const { threadMember, ...rest } = await this.prisma.thread
      .findUniqueOrThrow({
        where: { id: threadId },
        include: {
          threadMember: {
            include: { user: { select: { name: true, username: true } } },
            where: {
              user: query.search
                ? {
                    OR: [
                      {
                        name: { contains: query.search, mode: 'insensitive' },
                        username: {
                          contains: query.search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  }
                : undefined,
            },
          },
        },
      })
      .catch(() => {
        throw new NotFoundException('Thread not found');
      });
    return {
      ...rest,
      members: threadMember.map(({ user, ...rest }) => ({
        ...rest,
        ...user,
      })),
    };
  }

  async addMembers(threadId: string, payload: AddMembersDto) {
    const userCandidate = await this.prisma.user.findMany({
      where: { username: { in: payload.map(({ username }) => username) } },
    });
    return this.prisma.threadMember.createMany({
      data: userCandidate.map((item) => ({ userId: item.id, threadId })),
      skipDuplicates: true,
    });
  }

  deleteThreadMembers(query: DeleteMembersDto) {
    return this.prisma.threadMember.deleteMany({
      where: { id: { in: query.userIds } },
    });
  }

  async getPostsStatistic(threadId: string) {
    const posts = await this.prisma.content.findMany({
      where: { feed: { threadMember: { threadId } } },
    });
    return {
      post: posts.length,
      confirmedPost: posts.filter((item) => !!item.link).length,
    };
  }

  async getTiktokStatistic(threadId: string) {
    const data = await this.prisma.content.findMany({
      where: {
        platformAccount: { platform: 'TIKTOK' },
        feed: { threadMember: { threadId } },
        statistic: { isNot: null },
      },
      include: { statistic: true, platformAccount: true },
    });
    return data.map(({ platformAccount, ...item }) => ({
      ...item,
      username: platformAccount.username,
      platform: platformAccount.platform,
    }));
  }

  async getBroadcastStatistic(threadId: string) {
    const data = await this.prisma.broadcast.findMany({
      where: { threadId },
      include: {
        broadcastInteraction: true,
        thread: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return data.map(({ broadcastInteraction, thread, ...item }) => ({
      ...item,
      threadName: thread.name,
      clickCount: broadcastInteraction.length,
    }));
  }

  async getMemberStatistic(threadId: string) {
    const data = await this.prisma.threadMember.findMany({
      where: { threadId },
      include: {
        user: { select: { name: true, broadcastInteraction: true } },
        feed: {
          where: { content: { isNot: null } },
          include: { content: true },
        },
      },
    });
    const normalized = data.map((item) => ({
      name: item.user.name,
      postCount: item.feed.length,
      confirmedPostCount: item.feed.reduce((acc, curr) => {
        if (curr.content?.link) acc += 1;
        return acc;
      }, 0),
      broadcastInteractionCount: item.user.broadcastInteraction.length,
    }));
    return normalized;
  }

  findManySource(threadId: string) {
    return this.prisma.source.findMany({ where: { threadId } });
  }

  async createSource(threadId: string, payload: AddSourceDto) {
    const validSource = await this.checkSources(payload.sources);
    return this.prisma.source.createMany({
      data: validSource.map((item) => ({ ...item, threadId })),
    });
  }

  deleteSource(sourceId: string) {
    return this.prisma.source.delete({ where: { id: sourceId } });
  }

  private async checkSources(ids: string[]) {
    const result = await Promise.allSettled(
      ids.map(async (id) => {
        const { data } = await lastValueFrom(
          this.http.get<{ data: { id: string; name: string } }>(
            `/workgroups/${id}`,
          ),
        );
        return { workgroupId: data.data.id, workgroupName: data.data.name };
      }),
    );
    const rejected = result.filter((res) => res.status === 'rejected');
    if (rejected[0]) console.log(rejected[0]);
    const filtered = result
      .filter((res) => res.status === 'fulfilled')
      .map((item) => item.value);
    return filtered;
  }
}
