import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePlatformAccountDto } from './dto/create-platform-account.dto';

@Injectable()
export class PlatformAccountService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, payload: CreatePlatformAccountDto) {
    return this.prisma.platformAccount.create({
      data: { ...payload, userId },
    });
  }

  findMany(userId: string) {
    return this.prisma.platformAccount.findMany({ where: { userId } });
  }
}
