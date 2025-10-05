import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';

@Controller('feeds')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  findMany(
    @Session() session: UserSession,
    @Query('thread_id') threadId: string,
  ) {
    return this.feedService.findMany(threadId, session.user.id);
  }

  @Post('trigger-scheduler')
  getFeeds() {
    this.feedService.getFeeds();
    return { message: 'Scheduler triggered' };
  }

  @Get(':id/download')
  donwload(@Param('id') id: string) {
    return this.feedService.download(id);
  }
}
