import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FeedService } from './feed.service';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { FeedScheduler } from './feed.scheduler';

@Controller('feeds')
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly feedScheduler: FeedScheduler,
  ) {}

  @Get()
  findMany(
    @Session() session: UserSession,
    @Query('thread_id') threadId: string,
  ) {
    return this.feedService.findMany(threadId, session.user.id);
  }

  @Post('trigger-scheduler')
  getFeeds() {
    this.feedScheduler.getFeeds();
    return { message: 'Scheduler triggered' };
  }

  @Get(':id/download')
  donwload(@Param('id') id: string) {
    return this.feedService.download(id);
  }
}
