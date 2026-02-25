import { create } from 'zustand';
import type { BirthProfile } from '@horo/shared';

export type OnboardingStep =
  | 'welcome'
  | 'name'
  | 'birthDate'
  | 'gender'
  | 'birthTime'
  | 'teaser'
  | 'auth'
  | 'dashboard';

interface OnboardingState {
  currentStep: OnboardingStep;
  profile: Partial<BirthProfile>;
  teaserResult: {
    elementType?: string;
    personality?: string;
    todaySnippet?: string;
    luckyColor?: string;
    luckyNumber?: number;
  };

  // Actions
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateProfile: (data: Partial<BirthProfile>) => void;
  setTeaserResult: (result: OnboardingState['teaserResult']) => void;
  reset: () => void;
}

const steps: OnboardingStep[] = [
  'welcome',
  'name',
  'birthDate',
  'gender',
  'birthTime',
  'teaser',
  'auth',
  'dashboard',
];

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 'welcome',
  profile: {},
  teaserResult: {},

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1] });
    }
  },

  updateProfile: (data) =>
    set((state) => ({
      profile: { ...state.profile, ...data },
    })),

  setTeaserResult: (result) => set({ teaserResult: result }),

  reset: () =>
    set({
      currentStep: 'welcome',
      profile: {},
      teaserResult: {},
    }),
}));
