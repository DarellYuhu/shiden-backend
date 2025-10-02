import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard, AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';
import { FeedModule } from './feed/feed.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthHook } from './core/auth/auth.hook';
import { UserService } from './user/user.service';
import { ThreadModule } from './thread/thread.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    AccountModule,
    FeedModule,
    AuthModule.forRoot(auth),
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      expandVariables: true,
    }),
    ThreadModule,
  ],
  controllers: [AppController],
  providers: [
    AuthHook,
    UserService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
