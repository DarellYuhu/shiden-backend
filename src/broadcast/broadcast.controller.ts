import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { Prisma } from 'generated/prisma';

@Controller('broadcasts')
@UseGuards(AuthGuard)
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post(':id/interaction')
  async addInteraction(
    @Param('id') bId: string,
    @Session() session: UserSession,
  ) {
    try {
      return await this.broadcastService.addInteraction(+bId, session.user.id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') return { message: 'Already Existed!' };
      }
    }
  }
}
