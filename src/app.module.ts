import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    AccountModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development'],
      expandVariables: true,
    }),
    MulterModule.register({ limits: { fileSize: 5 * 1024 * 1024 } }),
  ],
  controllers: [AppController],
})
export class AppModule {}
