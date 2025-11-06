import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const GetMembersQuerySchema = z
  .object({
    search: z.string(),
    since: z.iso.datetime().transform((val) => new Date(val)),
    until: z.iso.datetime().transform((val) => new Date(val)),
  })
  .partial();
export class GetMembersQueryDto extends createZodDto(GetMembersQuerySchema) {}
