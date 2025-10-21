import { Injectable, OnModuleInit } from '@nestjs/common';
// import { workflow } from '@novu/framework/nest';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePushSubscriptionDto } from './dto/create-push-subscription.dto';
import { JsonObject } from 'generated/prisma/runtime/library';
import webpush from 'web-push';
import { ChatOrPushProviderEnum } from '@novu/api/models/components';
import { PustNotificationData } from 'types';
import { Novu } from '@novu/api';

@Injectable()
export class NotificationService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private novu: Novu,
  ) {}

  onModuleInit() {
    webpush.setVapidDetails(
      'mailto:bfi_yuhu@mail.com',
      process.env.VAPID_PUBLIC_KEY || '',
      process.env.VAPID_PRIVATE_KEY || '',
    );
  }

  async sendPushNotification(data: PustNotificationData, userId: string) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });
    const result = await Promise.allSettled(
      subscriptions.map(
        async (subs) =>
          await webpush.sendNotification(
            subs.subscription as unknown as webpush.PushSubscription,
            JSON.stringify(data),
          ),
      ),
    );
    const expiredSubscription = result
      .filter((item) => item.status === 'rejected')
      .map((item) => item.reason as webpush.WebPushError);
    await Promise.all(
      expiredSubscription.map(async (err) => {
        if (err.statusCode === 410) return this.unsubscribeUser(err.endpoint);
      }),
    );
  }

  unsubscribeUser(endopint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { subscription: { path: ['endpoint'], equals: endopint } },
    });
  }

  async subscribeUser(payload: CreatePushSubscriptionDto) {
    await this.novu.subscribers.credentials.update(
      {
        providerId: ChatOrPushProviderEnum.PushWebhook,
        credentials: { channel: '', deviceTokens: ['token1'] },
        integrationIdentifier: 'push-webhook',
      },
      payload.userId,
    );
    return this.prisma.pushSubscription.create({
      data: {
        subscription: payload.data as JsonObject,
        userId: payload.userId,
      },
    });
  }

  newFeedsAdded(subscriberId: string, payload: { count: number }) {
    return this.novu.trigger({
      workflowId: 'new-feeds-5ydk',
      to: subscriberId,
      payload,
    });
  }

  // newFeedsAdded() {
  //   return workflow('new-feeds', async (e) => {
  //     await e.step.inApp('in-app', () => {
  //       return {
  //         subject: 'New feeds arived',
  //         body: `New feeds arrived for you`,
  //       };
  //     });
  //     await e.step.push('push', () => {
  //       return {
  //         subject: 'New feeds arived',
  //         body: `New feeds arrived for you`,
  //       };
  //     });
  //   });
  // }
}
