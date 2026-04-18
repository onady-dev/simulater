import Link from 'next/link';

interface ContentLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, description, children }: ContentLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/calculator"
            className="text-blue-500 text-sm font-medium flex items-center gap-1 active:opacity-70"
          >
            ← 계산기
          </Link>
          <span className="text-gray-300">|</span>
          <h1 className="text-sm font-bold text-gray-900 truncate">{title}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {children}
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400 space-y-2">
        <nav className="flex justify-center gap-4">
          <Link href="/calculator" className="hover:text-blue-500 transition-colors">계산기</Link>
          <Link href="/guide" className="hover:text-blue-500 transition-colors">가이드</Link>
          <Link href="/faq" className="hover:text-blue-500 transition-colors">FAQ</Link>
          <Link href="/terms" className="hover:text-blue-500 transition-colors">용어집</Link>
          <Link href="/about" className="hover:text-blue-500 transition-colors">소개</Link>
        </nav>
        <p>© 2025 KLEVX. 본 계산기는 참고용이며 법적 효력이 없습니다.</p>
      </footer>
    </div>
  );
}
