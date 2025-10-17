import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { FeedScheduler } from './feed.scheduler';
import { GetFeedQueryDto } from './dto/get-feed-query.dto';

@Controller('feeds')
@UseGuards(AuthGuard)
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly feedScheduler: FeedScheduler,
  ) {}

  @Get()
  findMany(@Query() query: GetFeedQueryDto, @Session() session: UserSession) {
    return this.feedService.findMany(session.user.id, query);
  }

  @Get(':id')
  findUnique(@Param('id') id: string) {
    return this.feedService.findUnique(id);
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
