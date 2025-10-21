import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { type NovuPushPayload } from 'types';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('push/subscription')
  subscribeUser(@Body() payload: CreatePushSubscriptionDto) {
    return this.notificationService.subscribeUser(payload);
  }

  @Post('test/new-feeds')
  async trigger() {
    if (process.env.NODE_ENV !== 'development')
      return { message: 'this only works on development' };
    const huhi = await this.notificationService.newFeedsAdded(
      'YEgTskK9pzGEow6mvsDHGHLHPzgTDkSE',
      { count: 10 },
    );
    return huhi.result;
  }

  @Post('webhook')
  async webhook(@Body() payload: NovuPushPayload) {
    await this.notificationService.sendPushNotification(
      { title: payload.title, body: payload.content },
      payload.payload.subscriber.subscriberId,
    );
    return { message: 'notification send successfully!' };
  }
}
