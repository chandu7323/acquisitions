import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.string().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(128),
  role: z.enum(['user', 'admin']).default('user'),
});

export const signinSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({
      required_error: 'Required',
      invalid_type_error: 'Required',
    })
    .min(1, 'Required')
    .min(1), // Prevents empty strings "" from passing
});
