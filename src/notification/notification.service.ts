import { Injectable } from '@nestjs/common';
import { workflow } from '@novu/framework/nest';
import { z } from 'zod';

@Injectable()
export class NotificationService {
  constructor() {}

  registerSubscriber() {}

  newFeedsAdded() {
    return workflow(
      'new-feeds',
      async (e) => {
        const payload = e.payload as NewFeedsDto;
        await e.step.inApp('in-app', () => {
          return {
            subject: 'New feeds arived',
            body: `${payload.numOfFeeds} new contents arrived for you`,
          };
        });
      },
      { payloadSchema: NewFeedsSchema },
    );
  }
}

const NewFeedsSchema = z.object({ numOfFeeds: z.number().positive() });
type NewFeedsDto = z.infer<typeof NewFeedsSchema>;
