'use client';

import Link from 'next/link';
import { useCalculatorStore } from '@/lib/store/calculatorStore';

const navLinks = [
  { href: '/guide', label: '가이드' },
  { href: '/faq', label: 'FAQ' },
  { href: '/terms', label: '용어집' },
  { href: '/about', label: '소개' },
];

export function TopBar() {
  const resetAll = useCalculatorStore((s) => s.resetAll);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14">
        <Link href="/" className="text-base font-bold text-gray-900 hover:text-blue-600 transition-colors">
          집 살까? 전세 살까?
        </Link>
        <div className="flex items-center gap-3">
          <nav className="hidden sm:flex items-center gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-gray-500 hover:text-blue-500 transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            onClick={resetAll}
            className="text-sm text-blue-500 font-medium active:opacity-70 transition-opacity"
          >
            초기화
          </button>
        </div>
      </div>
      {/* 모바일 서브 네비 */}
      <nav className="flex sm:hidden items-center gap-4 px-4 pb-2 overflow-x-auto">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs text-gray-400 hover:text-blue-500 transition-colors font-medium whitespace-nowrap"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
