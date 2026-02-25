'use client';

import { motion } from 'framer-motion';
import { Card } from '@horo/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import type { Gender } from '@horo/shared';

/**
 * Step 4: Gender
 *
 * "แล้วเจ้าเป็นผู้ชาย หรือ ผู้หญิงหล่ะ"
 * - Two large tappable cards (male/female)
 * - Cards glow purple on select
 * - Needed for Bazi 大運 calculation
 */
export function StepGender() {
  const { updateProfile, nextStep } = useOnboardingStore();

  const handleSelect = (gender: Gender) => {
    updateProfile({ gender });
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl text-center text-ghostWhite font-heading"
        >
          แล้วเจ้าเป็นผู้ชาย หรือ ผู้หญิงหล่ะ
        </motion.h1>

        <div className="grid grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('male')}
            className="group"
          >
            <Card className="p-8 h-48 flex flex-col items-center justify-center gap-4 transition-all hover:border-royalPurple hover:shadow-[0_0_20px_rgba(107,33,168,0.3)]">
              <div className="text-6xl">👨</div>
              <p className="text-xl font-heading text-ghostWhite">ผู้ชาย</p>
            </Card>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('female')}
            className="group"
          >
            <Card className="p-8 h-48 flex flex-col items-center justify-center gap-4 transition-all hover:border-royalPurple hover:shadow-[0_0_20px_rgba(107,33,168,0.3)]">
              <div className="text-6xl">👩</div>
              <p className="text-xl font-heading text-ghostWhite">ผู้หญิง</p>
            </Card>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
