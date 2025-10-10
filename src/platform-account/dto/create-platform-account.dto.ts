import { Platform } from 'generated/prisma';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreatePlatformAccountSchema = z
  .object({
    data: z
      .array(
        z
          .object({
            platform: z.enum(Platform),
            username: z.string().nonempty(),
            signature: z.string(),
          })
          .partial({ signature: true }),
      )
      .nonempty(),
  })
  .required();

export class CreatePlatformAccountDto extends createZodDto(
  CreatePlatformAccountSchema,
) {}
