import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const GetMembersQuerySchema = z
  .object({
    search: z.string(),
  })
  .partial();
export class GetMembersQueryDto extends createZodDto(GetMembersQuerySchema) {}
