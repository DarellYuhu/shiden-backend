import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const DeleteMembersSchema = z
  .object({
    userIds: z.array(z.string()),
  })
  .partial();
export class DeleteMembersDto extends createZodDto(DeleteMembersSchema) {}
