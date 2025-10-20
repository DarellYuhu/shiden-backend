import { Injectable, OnModuleInit } from '@nestjs/common';
import { workflow } from '@novu/framework/nest';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { JsonObject } from 'generated/prisma/runtime/library';
import webpush from 'web-push';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    webpush.setVapidDetails(
      'mailto:bfi_yuhu@mail.com',
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || '',
    );
  }

  async sendPushNotification(message: string, userId: string) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    await Promise.all(
      subscriptions.map(async (subs) => {
        await webpush.sendNotification(
          subs.subscription as unknown as webpush.PushSubscription,
          'anjay',
        );
      }),
    );
  }

  subscribeUser(payload: CreatePushSubscriptionDto) {
    return this.prisma.pushSubscription.create({
      data: {
        subscription: payload.data as JsonObject,
        userId: payload.userId,
      },
    });
  }

  newFeedsAdded() {
    return workflow('new-feeds', async (e) => {
      await e.step.inApp('in-app', () => {
        return {
          subject: 'New feeds arived',
          body: `New feeds arrived for you`,
        };
      });
      await e.step.push('push', () => {
        return {
          subject: 'New feeds arived',
          body: `New feeds arrived for you`,
        };
      });
    });
  }
}
