import type { Metadata } from 'next';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { TrustPageTemplate } from '@/components/content/TrustPageTemplate';
import { siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '면책 고지',
  description: 'KLEVX 계산 결과와 콘텐츠의 참고용 성격, 한계, 전문가 상담 필요성을 안내합니다.',
  alternates: { canonical: `${siteUrl}/disclaimer/` },
};

export default function DisclaimerPage() {
  return (
    <ContentLayout title="면책 고지" description="계산 결과와 콘텐츠의 한계" showIntro={false}>
      <TrustPageTemplate
        eyebrow="DISCLAIMER"
        title="면책 고지"
        description="KLEVX는 주거 선택을 비교하기 위한 참고 도구이며, 실제 거래나 금융 판단의 최종 근거가 아닙니다."
        sections={[
          {
            title: '참고용 계산',
            body: [
              'KLEVX 계산 결과는 사용자가 입력한 값과 공개 기준을 바탕으로 한 추정값입니다. 실제 세금, 대출 가능 금액, 금리, 보증보험 가입 가능성, 거래비용은 개인 상황과 시점에 따라 달라질 수 있습니다.',
              '계산기는 합리적인 비교를 돕기 위한 도구이며 특정 주택 매수, 전세 계약, 월세 계약을 권유하지 않습니다.',
            ],
          },
          {
            title: '전문 자문이 아닙니다',
            body: [
              'KLEVX의 콘텐츠는 법률, 세무, 금융, 투자 자문이 아닙니다. 실제 거래 전에는 세무사, 금융기관, 공인중개사, 법률 전문가 등에게 본인의 상황을 확인해야 합니다.',
              '특히 다주택 여부, 조정대상지역, 소득 수준, 기존 대출, 가족 구성, 임대차 권리관계는 개인별 차이가 크므로 별도 확인이 필요합니다.',
            ],
          },
          {
            title: '미래 예측의 한계',
            body: [
              '집값 상승률, 투자수익률, 금리 변화, 임대료 상승률은 미래에 확정되지 않은 가정입니다. 과거 자료나 현재 조건이 미래 결과를 보장하지 않습니다.',
              '계산 결과는 여러 시나리오를 비교하기 위한 기준선으로 보고, 보수적 가정과 낙관적 가정을 모두 확인하는 것이 좋습니다.',
            ],
          },
        ]}
      />
    </ContentLayout>
  );
}
