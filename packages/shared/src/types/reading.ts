import { z } from 'zod';

export const DailyReadingSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  date: z.string().datetime(),
  content: z.string(),
  luckyNumber: z.number().optional(),
  luckyColor: z.string().optional(),
  luckyDirection: z.string().optional(),
  elementEnergy: z.record(z.string(), z.number()), // element -> strength percentage
  createdAt: z.string().datetime(),
});
export type DailyReading = z.infer<typeof DailyReadingSchema>;

export const CompatibilityResultSchema = z.object({
  id: z.string().uuid(),
  profileAId: z.string().uuid(),
  profileBId: z.string().uuid(),
  score: z.number().min(0).max(100),
  analysis: z.string(),
  shareToken: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type CompatibilityResult = z.infer<typeof CompatibilityResultSchema>;

export const TeaserResultSchema = z.object({
  elementType: z.string(),
  personality: z.string(),
  todaySnippet: z.string(),
});
export type TeaserResult = z.infer<typeof TeaserResultSchema>;
