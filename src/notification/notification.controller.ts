import { Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@thallesp/nestjs-better-auth';

@Controller('notification')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('trigger-new-feeds')
  async trigger() {
    const huhi = await this.notificationService.newFeedsAdded().trigger({
      to: { subscriberId: '68ef55fd712c63b6bfb0d197' },
      payload: { numOfFeeds: 10 },
    });
    return huhi.data;
  }
}
