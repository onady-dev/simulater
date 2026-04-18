import type { Metadata } from 'next';
import { ContentLayout } from '@/components/layout/ContentLayout';

export const metadata: Metadata = {
  title: '부동산 용어 해설 | 집 살까? 전세 살까?',
  description: '취득세, LTV, DSR, 기회비용, 전세가율 등 부동산 계산에 필요한 핵심 용어를 쉽게 설명합니다.',
};

interface Term {
  word: string;
  category: string;
  definition: string;
  example?: string;
}

const terms: Term[] = [
  {
    word: '취득세',
    category: '세금',
    definition: '부동산을 취득(매수)할 때 납부하는 지방세입니다. 주택 거래가액과 주택 수에 따라 세율이 달라집니다.',
    example: '6억 이하 1주택: 1%, 6~9억: 1~3%, 9억 초과: 3%. 조정대상지역 2주택: 8%',
  },
  {
    word: '재산세',
    category: '세금',
    definition: '매년 6월 1일 기준 부동산 보유자에게 부과되는 지방세입니다. 공시가격의 60%(공정시장가액비율)를 과세표준으로 합니다.',
    example: '공시가 3억: 세액 약 19.5만원 / 공시가 6억: 약 57만원 수준',
  },
  {
    word: '종합부동산세 (종부세)',
    category: '세금',
    definition: '주택 공시가격 합산액이 일정 기준을 초과하는 경우 부과되는 국세입니다. 1주택자는 12억원(공시가 기준) 초과분에 대해 납부합니다.',
    example: '공시가 합산 9억 초과(1주택 12억 초과) 시 0.5~5% 세율 적용',
  },
  {
    word: '양도소득세',
    category: '세금',
    definition: '부동산을 매도할 때 발생한 양도차익에 대해 납부하는 세금입니다. 1주택자가 2년 이상 보유한 경우 12억까지 비과세 혜택이 있습니다.',
    example: '보유 기간 2년 이상 1주택: 12억 이하 비과세 / 초과분: 6~45% 세율',
  },
  {
    word: 'LTV (담보인정비율)',
    category: '대출',
    definition: 'Loan To Value의 약자로, 주택 가격 대비 최대 대출 가능 금액의 비율입니다. 지역과 주택 가격에 따라 다르게 적용됩니다.',
    example: '일반 지역 LTV 70% → 5억짜리 집에 최대 3.5억 대출 가능',
  },
  {
    word: 'DSR (총부채원리금상환비율)',
    category: '대출',
    definition: '연간 모든 대출(주담대, 신용대출 등)의 원리금 상환액 합계를 연소득으로 나눈 비율입니다. 현재 1금융권 기준 40% 한도가 적용됩니다.',
    example: '연소득 6,000만원 × 40% = 연간 원리금 2,400만원(월 200만원) 이내 대출 가능',
  },
  {
    word: 'DTI (총부채상환비율)',
    category: '대출',
    definition: 'Debt To Income의 약자로, 연소득 대비 연간 원리금 상환액 비율입니다. DSR과 유사하지만 주택담보대출의 원리금만 계산하는 차이가 있습니다.',
    example: '연소득 5,000만원, DTI 40% → 주담대 연 원리금 2,000만원 이하',
  },
  {
    word: '기회비용',
    category: '개념',
    definition: '어떤 선택을 했을 때 포기해야 하는 최선의 대안적 가치입니다. 전세보증금을 묶어두는 대신 다른 투자로 얻을 수 있었던 수익이 기회비용입니다.',
    example: '전세보증금 3억 × 연 4% = 연 1,200만원(월 100만원)의 기회비용',
  },
  {
    word: '전세가율',
    category: '개념',
    definition: '매매가 대비 전세가의 비율입니다. 전세가율이 높을수록 전세 세입자의 보증금 반환 리스크가 커집니다.',
    example: '매매가 5억, 전세가 3.5억 → 전세가율 70%. 80% 이상이면 고위험 구간',
  },
  {
    word: '역전세',
    category: '개념',
    definition: '전세 계약 만료 시 현재 전세가가 기존 계약 시보다 낮아진 상태를 말합니다. 집주인이 새 세입자에게 받는 보증금만으로 기존 세입자의 보증금을 돌려주지 못할 수 있습니다.',
    example: '기존 전세 3억 → 만기 시 시세 2.5억 → 5,000만원 부족 → 역전세',
  },
  {
    word: '원리금균등상환',
    category: '대출 상환',
    definition: '대출 원금과 이자를 합쳐서 매월 동일한 금액을 납부하는 방식입니다. 초반에는 이자 비중이 높고 후반에는 원금 비중이 높아집니다.',
    example: '3억 대출, 연 4%, 30년 → 매월 약 143만원 균등 납부',
  },
  {
    word: '원금균등상환',
    category: '대출 상환',
    definition: '매월 일정한 원금을 상환하고, 남은 잔액에 대한 이자를 더해 납부하는 방식입니다. 초기 납부액이 크지만 총 이자 부담이 적습니다.',
    example: '3억 대출, 연 4%, 30년 → 1회차 약 183만원, 360회차 약 101만원',
  },
  {
    word: '만기일시상환',
    category: '대출 상환',
    definition: '대출 기간 동안 이자만 납부하다가 만기에 원금 전액을 상환하는 방식입니다. 단기 보유 목적일 때 월 부담을 줄일 수 있지만 총 이자가 가장 많습니다.',
    example: '3억 대출, 연 4%, 3년 거치 → 매월 이자 약 100만원만 납부, 만기에 3억 일시 상환',
  },
  {
    word: '공시가격',
    category: '부동산 가격',
    definition: '국토교통부가 매년 1월 1일 기준으로 산정·고시하는 부동산 가격입니다. 재산세, 종부세, 건강보험료 등 각종 세금과 부담금 산정의 기준이 됩니다.',
    example: '일반적으로 시세의 60~80% 수준. 이 계산기에서는 70%로 근사 적용',
  },
  {
    word: '레버리지 (Leverage)',
    category: '투자',
    definition: '대출 등 타인 자본을 활용하여 자기자본 대비 수익률을 높이는 전략입니다. 집값 상승 시 자기자본 수익률이 크게 올라가지만, 하락 시 손실도 확대됩니다.',
    example: '자기자본 2억 + 대출 3억으로 5억 주택 매수 → 10% 상승 시 자기자본 수익률 25%',
  },
  {
    word: '전월세 전환율',
    category: '임대차',
    definition: '전세를 월세로 전환할 때 적용하는 비율입니다. 법정 전환율은 기준금리 + 2%p로 설정됩니다. 실제 시장에서는 이보다 높거나 낮을 수 있습니다.',
    example: '기준금리 3.5% → 법정 전환율 5.5%. 보증금 1억을 월세로 전환 시 월 약 45.8만원',
  },
  {
    word: '전세보증보험',
    category: '임대차',
    definition: '전세 계약 만료 시 집주인이 보증금을 반환하지 못할 경우 보증기관(HUG·HF·SGI)이 대신 지급해주는 보험입니다.',
    example: 'HUG 전세보증금반환보증: 보증금 한도 2~10억, 보증료 연 0.1~0.2%',
  },
  {
    word: '갭투자',
    category: '투자',
    definition: '매매가와 전세가의 차이(갭)만큼의 자기자본으로 주택을 매수하는 방식입니다. 적은 자본으로 주택을 보유할 수 있지만, 전세가 하락 시 보증금 반환에 어려움을 겪을 수 있습니다.',
    example: '매매가 5억, 전세가 4.5억 → 갭 5,000만원으로 매수. 세입자 보증금으로 나머지 자금 조달',
  },
];

const categories = Array.from(new Set(terms.map((t) => t.category)));

export default function TermsPage() {
  return (
    <ContentLayout
      title="부동산 용어 해설"
      description="계산기에 사용된 핵심 용어를 쉽게 설명합니다"
    >
      {categories.map((cat) => (
        <section key={cat} className="mb-8">
          <h3 className="text-sm font-bold text-blue-600 mb-3 px-1"># {cat}</h3>
          <div className="space-y-3">
            {terms
              .filter((t) => t.category === cat)
              .map((term) => (
                <div
                  key={term.word}
                  className="bg-white rounded-2xl border border-gray-100 px-4 py-4 shadow-sm"
                >
                  <p className="text-base font-bold text-gray-900 mb-1">{term.word}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{term.definition}</p>
                  {term.example && (
                    <p className="text-xs text-gray-400 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                      예시: {term.example}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      ))}
    </ContentLayout>
  );
}
