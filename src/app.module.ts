import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AllowAnonymous, AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';
import { FeedModule } from './feed/feed.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthHook } from './core/auth/auth.hook';
import { UserService } from './user/user.service';
import { ThreadModule } from './thread/thread.module';
import { APP_PIPE } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { MinioModule } from './core/minio/minio.module';
import { PlatformAccountModule } from './platform-account/platform-account.module';
import { ContentModule } from './content/content.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { NotificationModule } from './notification/notification.module';
import { NovuModule } from '@novu/framework/nest';
import { NotificationService } from './notification/notification.service';

@Module({
  imports: [
    PrismaModule,
    FeedModule,
    UserModule,
    ThreadModule,
    PlatformAccountModule,
    ContentModule,
    MinioModule,
    NotificationModule,
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      expandVariables: true,
    }),
    NovuModule.registerAsync({
      imports: [NotificationModule],
      inject: [NotificationService],
      useFactory: (notificationService: NotificationService) => ({
        apiPath: '/api/novu',
        workflows: [notificationService.newFeedsAdded()],
        controllerDecorators: [AllowAnonymous()],
      }),
    }),
    AuthModule.forRoot({
      auth,
      disableTrustedOriginsCors: true,
      isGlobal: true,
      disableGlobalAuthGuard: true,
    }),
  ],
  controllers: [AppController],
  providers: [
    AuthHook,
    UserService,
    { provide: APP_PIPE, useClass: ZodValidationPipe },
  ],
})
export class AppModule {}
