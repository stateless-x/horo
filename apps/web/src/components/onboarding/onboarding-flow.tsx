'use client';

import { useOnboardingStore } from '@/stores/onboarding';
import { StepWelcome } from './step-welcome';
import { StepName } from './step-name';
import { StepBirthDate } from './step-birth-date';
import { StepGender } from './step-gender';
import { StepBirthTime } from './step-birth-time';
import { StepTeaser } from './step-teaser';
import { StepAuth } from './step-auth';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Main onboarding flow component
 * Orchestrates all 8 steps with animations
 */
export function OnboardingFlow() {
  const { currentStep } = useOnboardingStore();
  const router = useRouter();

  // Handle navigation to dashboard
  useEffect(() => {
    if (currentStep === 'dashboard') {
      router.push('/dashboard');
    }
  }, [currentStep, router]);

  return (
    <div className="relative min-h-screen bg-voidBlack">
      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && <StepWelcome key="welcome" />}
        {currentStep === 'name' && <StepName key="name" />}
        {currentStep === 'birthDate' && <StepBirthDate key="birthDate" />}
        {currentStep === 'gender' && <StepGender key="gender" />}
        {currentStep === 'birthTime' && <StepBirthTime key="birthTime" />}
        {currentStep === 'teaser' && <StepTeaser key="teaser" />}
        {currentStep === 'auth' && <StepAuth key="auth" />}
      </AnimatePresence>

      {/* Progress indicator */}
      {currentStep !== 'welcome' && currentStep !== 'dashboard' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-2">
            {['name', 'birthDate', 'gender', 'birthTime', 'teaser', 'auth'].map((step) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'bg-royalPurple w-8'
                    : 'bg-darkPurple'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
