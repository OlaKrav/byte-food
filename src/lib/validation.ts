import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .trim()
  .toLowerCase()
  .min(1, 'Email cannot be empty')
  .max(254, 'Email is too long (maximum 254 characters)')
  .email('Invalid email format');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password is too long (maximum 128 characters)')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .trim()
  .max(100, 'Name is too long (maximum 100 characters)')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, hyphens, and apostrophes'
  )
  .optional()
  .or(z.literal('').transform(() => undefined));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, 'Name is too long (maximum 100 characters)')
    .regex(
      /^[a-zA-Z\s'-]*$/,
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    )
    .optional()
    .or(z.literal('')),
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
