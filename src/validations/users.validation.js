import { z } from 'zod';

export const userIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('User ID must be a positive integer'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive('User ID must be a positive integer'),
  }),
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address format').optional(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .optional(),
    role: z.enum(['user', 'admin']).optional(),
  }),
});
