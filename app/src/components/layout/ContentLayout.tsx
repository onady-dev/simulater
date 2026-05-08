import Link from 'next/link';

interface ContentLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  showIntro?: boolean;
}

export function ContentLayout({ title, description, children, showIntro = true }: ContentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/"
            className="text-blue-500 text-sm font-medium flex items-center gap-1 active:opacity-70"
          >
            ← 홈
          </Link>
          <span className="text-gray-300">|</span>
          <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        {showIntro && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        )}
        {children}
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400 space-y-2">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
          <Link href="/calculator" className="hover:text-blue-500 transition-colors">계산기</Link>
          <Link href="/guide" className="hover:text-blue-500 transition-colors">가이드</Link>
          <Link href="/case-studies" className="hover:text-blue-500 transition-colors">사례</Link>
          <Link href="/faq" className="hover:text-blue-500 transition-colors">FAQ</Link>
          <Link href="/terms" className="hover:text-blue-500 transition-colors">용어집</Link>
          <Link href="/about" className="hover:text-blue-500 transition-colors">소개</Link>
          <Link href="/privacy" className="hover:text-blue-500 transition-colors">개인정보</Link>
          <Link href="/contact" className="hover:text-blue-500 transition-colors">문의</Link>
        </nav>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
          <Link href="/methodology" className="hover:text-blue-500 transition-colors">계산 방식</Link>
          <Link href="/data-sources" className="hover:text-blue-500 transition-colors">데이터 출처</Link>
          <Link href="/editorial-policy" className="hover:text-blue-500 transition-colors">편집 정책</Link>
          <Link href="/disclaimer" className="hover:text-blue-500 transition-colors">면책 고지</Link>
        </nav>
        <p>© 2026 KLEVX. 본 계산기는 참고용이며 법적 효력이 없습니다.</p>
      </footer>
    </div>
  );
}
