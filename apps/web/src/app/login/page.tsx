'use client';

import { motion } from 'framer-motion';
import { Button } from '@horo/ui';
import { signIn, useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Login Page
 *
 * Compact login page for returning users who already have an account.
 * Shows only authentication options without full onboarding flow.
 *
 * This route is for:
 * - Users who clicked "เข้าสู่ระบบ" from landing page
 * - Returning users who want to access their saved fortune readings
 */
export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session && !isPending) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  const handleGoogleLogin = async () => {
    await signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };

  const handleXLogin = async () => {
    await signIn.social({
      provider: 'twitter',
      callbackURL: '/dashboard',
    });
  };

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <div className="text-ghostWhite text-lg font-oracle">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-voidBlack flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl md:text-4xl text-ghostWhite font-heading">
            ยินดีต้อนรับกลับมา
          </h1>
          <p className="text-ashGray font-oracle">
            เข้าสู่ระบบเพื่อดูดวงชะตาของเจ้า
          </p>
        </motion.div>

        {/* Login Buttons */}
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
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-3"
        >
          <p className="text-sm text-ashGray font-oracle">
            ยังไม่มีบัญชี?{' '}
            <Link
              href="/fortune"
              className="text-amethyst hover:text-lavenderGlow underline"
            >
              ดูดวงของเจ้า
            </Link>
          </p>
          <Link
            href="/"
            className="block text-sm text-ashGray/70 hover:text-ashGray transition-colors"
          >
            ← กลับสู่หน้าหลัก
          </Link>
        </motion.div>

        {/* Legal Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-xs text-ashGray/70 text-center font-oracle"
        >
          เมื่อเข้าสู่ระบบ เจ้ายอมรับ
          <br />
          เงื่อนไขการใช้งานและนโยบายความเป็นส่วนตัวของเรา
        </motion.p>
      </motion.div>
    </div>
  );
}
