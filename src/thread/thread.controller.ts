import { Body, Controller, Post } from '@nestjs/common';
import { ThreadService } from './thread.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('threads')
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}

  @Post()
  create(@Session() session: UserSession, @Body() payload: CreateThreadDto) {
    return this.threadService.create(session.user.id, payload);
  }
}
