import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'KLEVX - 집 살까? 전세 살까? 매수·전세·월세 비교 계산기',
  description: '매수, 전세, 월세 중 나에게 유리한 선택은? 취득세, 대출이자, 기회비용, 시세 상승까지 반영한 실질 주거비 비교 계산기',
};

const scenarios = [
  {
    emoji: '🏠',
    label: '매수',
    desc: '취득세·재산세·대출이자·시세 상승 이익까지 반영한 실질 주거비',
    colorClass: 'bg-blue-50 border-blue-100',
    labelClass: 'text-blue-600',
  },
  {
    emoji: '🔑',
    label: '전세',
    desc: '전세대출 이자·보증보험료·기회비용을 포함한 총 비용',
    colorClass: 'bg-amber-50 border-amber-100',
    labelClass: 'text-amber-600',
  },
  {
    emoji: '📋',
    label: '월세',
    desc: '보증금 기회비용·월 임차료 누적·세액공제 반영',
    colorClass: 'bg-purple-50 border-purple-100',
    labelClass: 'text-purple-600',
  },
];

const features = [
  { icon: '📊', title: '순자산 추이 차트', desc: '보유 기간별 매수·전세·월세 순자산 변화를 시각적으로 비교' },
  { icon: '💰', title: '기회비용 반영', desc: '자기자본을 투자했을 때의 수익까지 고려한 실질 비용' },
  { icon: '🏦', title: '대출 상환 시뮬레이션', desc: '원리금균등·원금균등·만기일시 상환 방식별 이자 계산' },
  { icon: '📈', title: '레버리지 효과', desc: 'LTV 비율에 따른 자기자본 수익률 변화 시뮬레이션' },
  { icon: '🧾', title: '세금 자동 계산', desc: '취득세·재산세·종합부동산세·양도소득세 자동 반영' },
  { icon: '⚖️', title: 'AI 추천', desc: '입력 조건 기반으로 가장 유리한 시나리오를 자동 추천' },
];

const concerns = [
  '내 자금으로 집을 사는 게 나을까, 전세가 나을까?',
  '대출 이자를 내면서 집을 사는 게 정말 이득일까?',
  '전세 보증금을 투자에 넣으면 월세보다 유리할까?',
  '몇 년을 살아야 매수가 전세보다 유리해질까?',
  '집값이 얼마나 올라야 매수가 손해가 아닐까?',
];

const navLinks = [
  { href: '/guide', label: '매수·전세·월세 가이드' },
  { href: '/faq', label: 'FAQ' },
  { href: '/terms', label: '용어 해설' },
  { href: '/about', label: '서비스 소개' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 헤더 */}
      <header
        className="text-white text-center px-4 py-14"
        style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-2">KLEVX</p>
        <h1 className="text-2xl font-bold mb-1">집 살까? 전세 살까? 월세 살까?</h1>
        <p className="text-sm opacity-75 max-w-xs mx-auto mt-2 mb-6 leading-relaxed">
          같은 조건에서 매수·전세·월세의 실질 주거비를 한눈에 비교하고,<br />
          나에게 가장 유리한 선택을 찾아보세요
        </p>
        <Link
          href="/calculator"
          className="inline-block px-7 py-3 rounded-xl font-bold text-sm text-white"
          style={{ background: '#3a86ff' }}
        >
          무료로 비교해보기 →
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* 시나리오 3종 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-4">세 가지 시나리오를 한 번에 비교</h2>
          <p className="text-sm text-gray-500 mb-4">
            매매가, 전세 보증금, 월세를 입력하면 각 시나리오의 총 비용과 순자산 변화를 자동으로 계산합니다.
          </p>
          <div className="grid grid-cols-3 gap-2">
            {scenarios.map((s) => (
              <div key={s.label} className={`rounded-xl p-3 border text-center ${s.colorClass}`}>
                <p className="text-lg mb-1">{s.emoji}</p>
                <p className={`text-sm font-bold mb-1 ${s.labelClass}`}>{s.label}</p>
                <p className="text-xs text-gray-500 leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 기능 목록 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-1">단순 월세 비교가 아닙니다</h2>
          <p className="text-sm text-gray-500 mb-4">실제 의사결정에 필요한 숨은 비용까지 모두 계산합니다.</p>
          <div className="grid grid-cols-2 gap-2">
            {features.map((f) => (
              <div key={f.title} className="bg-blue-50 rounded-xl p-3">
                <p className="text-xl mb-1">{f.icon}</p>
                <p className="text-xs font-bold text-gray-800 mb-0.5">{f.title}</p>
                <p className="text-xs text-gray-500 leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 고민 목록 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">이런 고민이 있다면</h2>
          <ul className="space-y-2">
            {concerns.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-400 mt-0.5 flex-shrink-0">›</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 text-center">
            <Link
              href="/calculator"
              className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #3182F6 0%, #7C3AED 100%)' }}
            >
              🏠 지금 바로 계산해보기
            </Link>
          </div>
        </section>

        {/* 콘텐츠 링크 */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">더 알아보기</h2>
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between bg-gray-50 hover:bg-blue-50 transition-colors rounded-xl px-4 py-3 text-sm text-gray-700 font-medium"
              >
                <span>{l.label}</span>
                <span className="text-gray-400">›</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100 mt-4 space-y-1">
        <nav className="flex justify-center gap-4 mb-2">
          <Link href="/calculator" className="hover:text-blue-500 transition-colors">계산기</Link>
          <Link href="/guide" className="hover:text-blue-500 transition-colors">가이드</Link>
          <Link href="/faq" className="hover:text-blue-500 transition-colors">FAQ</Link>
          <Link href="/about" className="hover:text-blue-500 transition-colors">소개</Link>
        </nav>
        <p>© 2025 KLEVX. All rights reserved.</p>
        <p>본 계산기는 참고용이며 법적 효력이 없습니다.</p>
      </footer>
    </div>
  );
}
