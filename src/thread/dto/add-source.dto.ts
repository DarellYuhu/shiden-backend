import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const AddSourceSchema = z.object({ sources: z.array(z.string()) });
export class AddSourceDto extends createZodDto(AddSourceSchema) {}
