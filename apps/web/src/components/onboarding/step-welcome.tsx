'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Step 1: Welcome Animation
 *
 * Full-screen video (horo.webm):
 * - Rinnegan-inspired eye behind Gate of Truth door
 * - Gate slides open → eye appears → stares → closes → 6 smaller eyes appear then vanish
 * - Must feel sacred and unsettling
 */
export function StepWelcome() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { nextStep } = useOnboardingStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // Auto-advance to next step when video ends
      setTimeout(() => {
        nextStep();
      }, 500);
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [nextStep]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-voidBlack flex items-center justify-center"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        src="/horo.webm"
      />

      {/* Skip button for impatient users */}
      <button
        onClick={nextStep}
        className="absolute bottom-8 right-8 text-ashGray/50 hover:text-ghostWhite text-sm transition-colors"
      >
        ข้าม
      </button>
    </motion.div>
  );
}
