import { z } from 'zod';

export const GenderSchema = z.enum(['male', 'female']);
export type Gender = z.infer<typeof GenderSchema>;

export const BirthTimeSchema = z.object({
  period: z.string(), // Thai time period name
  chineseHour: z.number().min(0).max(23), // 時辰 mapped to 0-23 hour
  isUnknown: z.boolean().default(false),
});
export type BirthTime = z.infer<typeof BirthTimeSchema>;

export const BirthProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  birthDate: z.string().datetime(), // ISO format
  gender: GenderSchema,
  birthTime: BirthTimeSchema.optional(),
});
export type BirthProfile = z.infer<typeof BirthProfileSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  supabaseUid: z.string().optional(),
  name: z.string(),
  email: z.string().email().optional(),
  provider: z.enum(['google', 'x', 'guest']).optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;
