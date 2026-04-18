import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout } from '@/components/layout/ContentLayout';

export const metadata: Metadata = {
  title: '서비스 소개 | 집 살까? 전세 살까?',
  description: '집 살까? 전세 살까?는 매수·전세·월세의 실질 주거비를 정확하게 비교하는 무료 계산기입니다.',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5 mb-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <ContentLayout
      title="서비스 소개"
      description="KLEVX 주거비 비교 계산기를 소개합니다"
    >
      {/* 헤드라인 */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl px-5 py-6 mb-6 text-white text-center">
        <p className="text-2xl mb-2">🏠</p>
        <h2 className="text-lg font-bold mb-1">집 살까? 전세 살까?</h2>
        <p className="text-sm opacity-90">
          매수·전세·월세의 실질 주거비를 정확하게 비교하는 무료 계산기
        </p>
      </div>

      <Card title="왜 만들었나요?">
        <p>
          &ldquo;전세랑 매수 중 뭐가 더 나을까요?&rdquo;라는 질문에 정확히 답해주는 도구가 없었습니다.
          인터넷 게시판의 감각적 조언이나 단순 이자 비교를 넘어,
          취득세·재산세·대출이자·기회비용·시세 상승까지 모두 반영한 진짜 비교를 만들고 싶었습니다.
        </p>
        <p>
          이 계산기는 그 고민에서 시작되었습니다. 복잡한 부동산 의사결정을 누구나 쉽게
          숫자로 확인할 수 있도록 설계했습니다.
        </p>
      </Card>

      <Card title="어떤 계산을 하나요?">
        <ul className="space-y-2 list-none">
          {[
            ['🏠 매수', '취득세, 중개수수료, 법무사비용, 재산세, 종부세, 대출이자, 자기자본 기회비용, 양도소득세, 시세 상승 이익'],
            ['🔑 전세', '중개수수료, 전세보증보험료, 전세대출 이자, 보증금 기회비용, 세액공제 혜택'],
            ['📋 월세', '월 임차료 누적, 보증금 기회비용, 월세 세액공제 혜택'],
          ].map(([label, desc]) => (
            <li key={label} className="flex gap-2">
              <span className="font-semibold whitespace-nowrap">{label}</span>
              <span className="text-gray-500">{desc}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="계산 방식의 신뢰성">
        <p>
          이 계산기는 국토교통부 고시 세율, 금융감독원 기준 대출 상환 공식,
          임대차보호법 전월세 전환율 규정을 기반으로 작동합니다.
        </p>
        <p>
          세율은 2025년 최신 기준을 반영하며, 취득세 중과·종합부동산세·양도소득세
          비과세 요건 등 주요 세법 조항을 포함합니다.
        </p>
        <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          ※ 공시가격은 시세의 70% 근사치를 적용합니다. 실제 공시가격과 다를 수 있으며,
          본 계산기는 참고용으로만 사용하시고 실제 거래 전 전문가 상담을 권장합니다.
        </p>
      </Card>

      <Card title="주요 기능">
        <ul className="space-y-1.5">
          {[
            '매수·전세·월세 실질 비용 3자 비교',
            '순자산 변화 연도별 시뮬레이션 차트',
            '레버리지 효과 및 자기자본 수익률 계산',
            '대출 상환 방식별(원리금균등·원금균등·만기일시) 이자 비교',
            '인플레이션·금리 시나리오별 민감도 분석',
            '손익분기점 및 집값 상승률별 시나리오',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="이용 안내">
        <ul className="space-y-1.5">
          <li>• 완전 무료로 제공되며 회원가입이 필요 없습니다.</li>
          <li>• 입력한 숫자는 기기에만 저장되며 서버로 전송되지 않습니다.</li>
          <li>• 광고 수익으로 운영되며, 표시되는 광고는 Google AdSense를 통해 제공됩니다.</li>
          <li>• 오류나 개선 의견은 언제든 환영합니다.</li>
        </ul>
      </Card>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Link
          href="/calculator"
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #3182F6 0%, #7C3AED 100%)' }}
        >
          🏠 계산기 사용하기
        </Link>
        <Link
          href="/guide"
          className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-blue-600 text-sm font-bold bg-blue-50 border border-blue-100"
        >
          📖 가이드 읽기
        </Link>
      </div>
    </ContentLayout>
  );
}
