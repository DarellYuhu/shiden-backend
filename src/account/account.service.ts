import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateManyAccountDto,
  CreateManyQueryDto,
} from './dto/create-account.dto';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  createMany(payload: CreateManyAccountDto, query: CreateManyQueryDto) {
    if (query)
      payload.map((item) => ({ ...item, categoryId: query.categoryId }));
    return this.prisma.platformAccount.createManyAndReturn({
      data: payload,
      skipDuplicates: true,
    });
  }
}
