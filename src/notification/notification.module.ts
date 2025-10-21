import { Global, Module, Provider } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { Novu } from '@novu/api';

const NovuProvider: Provider = {
  provide: Novu,
  useFactory: () => {
    return new Novu({
      secretKey: process.env.NOVU_SECRET_KEY,
      serverURL: process.env.NOVU_API_URL,
    });
  },
};

@Global()
@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NovuProvider],
  exports: [NotificationService],
})
export class NotificationModule {}
