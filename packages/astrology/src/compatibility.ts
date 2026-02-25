import type { BaziChart } from '@horo/shared';

/**
 * PLACEHOLDER: Calculate compatibility between two Bazi charts
 *
 * Compatibility factors:
 * - Element interactions (生 supporting, 克 controlling, 合 combining)
 * - Branch relationships (六合, 三合, 六冲, etc.)
 * - Stem interactions
 *
 * Returns score 0-100 and detailed analysis
 *
 * TODO: Implement full compatibility algorithm
 */
export function calculateCompatibility(
  chartA: BaziChart,
  chartB: BaziChart
): {
  score: number;
  elementHarmony: number;
  branchHarmony: number;
  overallAnalysis: string;
  strengths: string[];
  challenges: string[];
} {
  // Mock implementation
  return {
    score: 75,
    elementHarmony: 80,
    branchHarmony: 70,
    overallAnalysis: 'ความเข้ากันได้อยู่ในระดับดี มีจุดเด่นในการเติมเต็มกัน',
    strengths: [
      'องค์ประกอบธาตุสนับสนุนซึ่งกันและกัน',
      'มีความเข้าใจและเคารพซึ่งกันและกัน',
    ],
    challenges: [
      'อาจมีความขัดแย้งเรื่องการตัดสินใจบางครั้ง',
      'ควรให้พื้นที่ส่วนตัวแก่กัน',
    ],
  };
}

/**
 * Calculate element interaction type
 */
export function getElementInteraction(
  element1: string,
  element2: string
): 'supporting' | 'controlling' | 'combining' | 'neutral' {
  // Simplified mock
  if (element1 === element2) return 'combining';

  const supporting = {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood',
  };

  if (supporting[element1 as keyof typeof supporting] === element2) {
    return 'supporting';
  }

  return 'neutral';
}
