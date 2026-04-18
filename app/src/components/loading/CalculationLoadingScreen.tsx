'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HouseBuilding } from './HouseBuilding';

type Stage = 1 | 2 | 3;

const STAGE_DURATION = 1000; // ms per stage

const stageMessages: Record<Stage, string> = {
  1: '부지를 살펴보는 중...',
  2: '열심히 계산하는 중...',
  3: '결과를 정리하는 중...',
};

const stageSubMessages: Record<Stage, string> = {
  1: '취득세·대출이자·기회비용을 불러오고 있어요',
  2: '매수·전세·월세 시나리오를 비교하고 있어요',
  3: '가장 유리한 선택을 찾았어요!',
};

export function CalculationLoadingScreen() {
  const [stage, setStage] = useState<Stage>(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 스테이지 전환 타이머
    const t1 = setTimeout(() => setStage(2), STAGE_DURATION);
    const t2 = setTimeout(() => setStage(3), STAGE_DURATION * 2);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // 프로그레스 바: 3초에 걸쳐 0 → 100
  useEffect(() => {
    const total = 3000;
    const interval = 30;
    const step = (interval / total) * 100;
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p + step;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 py-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-5">
        {/* 하늘 배경 + 집 짓기 애니메이션 */}
        <div
          className="w-full rounded-xl overflow-hidden relative"
          style={{ background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 60%, #f0fdf4 100%)' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <HouseBuilding stage={stage} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 스테이지 인디케이터 */}
        <div className="flex gap-2">
          {([1, 2, 3] as Stage[]).map((s) => (
            <motion.div
              key={s}
              className="h-1.5 rounded-full"
              animate={{
                width: s === stage ? 24 : 8,
                backgroundColor: s <= stage ? '#3182F6' : '#e5e7eb',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* 텍스트 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            className="text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-base font-semibold text-gray-800">
              {stageMessages[stage]}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {stageSubMessages[stage]}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* 프로그레스 바 */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-blue-500"
            style={{ width: `${progress}%` }}
            transition={{ ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}
