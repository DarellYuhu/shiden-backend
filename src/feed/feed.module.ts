import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule.register({ baseURL: process.env.SENTO_BASE_URL })],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
