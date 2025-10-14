import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const UpdateContentSchema = z
  .object({
    link: z.string().nonempty(),
  })
  .partial();
export class UpdateContentDto extends createZodDto(UpdateContentSchema) {}
