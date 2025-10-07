import { Injectable } from '@nestjs/common';
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
    const data = await Promise.all([accounts, threads, feeds, posts]);
    const normalized = {
      accounts: data[0]._count,
      threads: data[1]._count,
      feeds: data[2]._count,
      posts: data[3]._count,
    };
    return normalized;
  }
}
