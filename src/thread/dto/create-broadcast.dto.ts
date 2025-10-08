import { BroadcastType } from 'generated/prisma';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateBroadcastSchema = z
  .object({
    message: z.string().nonempty(),
    link: z.url().nonempty(),
    type: z.enum(BroadcastType),
  })
  .required({ message: true });
export class CreateBroadcastDto extends createZodDto(CreateBroadcastSchema) {}
