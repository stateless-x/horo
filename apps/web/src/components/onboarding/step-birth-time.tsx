'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card } from '@horo/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { THAI_TIME_PERIODS } from '@horo/shared';

/**
 * Step 5: Birth Time
 *
 * "เจ้าเกิดตอนเช้า หรือ ตอนมืด"
 * - Period selector with Thai time names
 * - Map to Chinese 2-hour periods (時辰): 12 periods
 * - Include "ไม่ทราบ" (don't know) option → skips Bazi, uses Thai astrology only
 */
export function StepBirthTime() {
  const { updateProfile, nextStep } = useOnboardingStore();
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedPeriod(index);
  };

  const handleUnknown = () => {
    updateProfile({
      birthTime: {
        period: 'unknown',
        chineseHour: 0,
        isUnknown: true,
      },
    });
    nextStep();
  };

  const handleSubmit = () => {
    if (selectedPeriod !== null) {
      const period = THAI_TIME_PERIODS[selectedPeriod];
      updateProfile({
        birthTime: {
          period: period.name,
          chineseHour: period.chineseHour,
          isUnknown: false,
        },
      });
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-2xl space-y-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl text-center text-ghostWhite font-heading"
        >
          เจ้าเกิดตอนเช้า หรือ ตอนมืด
        </motion.h1>

        <div className="space-y-6">
          {/* Time Period Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {THAI_TIME_PERIODS.map((period, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(index)}
              >
                <Card
                  className={`p-4 h-20 flex flex-col items-center justify-center transition-all ${
                    selectedPeriod === index
                      ? 'border-royalPurple shadow-[0_0_20px_rgba(107,33,168,0.5)]'
                      : 'hover:border-amethyst'
                  }`}
                >
                  <p className="text-sm text-ashGray">{period.label}</p>
                  <p className="text-base font-heading text-ghostWhite">
                    {period.name}
                  </p>
                </Card>
              </motion.button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              disabled={selectedPeriod === null}
            >
              ถัดไป
            </Button>

            <button
              onClick={handleUnknown}
              className="w-full text-ashGray hover:text-ghostWhite text-sm transition-colors"
            >
              ไม่ทราบเวลาเกิด
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
