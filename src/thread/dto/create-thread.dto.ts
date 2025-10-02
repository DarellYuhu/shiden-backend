import { createZodDto } from 'nestjs-zod';
import z from 'zod/v4';

const CreateThreadSchema = z
  .object({
    name: z.string().nonempty(),
    description: z.string().nonempty(),
    sources: z.array(z.string().nonempty()).nonempty(),
    memberIds: z.array(z.string().nonempty()).nonempty(),
  })
  .required({ name: true, sources: true });

export class CreateThreadDto extends createZodDto(CreateThreadSchema) {}
