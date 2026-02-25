'use client';

import { motion } from 'framer-motion';
import { Button } from '@horo/ui';
import { useOnboardingStore } from '@/stores/onboarding';

/**
 * Step 7: Auth Prompt
 *
 * "เพื่อเก็บดวงชะตาของเจ้าไว้ เชื่อมบัญชีของเจ้า"
 * - Google OAuth + X.com OAuth buttons
 * - Also show "ข้าม" (Skip) link for guests
 * - User has ALREADY seen value
 * - **CRITICAL: Auth MUST come AFTER teaser result (Step 6)**
 */
export function StepAuth() {
  const { nextStep } = useOnboardingStore();

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login?provider=google`;
  };

  const handleXLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/login?provider=x`;
  };

  const handleSkip = () => {
    // Continue as guest
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h1 className="text-2xl md:text-3xl text-ghostWhite font-heading">
            เพื่อเก็บดวงชะตาของเจ้าไว้
          </h1>
          <p className="text-ashGray">เชื่อมบัญชีของเจ้า</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Google OAuth */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            เข้าสู่ระบบด้วย Google
          </Button>

          {/* X OAuth */}
          <Button
            onClick={handleXLogin}
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            เข้าสู่ระบบด้วย X
          </Button>

          {/* Skip as Guest */}
          <div className="text-center pt-4">
            <button
              onClick={handleSkip}
              className="text-ashGray hover:text-ghostWhite text-sm transition-colors underline"
            >
              ข้าม (ใช้งานแบบผู้เยี่ยมชม)
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-ashGray/70 text-center"
        >
          เมื่อเชื่อมบัญชี เจ้าจะสามารถบันทึกและดูดวงชะตาของเจ้าได้ทุกเมื่อ
        </motion.p>
      </div>
    </motion.div>
  );
}
