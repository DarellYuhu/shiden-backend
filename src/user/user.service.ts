import { Injectable } from '@nestjs/common';
import { format, subDays } from 'date-fns';
import { Prisma, User } from 'generated/prisma';
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

  async signUpUsersStatistic() {
    const data = await this.prisma.user.findMany();
    data.reduce((acc, curr) => {
      const key = format(curr.createdAt, 'yyyy-MM-dd');
      if (acc.has(key)) acc.get(key)?.push(curr);
      else acc.set(key, [curr]);
      return acc;
    }, new Map<string, User[]>());
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
    const confirmedPost = this.prisma.content.aggregate({
      where: { platformAccount: { userId }, link: { not: null } },
      _count: true,
    });
    const broadcast = this.getBroadcast(userId);
    const data = await Promise.all([
      accounts,
      threads,
      feeds,
      posts,
      confirmedPost,
      broadcast,
    ]);
    const normalized = {
      accounts: data[0]._count,
      threads: data[1]._count,
      feeds: data[2]._count,
      posts: data[3]._count,
      confirmedPost: data[4]._count,
      broadcasts: data[5].length,
    };
    return normalized;
  }
}
