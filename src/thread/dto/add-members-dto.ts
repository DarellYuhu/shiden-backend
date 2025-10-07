import z from 'zod';

export const AddMembersSchema = z
  .array(
    z
      .object({
        id: z.string(),
        name: z.string(),
      })
      .required(),
  )
  .nonempty();
export type AddMembersDto = z.infer<typeof AddMembersSchema>;
