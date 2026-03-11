'use client';

import type { PresetOption } from '@/types';

interface Props {
  presets: PresetOption[];
  currentValue: number;
  onSelect: (value: number) => void;
}

export function PresetButtons({ presets, currentValue, onSelect }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => onSelect(preset.value)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            currentValue === preset.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 active:bg-blue-50 active:text-blue-600'
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
