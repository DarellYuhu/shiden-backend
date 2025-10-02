import { Module } from '@nestjs/common';
import { ThreadService } from './thread.service';
import { ThreadController } from './thread.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.SENTO_BASE_URL,
      headers: { 'X-API-KEY': process.env.SENTO_API_KEY },
    }),
  ],
  controllers: [ThreadController],
  providers: [ThreadService],
})
export class ThreadModule {}
