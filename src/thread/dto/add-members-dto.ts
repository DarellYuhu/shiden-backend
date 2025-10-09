import z from 'zod';

export const AddMembersSchema = z
  .array(
    z
      .object({
        username: z.string(),
      })
      .required(),
  )
  .nonempty();
export type AddMembersDto = z.infer<typeof AddMembersSchema>;
