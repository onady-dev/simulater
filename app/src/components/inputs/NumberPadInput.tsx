'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatWonCompact } from '@/lib/utils/format';
import { PresetButtons } from './PresetButtons';
import type { PresetOption } from '@/types';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  presets: PresetOption[];
  min: number;
  max: number;
  step: number;
  description?: string;
  className?: string;
  onSettingsClick?: () => void;
}

export function NumberPadInput({
  label,
  value,
  onChange,
  unit,
  presets,
  min,
  max,
  step,
  description,
  className,
  onSettingsClick,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  const openSheet = () => {
    setDraft(value);
    setIsOpen(true);
  };

  const confirm = () => {
    onChange(draft);
    setIsOpen(false);
  };

  return (
    <>
      {/* 카드 wrapper: div로 감싸서 settings 버튼과 main 버튼을 형제로 배치 */}
      <div
        className={`relative bg-white rounded-2xl shadow-sm border border-gray-100${className ? ` ${className}` : ''}`}
      >
        <button
          onClick={openSheet}
          className="w-full p-5 text-left active:scale-[0.98] transition-transform"
        >
          {description && (
            <p className="text-xs text-gray-400 mb-1">{description}</p>
          )}
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatWonCompact(value)}
            <span className="text-base font-normal text-gray-400 ml-1">{unit}</span>
          </p>
        </button>

        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="상세 설정"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="relative bg-white rounded-t-3xl px-5 pt-5 pb-10 space-y-5"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
              <p className="text-center text-base font-semibold text-gray-800">{label}</p>
              <p className="text-center text-4xl font-bold text-blue-500">
                {formatWonCompact(draft)}{' '}
                <span className="text-xl text-gray-400">{unit}</span>
              </p>

              <PresetButtons
                presets={presets}
                currentValue={draft}
                onSelect={setDraft}
              />

              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={draft}
                onChange={(e) => setDraft(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatWonCompact(min)} {unit}</span>
                <span>{formatWonCompact(max)} {unit}</span>
              </div>

              <button
                onClick={confirm}
                className="w-full py-4 bg-blue-500 text-white rounded-2xl text-lg font-bold active:bg-blue-600 transition-colors"
              >
                확인
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
