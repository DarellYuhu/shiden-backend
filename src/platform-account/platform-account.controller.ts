import {
  Body,
  ConflictException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlatformAccountService } from './platform-account.service';
import { CreatePlatformAccountDto } from './dto/create-platform-account.dto';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { UpdatePlatformAccountDto } from './dto/update-platform-account.dto';
import { Prisma } from 'generated/prisma';

@Controller('platform-accounts')
@UseGuards(AuthGuard)
export class PlatformAccountController {
  constructor(
    private readonly platformAccountService: PlatformAccountService,
  ) {}

  @Post()
  create(
    @Body() payload: CreatePlatformAccountDto,
    @Session() session: UserSession,
  ) {
    return this.platformAccountService.create(session.user.id, payload);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() payload: UpdatePlatformAccountDto,
  ) {
    try {
      return await this.platformAccountService.update(id, payload);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ConflictException('Username already taken! 😔');
      }
      throw error;
    }
  }

  @Get()
  findMany(@Session() session: UserSession) {
    return this.platformAccountService.findMany(session.user.id);
  }
}
