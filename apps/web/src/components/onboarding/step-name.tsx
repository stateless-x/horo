'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@horo/ui';
import { Button } from '@horo/ui';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Step 2: Name Input
 *
 * "บอกชื่อของเจ้ามาสิ" (Tell me thy name)
 * - Single centered input, auto-focus
 * - Dark field with purple glow on focus
 */
export function StepName() {
  const { profile, updateProfile, nextStep } = useOnboardingStore();
  const [name, setName] = useState(profile.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      updateProfile({ name: name.trim() });
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
      <div className="w-full max-w-md space-y-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl text-center text-ghostWhite font-heading"
        >
          บอกชื่อของเจ้ามาสิ
        </motion.h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ชื่อของเจ้า"
            className="text-center text-lg h-14"
            maxLength={50}
            required
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!name.trim()}
          >
            ถัดไป
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
