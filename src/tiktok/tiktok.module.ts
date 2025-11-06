import { Module } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { HttpModule } from '@nestjs/axios';
import { TiktokScheduler } from './tiktok.scheduler';

@Module({
  imports: [
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 5,
      baseURL: 'https://api22-normal-c-alisg.tiktokv.com',
    }),
  ],
  providers: [TiktokService, TiktokScheduler],
  exports: [TiktokService],
})
export class TiktokModule {}
