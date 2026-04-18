import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentLayout } from '@/components/layout/ContentLayout';

export const metadata: Metadata = {
  title: '매수 vs 전세 vs 월세 완벽 가이드 | 집 살까? 전세 살까?',
  description: '2025년 기준 매수·전세·월세의 실질 비용을 비교하는 완벽 가이드. 취득세, 대출이자, 기회비용, 손익분기점까지 총정리.',
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-8">
      <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
        {title}
      </h3>
      <div className="text-sm text-gray-700 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-800 leading-relaxed">
      {children}
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800 leading-relaxed">
      {children}
    </div>
  );
}

export default function GuidePage() {
  return (
    <ContentLayout
      title="매수 vs 전세 vs 월세 완벽 가이드"
      description="2025년 기준 · 실질 비용 총정리"
    >
      <Section title="왜 단순 월세 비교로는 부족한가">
        <p>
          많은 사람들이 &ldquo;전세 보증금 이자 = 월세&rdquo;라는 공식으로 전세와 월세를 비교합니다. 하지만
          실제 주거비 결정에는 훨씬 복잡한 요소들이 얽혀 있습니다.
        </p>
        <p>
          매수의 경우 취득세(1~3%), 부동산 중개수수료, 법무사 비용, 재산세, 종합부동산세, 대출이자,
          그리고 나중에 팔 때 양도소득세까지 고려해야 합니다. 반면 시세 상승으로 인한 자산 증식
          효과도 함께 반영해야 공정한 비교가 됩니다.
        </p>
        <p>
          전세는 겉으로는 &ldquo;공짜 거주&rdquo;처럼 보이지만, 보증금에 묶인 자금의 기회비용(해당 금액을
          투자했을 때 얻을 수 있는 수익)과 전세대출 이자, 보증보험료를 합산하면 실제 비용이
          상당합니다.
        </p>
        <InfoBox>
          💡 핵심: 모든 시나리오의 &ldquo;실질 비용&rdquo;은 직접 지출 + 기회비용 – 자산 증가분으로 계산해야 합니다.
        </InfoBox>
      </Section>

      <Section title="매수: 비용 구조 완전 분석">
        <p><strong>초기 비용 (취득 시점)</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>취득세: 1주택자 기준 6억 이하 1%, 6~9억 1~3%, 9억 초과 3%. 조정대상지역 2주택자는 8%, 3주택 이상은 12%</li>
          <li>부동산 중개수수료: 거래가의 0.4~0.9% (상한 요율 적용)</li>
          <li>법무사 비용: 등기 이전 비용 약 50~100만원</li>
          <li>국민주택채권 매입 및 할인 비용</li>
        </ul>
        <p><strong>보유 기간 비용 (매년 반복)</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>재산세: 공시가격 × 공정시장가액비율(60%) × 세율(0.1~0.4%)</li>
          <li>종합부동산세: 공시가격 합산 9억(1주택 11억) 초과 시 부과</li>
          <li>대출 이자: 원리금균등 또는 원금균등 방식으로 매월 상환</li>
          <li>자기자본 기회비용: 대출 외 자기 돈에 대한 투자수익 손실</li>
        </ul>
        <p><strong>처분 비용 (매도 시점)</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>양도소득세: 보유 기간 및 1주택 여부에 따라 비과세 또는 6~45% 부과</li>
          <li>부동산 중개수수료: 매도가의 0.4~0.9%</li>
        </ul>
        <WarnBox>
          ⚠️ 매수 후 2년 미만 보유 시 단기 양도세율(40~70%)이 적용됩니다. 최소 2년 이상 보유를 계획하세요.
        </WarnBox>
      </Section>

      <Section title="전세: 숨은 비용 파악하기">
        <p>
          전세는 &ldquo;보증금만 있으면 공짜로 산다&rdquo;는 인식이 강하지만, 실제로는 여러 비용이 발생합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>전세대출 이자:</strong> 보증금 전액을 보유하지 않은 경우 대출을 받게 되며, 연 3~5% 수준의 이자 부담이 발생합니다.</li>
          <li><strong>전세보증보험료:</strong> HUG·HF·SGI 기준 연 0.1~0.2% 수준. 보증금 보호를 위해 필수적으로 가입을 권장합니다.</li>
          <li><strong>보증금 기회비용:</strong> 보증금 전액 또는 자기자본에 해당하는 금액을 다른 곳에 투자했을 때 기대할 수 있는 수익을 포기하는 셈입니다.</li>
          <li><strong>이사 비용 및 재계약 리스크:</strong> 2년마다 재계약이나 이사가 발생하고, 전세가 상승 시 추가 자금이 필요합니다.</li>
        </ul>
        <InfoBox>
          💡 전세가율(매매가 대비 전세가 비율)이 70% 이상인 지역은 역전세 위험이 있습니다. 보증보험 가입이 특히 중요합니다.
        </InfoBox>
      </Section>

      <Section title="월세: 세액공제와 실질 부담">
        <p>
          월세는 현금 지출이 가장 투명한 방식입니다. 하지만 역시 숨은 비용이 있습니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>월 임차료 누적:</strong> 2년(24개월) 기준으로 합산하면 상당한 금액이 됩니다.</li>
          <li><strong>소액 보증금 기회비용:</strong> 보증금 1,000~5,000만원도 기회비용이 발생합니다.</li>
          <li><strong>월세 세액공제:</strong> 총급여 7,000만원 이하 무주택 근로자는 월세의 15~17%를 세액공제 받을 수 있습니다. 최대 750만원 한도.</li>
          <li><strong>임대차 3법 리스크:</strong> 갱신 거절 시 퇴거 및 이사 비용 발생.</li>
        </ul>
      </Section>

      <Section title="매수가 유리한 조건 vs 전세·월세가 유리한 조건">
        <p><strong>매수가 유리한 경우</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>거주 예정 기간이 5년 이상으로 길 때</li>
          <li>주택 시세 상승이 예상되는 지역일 때</li>
          <li>대출 없이 또는 소액 대출로 매수 가능할 때</li>
          <li>전세가율이 낮아 전세 비용이 상대적으로 비쌀 때</li>
          <li>기회비용으로 고려할 투자 대안이 마땅치 않을 때</li>
        </ul>
        <p><strong>전세·월세가 유리한 경우</strong></p>
        <ul className="list-disc pl-5 space-y-1">
          <li>거주 기간이 2~3년 이하로 짧을 때</li>
          <li>이직, 결혼, 자녀 교육 등으로 이동 가능성이 높을 때</li>
          <li>주택 시세 하락이 예상될 때</li>
          <li>보유 자금을 높은 수익률로 투자할 수 있을 때</li>
          <li>매수가와 전세가 차이(갭)가 매우 작을 때</li>
        </ul>
        <WarnBox>
          ⚠️ &ldquo;내 집 마련&rdquo;의 심리적 안정감도 의사결정 요소입니다. 숫자만으로 판단하지 말고, 자신의 라이프스타일과 재무 상황을 종합적으로 고려하세요.
        </WarnBox>
      </Section>

      <Section title="손익분기점: 몇 년이면 매수가 유리해지나">
        <p>
          일반적으로 매수는 초기 비용(취득세, 중개비 등)이 크기 때문에 단기 거주에서는 불리합니다.
          하지만 보유 기간이 길어질수록 시세 상승 효과가 누적되어 전세·월세보다 유리해지는
          시점이 옵니다. 이를 &apos;손익분기점&apos;이라 합니다.
        </p>
        <p>
          손익분기점은 지역, 금리, 시세 상승률, 전세가율에 따라 크게 달라집니다.
          서울 주요 지역의 경우 금리 4% 기준으로 평균 4~6년, 금리 6% 기준에서는 7~10년이 걸리는
          경우도 있습니다.
        </p>
        <InfoBox>
          💡 계산기의 &ldquo;순자산 변화 차트&rdquo;에서 매수·전세·월세의 시간별 자산 추이를 시각적으로 확인할 수 있습니다.
        </InfoBox>
      </Section>

      <Section title="2025년 주요 변수: 금리와 세금">
        <p>
          2025년 기준 주택담보대출 금리는 연 3.5~5.5% 수준입니다. 금리는 매수 결정에
          가장 민감한 변수로, 금리가 1%p 오르면 동일 대출금에 대한 연간 이자 부담이
          크게 늘어납니다.
        </p>
        <p>
          세제 측면에서는 취득세 중과(다주택자), 종합부동산세 강화, 양도소득세 비과세 요건(2년
          보유·거주) 등을 반드시 확인해야 합니다. 세법은 자주 바뀌므로 계산기 사용 시점의
          최신 세율을 반영했는지 확인하세요.
        </p>
      </Section>

      <div className="mt-8 p-5 bg-gray-50 rounded-2xl text-center">
        <p className="text-sm text-gray-600 mb-3">
          내 조건에서 실제로 계산해보세요
        </p>
        <Link
          href="/calculator"
          className="inline-block px-6 py-3 rounded-xl text-white text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #3182F6 0%, #7C3AED 100%)' }}
        >
          🏠 계산기로 이동
        </Link>
      </div>
    </ContentLayout>
  );
}
