import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const GetFeedQuerySchema = z
  .object({
    limit: z.number().positive(),
    thread_id: z.string(),
    less_than: z.enum(['3d', '7d', '30d']),
  })
  .partial();

export class GetFeedQueryDto extends createZodDto(GetFeedQuerySchema) {}
