'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@horo/ui';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Full Chart / Deep Reading Screen
 *
 * Features:
 * - Complete Bazi Four Pillars chart
 * - 10-year 大運 cycle timeline (swipeable)
 * - Thai astrology life rhythm analysis
 * - AI narrative combining both systems
 *
 * Protected route - requires authentication
 */
export default function ChartPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!session && !sessionLoading) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  // Show loading state while checking session
  if (sessionLoading || !session) {
    return (
      <div className="min-h-screen bg-voidBlack flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-16 h-16 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-heading text-ghostWhite">ดวงชะตาแบบเต็ม</h1>
          <p className="text-ashGray mt-2">Four Pillars of Destiny (四柱命理)</p>
        </motion.div>

        {/* Four Pillars Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>สี่เสาชะตา</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'ปี (Year)', stem: 'ที่ว้อ', branch: 'ระกา' },
                  { label: 'เดือน (Month)', stem: 'เบี้ยง', branch: 'อิน' },
                  { label: 'วัน (Day)', stem: 'ว่อ', branch: 'ฉิ้น' },
                  { label: 'ชั่วโมง (Hour)', stem: 'เก้ง', branch: 'ว่อ' },
                ].map((pillar) => (
                  <div
                    key={pillar.label}
                    className="bg-deepNight border border-darkPurple rounded-lg p-4 text-center space-y-2"
                  >
                    <p className="text-xs text-ashGray">{pillar.label}</p>
                    <div className="space-y-1">
                      <p className="text-lg font-heading text-amethyst">
                        {pillar.stem}
                      </p>
                      <p className="text-lg font-heading text-ghostWhite">
                        {pillar.branch}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-darkPurple/30 rounded-lg">
                <p className="text-sm text-ashGray mb-2">จุ๊ของเจ้า (Day Master)</p>
                <p className="text-3xl font-heading text-royalPurple">ว่อ (Earth)</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 10-Year Luck Cycles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>ช่วงชีวิต 10 ปี (大運)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4">
                  {[
                    { age: '0-9', stem: 'ที่ว้อ', branch: 'ระกา' },
                    { age: '10-19', stem: 'ยี', branch: 'เซาะ' },
                    { age: '20-29', stem: 'เบี้ยง', branch: 'อิน' },
                    { age: '30-39', stem: 'ติ้ง', branch: 'เหม่า' },
                    { age: '40-49', stem: 'ว่อ', branch: 'ฉิ้น' },
                    { age: '50-59', stem: 'จี้', branch: 'ซื้อ' },
                  ].map((cycle) => (
                    <div
                      key={cycle.age}
                      className="flex-shrink-0 w-32 bg-deepNight border border-darkPurple rounded-lg p-4 text-center space-y-2"
                    >
                      <p className="text-xs text-ashGray">{cycle.age} ปี</p>
                      <div className="space-y-1">
                        <p className="text-base font-heading text-amethyst">
                          {cycle.stem}
                        </p>
                        <p className="text-base font-heading text-ghostWhite">
                          {cycle.branch}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Deep Reading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>คำทำนายโดยละเอียด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 font-oracle font-light text-ghostWhite/90 leading-relaxed">
                <p>
                  เจ้าเกิดในปีที่ว้อระกา องค์ประกอบหลักคือดิน
                  บุคลิกภาพของเจ้ามีความมั่นคง น่าเชื่อถือ และใจกว้าง
                  คนที่เกิดในองค์ประกอบดินมักจะเป็นผู้ที่มีความรับผิดชอบสูง
                  และชอบช่วยเหลือผู้อื่น
                </p>
                <p>
                  ในช่วงชีวิตปัจจุบันของเจ้า พลังงานขององค์ประกอบไฟและดินเข้มแข็ง
                  ทำให้เป็นช่วงเวลาที่ดีสำหรับการเติบโตในหน้าที่การงาน
                  อย่างไรก็ตามควระวังเรื่องสุขภาพเกี่ยวกับระบบย่อยอาหาร
                </p>
                <p>
                  จากโหราศาสตร์ไทย เจ้าเกิดวันพฤหัสบดี
                  มีดาวพฤหัสบดีเป็นดาวประจำวันเกิด
                  ทำให้เจ้ามีโชคลาภและมีปัญญาดี
                  เหมาะกับการประกอบธุรกิจหรือการเงินการธนาคาร
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
