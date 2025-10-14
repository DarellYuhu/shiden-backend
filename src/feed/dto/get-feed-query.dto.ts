import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

const GetFeedQuerySchema = z
  .object({
    limit: z.number().positive(),
    thread_id: z.string(),
    less_than: z.enum(['3d', '7d', '30d']),
    cursor: z
      .object({ created_at: z.iso.datetime(), id: z.string() })
      .required(),
  })
  .partial();
export class GetFeedQueryDto extends createZodDto(GetFeedQuerySchema) {}
