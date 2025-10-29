import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BroadcastService {
  constructor(private prisma: PrismaService) {}

  addInteraction(broadcastId: number, userId: string) {
    return this.prisma.broadcastInteraction.create({
      data: { broadcastId, userId },
    });
  }
}
