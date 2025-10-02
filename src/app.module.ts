import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './auth';
import { FeedModule } from './feed/feed.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthHook } from './core/auth/auth.hook';
import { UserService } from './user/user.service';

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
  ],
  controllers: [AppController],
  providers: [AuthHook, UserService],
})
export class AppModule {}
