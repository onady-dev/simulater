import type { Metadata } from 'next';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { TrustPageTemplate } from '@/components/content/TrustPageTemplate';
import { siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '계산 방법',
  description: 'KLEVX가 매수, 전세, 월세의 비용과 순자산을 계산하는 방식을 설명합니다.',
  alternates: { canonical: `${siteUrl}/methodology/` },
};

export default function MethodologyPage() {
  return (
    <ContentLayout title="계산 방법" description="매수, 전세, 월세 비교 로직" showIntro={false}>
      <TrustPageTemplate
        eyebrow="METHODOLOGY"
        title="계산 방법"
        description="KLEVX는 매수, 전세, 월세를 같은 기준에서 비교하기 위해 비용, 기회비용, 순자산 변화를 함께 계산합니다."
        sections={[
          {
            title: '공통 비교 기준',
            body: [
              '모든 시나리오는 보유 기간 동안의 총비용과 보유 기간 말의 순자산을 함께 봅니다. 단순히 이번 달 월세와 이자만 비교하지 않고 초기자금, 월 지출, 기회비용, 자산 변화를 반영합니다.',
              '추천 결과는 초기 필요 자금과 월 지출 조건을 충족하는 시나리오 중 순자산이 높은 선택을 우선합니다.',
            ],
          },
          {
            title: '매수 시나리오',
            body: [
              '매수는 취득세, 중개보수, 법무비 추정, 채권할인 추정, 등록 관련 비용, 재산세, 종합부동산세, 대출 이자, 매도 시 중개보수, 양도소득세 근사를 반영합니다.',
              '순자산은 금융자산, 주택 가치, 대출 잔액을 함께 고려합니다. 주택 가치는 입력한 연간 가격 변화율을 보유 기간 동안 적용해 계산합니다.',
            ],
          },
          {
            title: '전세 시나리오',
            body: [
              '전세는 중개보수, 전세보증보험료, 전세대출 이자, 보증금 자기자본의 기회비용을 반영합니다. 보증금 상승률은 2년 단위 재계약과 법정 상한을 고려해 근사합니다.',
              '전세 순자산은 초기 여유 자금의 운용, 월 저축액, 보증금 반환, 전세대출 잔액을 함께 반영합니다.',
            ],
          },
          {
            title: '월세 시나리오',
            body: [
              '월세는 보증금, 월 임차료 누적, 월세 상승률, 중개보수, 보증금 기회비용을 반영합니다. 월세 상승은 2년 단위 재계약과 법정 상한을 고려해 근사합니다.',
              '월세 순자산은 초기 여유 자금과 매달 남는 저축액이 투자수익률로 운용된다고 가정해 계산합니다.',
            ],
          },
          {
            title: '계산의 한계',
            body: [
              '관리비, 수선비, 이사비, 개인별 대출 승인, 지역별 규제, 실제 매물 협상 가격, 세대별 세무 특례는 계산에 포함하지 않습니다.',
              '공시가격은 시세의 일정 비율로 근사하며, 실제 공시가격과 다를 수 있습니다. 중요한 거래 전에는 공식 자료와 전문가 상담을 통해 확인해야 합니다.',
            ],
          },
        ]}
      />
    </ContentLayout>
  );
}
