import { Platform } from 'generated/prisma';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreatePlatformAccountSchema = z
  .object({
    platform: z.enum(Platform),
    username: z.string().nonempty(),
    signature: z.string(),
  })
  .partial({ signature: true });

export class CreatePlatformAccountDto extends createZodDto(
  CreatePlatformAccountSchema,
) {}
