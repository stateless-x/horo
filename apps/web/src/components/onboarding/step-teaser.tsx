'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button, OracleText } from '@horo/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { api } from '@/lib/api';

/**
 * Step 6: Teaser Result
 *
 * IMMEDIATE wow moment:
 * - Show element type, brief personality, today's fortune snippet
 * - Call Bazi calculation + Thai astrology engine
 * - AI (Claude) generates 3-4 sentence personalized reading
 * - Letter-by-letter animation for oracle voice
 * - THIS MUST HAPPEN BEFORE AUTH!
 */
export function StepTeaser() {
  const { profile, setTeaserResult, nextStep } = useOnboardingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<{
    elementType: string;
    personality: string;
    todaySnippet: string;
    luckyColor?: string;
    luckyNumber?: number;
  } | null>(null);

  useEffect(() => {
    async function generateTeaser() {
      try {
        setIsLoading(true);

        // Call API to generate teaser
        const data = await api.post<{
          elementType: string;
          personality: string;
          todaySnippet: string;
          luckyColor?: string;
          luckyNumber?: number;
        }>('/fortune/teaser', profile);

        setResult(data);
        setTeaserResult(data);
      } catch (error) {
        console.error('Failed to generate teaser:', error);
        // Show fallback message
        setResult({
          elementType: 'earth',
          personality: 'มีความมั่นคง ไว้ใจได้',
          todaySnippet: 'วันนี้เป็นวันที่ดีสำหรับการเริ่มต้นสิ่งใหม่...',
        });
      } finally {
        setIsLoading(false);
      }
    }

    generateTeaser();
  }, [profile, setTeaserResult]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-16 h-16 mx-auto border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
          />
          <p className="text-ashGray font-oracle text-lg">
            กำลังมองดูดวงชะตาของเจ้า...
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-2xl space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-deepNight border border-darkPurple rounded-lg p-8 space-y-6"
        >
          {/* Element Type */}
          <div className="text-center">
            <p className="text-sm text-ashGray mb-2">องค์ประกอบหลัก</p>
            <p className="text-3xl font-heading text-amethyst capitalize">
              {result?.elementType}
            </p>
          </div>

          {/* Lucky Info */}
          {(result?.luckyColor || result?.luckyNumber) && (
            <div className="flex gap-4 justify-center">
              {result.luckyColor && (
                <div className="text-center">
                  <p className="text-xs text-ashGray mb-1">สีมงคล</p>
                  <p className="text-sm text-ghostWhite">{result.luckyColor}</p>
                </div>
              )}
              {result.luckyNumber && (
                <div className="text-center">
                  <p className="text-xs text-ashGray mb-1">เลขมงคล</p>
                  <p className="text-sm text-ghostWhite">{result.luckyNumber}</p>
                </div>
              )}
            </div>
          )}

          <hr className="border-darkPurple" />

          {/* Oracle Reading */}
          <div className="space-y-4">
            <OracleText
              text={result?.todaySnippet || ''}
              className="text-lg leading-relaxed"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <Button onClick={nextStep} size="lg" className="px-12">
            ดูดวงแบบเต็ม
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
