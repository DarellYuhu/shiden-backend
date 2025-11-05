import { createZodDto } from 'nestjs-zod';
import { z } from 'zod/v4';

export const GetStatisticQuerySchema = z
  .object({
    unit: z.enum(['day', 'week', 'month']),
    since: z.iso.datetime().transform((val) => new Date(val)),
    until: z.iso.datetime().transform((val) => new Date(val)),
  })
  .partial();
export class GetStatisticQueryDto extends createZodDto(
  GetStatisticQuerySchema,
) {}
