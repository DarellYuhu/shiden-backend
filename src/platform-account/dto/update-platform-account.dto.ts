import z from 'zod';
import { createZodDto } from 'nestjs-zod';

const UpdatePlatformAccountSchema = z
  .object({
    username: z.string().nonempty(),
    signature: z.string().optional().nullable(),
  })
  .partial();
export class UpdatePlatformAccountDto extends createZodDto(
  UpdatePlatformAccountSchema,
) {}
