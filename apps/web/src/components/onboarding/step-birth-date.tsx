'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@horo/ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { THAI_MONTHS, BE_OFFSET, toGregorianYear } from '@horo/shared';

/**
 * Step 3: Birth Date
 *
 * "อยากรู้ดวงชะตาของเจ้างั้นรึ บอกวันเกิดของเจ้ามาสิ"
 * - Custom date picker (3 scroll wheels: day 1-31, month ม.ค.-ธ.ค., year 2500-2569 BE)
 * - NOT native HTML date picker
 * - Store as ISO internally, show Buddhist Era to users
 */
export function StepBirthDate() {
  const { updateProfile, nextStep } = useOnboardingStore();

  const currentYear = new Date().getFullYear() + BE_OFFSET;
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(currentYear - 25); // Default to 25 years old

  const handleSubmit = () => {
    // Convert Buddhist Era to Gregorian
    const gregorianYear = toGregorianYear(year);
    const date = new Date(gregorianYear, month, day);

    updateProfile({
      birthDate: date.toISOString(),
    });

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
          className="text-2xl md:text-3xl text-center text-ghostWhite font-heading leading-relaxed"
        >
          อยากรู้ดวงชะตาของเจ้างั้นรึ
          <br />
          บอกวันเกิดของเจ้ามาสิ
        </motion.h1>

        <div className="space-y-6">
          {/* Date Picker Wheels */}
          <div className="flex gap-4 justify-center">
            {/* Day */}
            <div className="flex-1">
              <label className="block text-sm text-ashGray mb-2 text-center">
                วัน
              </label>
              <select
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value))}
                className="w-full h-48 bg-deepNight border border-darkPurple rounded-lg text-center text-lg text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto"
                size={7}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d} className="py-2">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Month */}
            <div className="flex-1">
              <label className="block text-sm text-ashGray mb-2 text-center">
                เดือน
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
                className="w-full h-48 bg-deepNight border border-darkPurple rounded-lg text-center text-lg text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto"
                size={7}
              >
                {THAI_MONTHS.map((m, i) => (
                  <option key={i} value={i} className="py-2">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Year (Buddhist Era) */}
            <div className="flex-1">
              <label className="block text-sm text-ashGray mb-2 text-center">
                พ.ศ.
              </label>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full h-48 bg-deepNight border border-darkPurple rounded-lg text-center text-lg text-ghostWhite focus:ring-2 focus:ring-royalPurple focus:border-transparent overflow-y-auto"
                size={7}
              >
                {Array.from({ length: 70 }, (_, i) => currentYear - i).map((y) => (
                  <option key={y} value={y} className="py-2">
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full">
            ถัดไป
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
