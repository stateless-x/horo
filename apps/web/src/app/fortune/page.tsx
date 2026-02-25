'use client';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Fortune Telling Onboarding Page
 *
 * Full 8-step onboarding flow:
 * 1. Welcome animation
 * 2. Name input
 * 3. Birth date picker
 * 4. Gender selection
 * 5. Birth time input
 * 6. Teaser result (value shown BEFORE auth)
 * 7. Auth prompt (Google/X OAuth)
 * 8. Redirect to dashboard
 *
 * This route is for:
 * - First-time users who clicked "ดูดวงของเจ้า" from landing page
 * - Users who want to create a new fortune reading
 */
export default function FortunePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  // (they should use /login if they want to log in again)
  useEffect(() => {
    if (session && !isPending) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <div className="text-ghostWhite text-lg font-oracle">กำลังโหลด...</div>
      </div>
    );
  }

  // Show onboarding flow for non-authenticated users
  return <OnboardingFlow />;
}
