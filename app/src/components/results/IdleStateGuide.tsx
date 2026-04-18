'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

const hints = [
  { icon: '🏠', text: '매수가 유리한 조건은?' },
  { icon: '🔑', text: '전세 vs 월세 기회비용 비교' },
  { icon: '📊', text: '몇 년 살아야 매수가 이득?' },
  { icon: '💰', text: '집값 상승 없어도 매수가 나을까?' },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export function IdleStateGuide() {
  return (
    <div className="px-4 py-2">
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="text-4xl"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          🏡
        </motion.div>

        <div className="text-center">
          <p className="text-base font-bold text-gray-800">
            조건을 입력하고 계산해보세요
          </p>
          <p className="text-xs text-gray-400 mt-1">
            취득세·대출이자·기회비용까지 반영한 실질 비교
          </p>
        </div>

        <motion.div
          className="w-full grid grid-cols-2 gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {hints.map((hint) => (
            <motion.div
              key={hint.text}
              variants={itemVariants}
              className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2"
            >
              <span className="text-base">{hint.icon}</span>
              <span className="text-xs text-gray-600 leading-snug">{hint.text}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-blue-400 text-sm font-medium flex items-center gap-1"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>위 조건을 설정한 뒤 계산하기를 눌러보세요</span>
          <span>↑</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
