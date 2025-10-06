import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateContentSchema = z
  .object({
    link: z.string().nonempty(),
    feedId: z.string().nonempty(),
    platformAccountId: z.string().nonempty(),
  })
  .required();

export class CreateContentDto extends createZodDto(CreateContentSchema) {}
