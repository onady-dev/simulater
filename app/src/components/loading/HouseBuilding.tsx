'use client';

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

interface HouseBuildingProps {
  stage: 1 | 2 | 3;
}

const brickRowVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const brickVariants: Variants = {
  hidden: { scaleY: 0, opacity: 0 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 400, damping: 20 },
  },
};

const popVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 500, damping: 18 },
  },
};

function BrickRow({ offset }: { offset: boolean }) {
  return (
    <motion.div
      variants={brickRowVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-[2px]"
      style={{ paddingLeft: offset ? 18 : 0 }}
    >
      {Array.from({ length: offset ? 3 : 4 }).map((_, i) => (
        <motion.div
          key={i}
          variants={brickVariants}
          className="h-4 rounded-sm bg-amber-400"
          style={{ width: offset ? 28 : 22 }}
        />
      ))}
    </motion.div>
  );
}

function Stage1() {
  return (
    <div className="flex flex-col items-center justify-end" style={{ height: 140 }}>
      <motion.div
        className="absolute top-2 left-8 w-14 h-6 bg-sky-100 rounded-full opacity-80"
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-6 right-6 w-10 h-5 bg-sky-100 rounded-full opacity-60"
        animate={{ x: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="flex flex-col items-center mb-1"
        initial={{ scale: 0, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring' as const, stiffness: 400, damping: 14, delay: 0.3 }}
      >
        <div className="w-0 h-0 border-l-[0px] border-r-[14px] border-b-[10px] border-r-transparent border-b-red-500 ml-[2px]" />
        <div className="w-[2px] h-10 bg-gray-600" />
      </motion.div>

      <motion.div
        className="w-full h-8 rounded-t-2xl bg-green-400"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 22 }}
      />
    </div>
  );
}

function Stage2() {
  return (
    <div className="flex flex-col items-center justify-end" style={{ height: 140 }}>
      <motion.div
        className="w-0 h-0"
        style={{
          borderLeft: '52px solid transparent',
          borderRight: '52px solid transparent',
          borderBottom: '36px solid #DC2626',
        }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring' as const, stiffness: 350, damping: 16, delay: 0.55 }}
      />

      <div className="flex flex-col gap-[2px]" style={{ width: 96 }}>
        {[false, true, false, true].map((offset, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <BrickRow offset={offset} />
          </motion.div>
        ))}
      </div>

      <motion.div
        className="absolute right-6 bottom-10 text-2xl select-none"
        animate={{ rotate: [0, -25, 0, -25, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }}
      >
        🔨
      </motion.div>

      <div className="w-full h-8 rounded-t-2xl bg-green-400" />
    </div>
  );
}

function Stage3() {
  return (
    <div className="flex flex-col items-center justify-end" style={{ height: 140 }}>
      <motion.div className="absolute" style={{ top: 4, right: '38%' }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-gray-300 opacity-70"
            initial={{ y: 0, opacity: 0.7, scale: 0.6 }}
            animate={{ y: -28 - i * 8, opacity: 0, scale: 1.4 }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="w-4 h-6 bg-gray-500 rounded-t-sm absolute"
        style={{ top: 24, right: '36%' }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.1 }}
      />

      <div
        className="w-0 h-0"
        style={{
          borderLeft: '52px solid transparent',
          borderRight: '52px solid transparent',
          borderBottom: '36px solid #DC2626',
        }}
      />

      <div className="relative flex flex-col gap-[2px]" style={{ width: 96 }}>
        {[false, true, false, true].map((offset, i) => (
          <BrickRow key={i} offset={offset} />
        ))}

        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-7 h-9 bg-amber-800 rounded-t-lg"
          variants={popVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 absolute right-1.5 top-1/2" />
        </motion.div>

        <motion.div
          className="absolute top-1 left-2 w-6 h-6 bg-sky-200 rounded-sm border-2 border-amber-700"
          variants={popVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35 }}
        />

        <motion.div
          className="absolute top-1 right-2 w-6 h-6 bg-sky-200 rounded-sm border-2 border-amber-700"
          variants={popVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        />
      </div>

      <motion.div
        className="absolute left-4 bottom-8 flex flex-col items-center"
        variants={popVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.6 }}
      >
        <div className="w-0 h-0" style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '22px solid #16a34a' }} />
        <div className="w-2 h-4 bg-amber-800" />
      </motion.div>

      <motion.div
        className="absolute right-4 bottom-8 flex flex-col items-center"
        variants={popVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.75 }}
      >
        <div className="w-0 h-0" style={{ borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '22px solid #16a34a' }} />
        <div className="w-2 h-4 bg-amber-800" />
      </motion.div>

      <div className="w-full h-8 rounded-t-2xl bg-green-400" />
    </div>
  );
}

export function HouseBuilding({ stage }: HouseBuildingProps) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 140 }}>
      {stage === 1 && <Stage1 />}
      {stage === 2 && <Stage2 />}
      {stage === 3 && <Stage3 />}
    </div>
  );
}
