import z from 'zod';

export const userSchema = z.object({
  _id: z.string(),
  displayName: z.string(),
  userName: z.string().optional().nullable(),
  email: z.string(),
  role: z.enum(['admin', 'customer', 'guest']),
  avatar: z.string().optional().default('https://placehold.co/100x100.png'), 
  phone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  isActive: z.boolean(),
});

export const userArraySchema = z.array(userSchema);
export type User = z.infer<typeof userSchema>;
export type UserCredentials = Pick<User, 'email'> & { password: string };
export type UserForm = Pick<User,'email'|'avatar'|'dateOfBirth'|'displayName'|'phone'> & { password: string };
