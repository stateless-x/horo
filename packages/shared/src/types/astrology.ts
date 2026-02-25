import { z } from 'zod';

// Chinese Five Elements
export const ElementSchema = z.enum(['wood', 'fire', 'earth', 'metal', 'water']);
export type Element = z.infer<typeof ElementSchema>;

// Heavenly Stems (天干)
export const HeavenlyStemSchema = z.enum([
  'jia', 'yi',    // Wood
  'bing', 'ding', // Fire
  'wu', 'ji',     // Earth
  'geng', 'xin',  // Metal
  'ren', 'gui'    // Water
]);
export type HeavenlyStem = z.infer<typeof HeavenlyStemSchema>;

// Earthly Branches (地支)
export const EarthlyBranchSchema = z.enum([
  'zi', 'chou', 'yin', 'mao', 'chen', 'si',
  'wu', 'wei', 'shen', 'you', 'xu', 'hai'
]);
export type EarthlyBranch = z.infer<typeof EarthlyBranchSchema>;

// Pillar (柱) - combination of Stem and Branch
export const PillarSchema = z.object({
  stem: HeavenlyStemSchema,
  branch: EarthlyBranchSchema,
});
export type Pillar = z.infer<typeof PillarSchema>;

// Four Pillars (四柱)
export const BaziChartSchema = z.object({
  yearPillar: PillarSchema,
  monthPillar: PillarSchema,
  dayPillar: PillarSchema,
  hourPillar: PillarSchema.optional(), // Optional if birth time unknown
  dayMaster: HeavenlyStemSchema, // Day Stem (日主)
  element: ElementSchema, // Primary element
});
export type BaziChart = z.infer<typeof BaziChartSchema>;

// 10-Year Luck Cycles (大運)
export const LuckCycleSchema = z.object({
  pillar: PillarSchema,
  startAge: z.number(),
  endAge: z.number(),
  startYear: z.number(),
  endYear: z.number(),
});
export type LuckCycle = z.infer<typeof LuckCycleSchema>;

// Thai Astrology Day (วันเกิด)
export const ThaiDaySchema = z.enum([
  'sunday', 'monday', 'tuesday', 'wednesday_day',
  'wednesday_night', 'thursday', 'friday', 'saturday'
]);
export type ThaiDay = z.infer<typeof ThaiDaySchema>;

// Thai Astrology Result
export const ThaiAstrologySchema = z.object({
  day: ThaiDaySchema,
  color: z.string(),
  planet: z.string(),
  buddhaPosition: z.string(), // Buddha posture for birth day
  personality: z.string(),
  luckyNumber: z.number(),
  luckyDirection: z.string(),
});
export type ThaiAstrology = z.infer<typeof ThaiAstrologySchema>;
