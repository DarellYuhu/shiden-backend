import { Injectable } from '@nestjs/common';
import { subDays } from 'date-fns';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findMany() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async checkIsNewUser(userId: string) {
    const data = await this.prisma.user.findUnique({
      where: { id: userId, account: { none: {} } },
    });
    if (data) return true;
    return false;
  }

  async getBroadcast(userId: string) {
    const aDay = subDays(new Date(), 1);
    const data = await this.prisma.broadcast.findMany({
      where: {
        thread: { threadMember: { some: { userId } } },
        createdAt: { gte: aDay },
      },
      include: { thread: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return data.map(({ thread, ...rest }) => ({
      ...rest,
      threadName: thread.name,
    }));
  }

  async statistics(userId: string) {
    const accounts = this.prisma.platformAccount.aggregate({
      where: { userId },
      _count: true,
    });
    const threads = this.prisma.thread.aggregate({
      where: { threadMember: { some: { userId } } },
      _count: true,
    });
    const feeds = this.prisma.feed.aggregate({
      where: { threadMember: { userId }, content: { is: null } },
      _count: true,
    });
    const posts = this.prisma.content.aggregate({
      where: { platformAccount: { userId } },
      _count: true,
    });
    const broadcast = this.getBroadcast(userId);
    const data = await Promise.all([
      accounts,
      threads,
      feeds,
      posts,
      broadcast,
    ]);
    const normalized = {
      accounts: data[0]._count,
      threads: data[1]._count,
      feeds: data[2]._count,
      posts: data[3]._count,
      broadcasts: data[4].length,
    };
    return normalized;
  }
}
