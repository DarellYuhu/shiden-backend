import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const CreateContentSchema = z
  .object({
    link: z.string().nonempty(),
    feedId: z.string().nonempty(),
    platformAccountId: z.string().nonempty(),
  })
  .partial({ link: true });
const CreateManualContentSchema = z
  .object({
    link: z.string().nonempty(),
    threadMemberId: z.string().nonempty(),
    platformAccountId: z.string().nonempty(),
  })
  .required();

export class CreateContentDto extends createZodDto(CreateContentSchema) {}
export class CreateManualContentDto extends createZodDto(
  CreateManualContentSchema,
) {}
