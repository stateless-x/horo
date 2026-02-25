'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@horo/ui';

/**
 * Compatibility / ดูดวงคู่ (VIRAL FEATURE)
 *
 * Features:
 * - Enter partner's birth data OR send invite link
 * - Compatibility analysis
 * - Generate shareable card
 * - Invite flow: User A shares → User B enters data → both see result → User B becomes new user
 */
export default function CompatibilityPage() {
  const [partnerName, setPartnerName] = useState('');
  const [hasResult, setHasResult] = useState(false);

  const handleCalculate = () => {
    // Mock calculation
    setHasResult(true);
  };

  if (hasResult) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h1 className="text-4xl font-heading text-ghostWhite">ดวงคู่ของเจ้า</h1>
            <p className="text-ashGray">ความเข้ากันได้ระหว่างเจ้าและ {partnerName}</p>
          </motion.div>

          {/* Compatibility Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-darkPurple to-deepNight">
              <CardContent className="py-12 text-center space-y-4">
                <p className="text-sm text-ashGray">คะแนนความเข้ากัน</p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="text-7xl font-heading text-amethyst"
                >
                  75
                </motion.div>
                <p className="text-xl text-ghostWhite">ความเข้ากันได้ระดับดี</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>จุดเด่น</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      องค์ประกอบธาตุสนับสนุนซึ่งกันและกัน ทำให้มีความเข้าใจที่ดี
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      ทั้งสองมีเป้าหมายในชีวิตที่คล้ายกัน
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-500 mt-1">✓</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      สามารถเติมเต็มจุดอ่อนของกันและกันได้ดี
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>สิ่งที่ควรระวัง</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">!</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      อาจมีความขัดแย้งเรื่องการตัดสินใจบางครั้ง
                    </p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-500 mt-1">!</span>
                    <p className="text-ghostWhite/90 leading-relaxed">
                      ควรให้พื้นที่ส่วนตัวแก่กัน
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Share Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button size="lg" className="w-full">
              แชร์ผลดูดวงคู่
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-heading text-ghostWhite">ดูดวงคู่</h1>
          <p className="text-ashGray">
            ใส่ข้อมูลคู่ของเจ้าเพื่อดูความเข้ากันได้
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลคู่ของเจ้า</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm text-ashGray mb-2">ชื่อ</label>
                <Input
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="ชื่อคู่ของเจ้า"
                />
              </div>

              <div>
                <label className="block text-sm text-ashGray mb-2">
                  วันเกิด
                </label>
                <div className="text-center py-8 border-2 border-dashed border-darkPurple rounded-lg">
                  <p className="text-ashGray text-sm">
                    เลือกวันเกิด (ระบบเลือกวันที่เหมือนในหน้าแรก)
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCalculate}
                size="lg"
                className="w-full"
                disabled={!partnerName}
              >
                คำนวณความเข้ากัน
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Or Invite */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-darkPurple" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-voidBlack text-ashGray">หรือ</span>
            </div>
          </div>

          <Button variant="outline" size="lg" className="mt-6">
            ส่งลิงก์เชิญให้คู่ของเจ้า
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
