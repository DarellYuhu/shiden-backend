import { Module } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      timeout: 8000,
      maxRedirects: 5,
      baseURL: 'https://api22-normal-c-alisg.tiktokv.com',
    }),
  ],
  providers: [TiktokService],
  exports: [TiktokService],
})
export class TiktokModule {}
