import { Platform } from 'generated/prisma';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const CreateAccountSchema = z
  .object({
    id: z.string().nonempty(),
    username: z.string().nonempty(),
    signature: z.string().nonempty(),
    platform: z.enum(Platform),
    followers: z.number(),
  })
  .partial({ signature: true, followers: true });
export const CreateManyAccountSchema = z.array(CreateAccountSchema);
const CreateManyQuerySchema = z
  .object({
    categoryId: z.string().nonempty(),
  })
  .partial();

export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
export class CreateManyQueryDto extends createZodDto(CreateManyQuerySchema) {}
export class CreateManyAccountDto extends createZodDto(
  CreateManyAccountSchema,
) {}
