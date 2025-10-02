import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class FeedService {
  private SENTO_BASE_URL = process.env.SENTO_BASE_URL;
  private NODE_ENV = process.env.NODE_ENV;
  constructor(
    private scheduler: SchedulerRegistry,
    private http: HttpService,
  ) {}

  // @Cron(CronExpression.EVERY_5_SECONDS, { name: 'fetch-feeds-scheduler' })
  async getFeeds() {
    if (this.NODE_ENV) this.scheduler.deleteCronJob('fetch-feeds-scheduler');
    const { data } = await lastValueFrom(
      this.http.get('/contents', { baseURL: this.SENTO_BASE_URL }),
    );
    // console.log(data);
  }
}
