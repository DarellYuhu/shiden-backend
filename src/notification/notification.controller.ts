import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '@thallesp/nestjs-better-auth';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('push/subscription')
  subscribeUser(@Body() payload: CreatePushSubscriptionDto) {
    return this.notificationService.subscribeUser(payload);
  }

  @Post('trigger-new-feeds')
  async trigger() {
    const huhi = await this.notificationService.newFeedsAdded().trigger({
      to: { subscriberId: '68ef55fd712c63b6bfb0d197' },
    });
    return huhi.data;
  }

  @Post('webhook')
  webhook(@Body() payload: string) {
    console.log(payload);
    return { message: 'webhook sent' };
  }
}
