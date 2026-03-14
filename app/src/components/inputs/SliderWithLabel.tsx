'use client';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
  userSet?: boolean;
  onInfoClick?: () => void;
}

export function SliderWithLabel({ label, value, min, max, step, onChange, formatValue, userSet, onInfoClick }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {onInfoClick && (
            <button
              onClick={onInfoClick}
              className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-xs flex items-center justify-center leading-none"
              aria-label="설명 보기"
            >
              i
            </button>
          )}
          {userSet && (
            <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full font-medium">
              직접입력
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-blue-600">{formatValue(value)}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center justify-center"
        >
          +
        </button>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
}
