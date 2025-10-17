import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PlatformAccountService } from './platform-account.service';
import { CreatePlatformAccountDto } from './dto/create-platform-account.dto';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';

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

  @Get()
  findMany(@Session() session: UserSession) {
    return this.platformAccountService.findMany(session.user.id);
  }
}
