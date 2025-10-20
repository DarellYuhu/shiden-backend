import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreatePushSubscriptionSchema = z
  .object({
    data: z.object().loose(),
    userId: z.string(),
  })
  .required();
export class CreatePushSubscriptionDto extends createZodDto(
  CreatePushSubscriptionSchema,
) {}
