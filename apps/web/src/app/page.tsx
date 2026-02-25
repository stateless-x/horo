'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { ClientDate } from '@/components/client-date';

/**
 * Landing Page
 *
 * Entry point for new users. Shows what the app does and provides clear CTAs.
 * Returning users with valid session are automatically redirected to dashboard.
 */
export default function LandingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (session && !isPending) {
      router.push('/dashboard');
    }
  }, [session, isPending, router]);

  // Don't render landing page for authenticated users
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Hero Section with Ambient Video */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Ambient Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          >
            <source src="/horo.webm" type="video/webm" />
          </video>
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-voidBlack/80 via-voidBlack/60 to-voidBlack" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-heading text-ghostWhite mb-6 tracking-tight">
              เปิดประตูสู่ชะตา
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-paleOrchid/80 mb-12 font-oracle font-light">
              ดูดวงด้วยศาสตร์จีนโบราณ × โหราศาสตร์ไทย
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Primary CTA */}
              <Link href="/fortune">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-lg rounded-lg transition-all shadow-lg shadow-royalPurple/50"
                >
                  ดูดวงของเจ้า
                </motion.button>
              </Link>

              {/* Secondary CTA */}
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-4 border-2 border-darkPurple hover:border-amethyst text-ghostWhite font-heading text-lg rounded-lg transition-all"
                >
                  เข้าสู่ระบบ
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-ashGray/60 text-xs flex flex-col items-center gap-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sample Fortune Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4">
              ดวงของเจ้าจะเป็นอย่างไร
            </h2>
            <p className="text-ashGray font-oracle">
              ตัวอย่างดวงที่ผู้ใช้จะได้รับ — ลึกลับและแม่นยำ
            </p>
          </motion.div>

          {/* Blurred Sample Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-deepNight border border-darkPurple rounded-xl p-8 relative overflow-hidden">
              {/* Blur Overlay */}
              <div className="absolute inset-0 backdrop-blur-sm bg-voidBlack/30 z-10 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-paleOrchid text-lg mb-4 font-oracle">
                    เข้าสู่ระบบเพื่อปลดล็อก
                  </p>
                  <Link href="/fortune">
                    <button className="px-6 py-3 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading rounded-lg transition-all">
                      ดูดวงของเจ้า
                    </button>
                  </Link>
                </div>
              </div>

              {/* Sample Content (blurred) */}
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-ashGray mb-2">องค์ประกอบหลัก</p>
                  <p className="text-3xl font-heading text-amethyst">ธาตุไฟ</p>
                </div>
                <hr className="border-darkPurple" />
                <p className="text-ghostWhite font-oracle leading-relaxed">
                  เจ้าถือกำเนิดในราศีแห่งไฟ มีพลังแห่งการเปลี่ยนแปลงและความหลงใหล
                  ช่วงชีวิตนี้ดวงชะตากำลังเปิดประตูใหม่ให้เจ้า...
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Daily Generic Horoscope */}
      <section className="py-20 px-6 bg-deepNight/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading text-ghostWhite mb-4">
              ดวงประจำวันนี้
            </h2>
            <p className="text-ashGray font-oracle">
              <ClientDate />
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-deepNight border border-darkPurple rounded-xl p-8"
          >
            <p className="text-ghostWhite font-oracle text-lg leading-relaxed mb-6">
              วันนี้ธาตุไฟเด่น คนเกิดวันอังคารและวันเสาร์มีโอกาสดี
              เหมาะกับการเริ่มต้นสิ่งใหม่และการตัดสินใจสำคัญ
              ระวังเรื่องการสื่อสารที่อาจเกิดความเข้าใจผิด
            </p>
            <p className="text-ashGray text-sm font-oracle">
              ต้องการดูดวงเฉพาะของเจ้า?{' '}
              <Link
                href="/fortune"
                className="text-amethyst hover:text-lavenderGlow underline"
              >
                ดูดวงตอนนี้
              </Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Systems */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-heading text-ghostWhite text-center mb-16"
          >
            ศาสตร์ที่เราใช้
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Bazi */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-deepNight border border-darkPurple rounded-xl p-8"
            >
              <h3 className="text-2xl font-heading text-amethyst mb-4">
                Bazi (四柱命理)
              </h3>
              <p className="text-ghostWhite font-oracle leading-relaxed mb-4">
                ศาสตร์โหราจีนโบราณที่วิเคราะห์ชะตาชีวิตจากเสาสี่ที่ (ปี เดือน วัน
                ชั่วโมง) และธาตุทั้งห้า
              </p>
              <p className="text-ashGray text-sm font-oracle">
                จุดเด่น: วิเคราะห์วงจรชีวิต 10 ปี และพลังธาตุในชาติ
              </p>
            </motion.div>

            {/* Thai Astrology */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-deepNight border border-darkPurple rounded-xl p-8"
            >
              <h3 className="text-2xl font-heading text-amethyst mb-4">
                โหราศาสตร์ไทย
              </h3>
              <p className="text-ghostWhite font-oracle leading-relaxed mb-4">
                ภูมิปัญญาไทยที่ดูดวงจากวันเกิด นพเคราะห์ และจักรนพคุณ
                เพื่อดูความสัมพันธ์และโชคลาภ
              </p>
              <p className="text-ashGray text-sm font-oracle">
                จุดเด่น: วิเคราะห์ความสัมพันธ์ โชคลาภ และจังหวะเวลา
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-5xl font-heading text-ghostWhite mb-6">
            พร้อมที่จะรู้จักชะตาของเจ้าหรือยัง
          </h2>
          <Link href="/fortune">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-royalPurple hover:bg-amethyst text-ghostWhite font-heading text-xl rounded-lg transition-all shadow-xl shadow-royalPurple/50"
            >
              เริ่มดูดวงเลย
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
