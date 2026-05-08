import type { Metadata } from 'next';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { TrustPageTemplate } from '@/components/content/TrustPageTemplate';
import { siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '편집 정책',
  description: 'KLEVX 콘텐츠의 출처 선정, 업데이트, 오류 수정, 면책 기준을 안내합니다.',
  alternates: { canonical: `${siteUrl}/editorial-policy/` },
};

export default function EditorialPolicyPage() {
  return (
    <ContentLayout title="편집 정책" description="콘텐츠 작성과 검토 기준" showIntro={false}>
      <TrustPageTemplate
        eyebrow="EDITORIAL POLICY"
        title="편집 정책"
        description="KLEVX는 실거주자의 주거 선택 비교를 돕기 위해 공식 출처와 계산 기준을 우선하여 콘텐츠를 작성합니다."
        sections={[
          {
            title: '작성 원칙',
            body: [
              'KLEVX 콘텐츠는 투자 수익을 보장하거나 특정 선택을 단정하지 않습니다. 매수, 전세, 월세를 초기자금, 월 지출, 순자산 관점에서 비교할 수 있도록 설명하는 것이 목적입니다.',
              '본문은 사용자가 계산 결과를 이해하도록 돕는 해설이며, 법률, 세무, 금융 자문을 대체하지 않습니다.',
            ],
          },
          {
            title: '출처 선정 기준',
            body: [
              '세금, 대출, 임대차 제도, 보증보험 등 변경 가능성이 있는 항목은 국세청, 행정안전부, 국토교통부, 법제처, 금융감독원, 주택도시보증공사 등 공식 출처를 우선합니다.',
              '공식 출처가 없는 가정값은 사용자 입력값 또는 내부 가정으로 명확히 표시합니다. 투자수익률처럼 미래가 불확실한 값은 사용자가 직접 조정할 수 있도록 안내합니다.',
            ],
          },
          {
            title: '업데이트 기준',
            body: [
              '중요한 정책, 세율, 보증보험 요율, 대출 제도 변경이 확인되면 관련 콘텐츠와 계산 기준을 검토합니다. 업데이트가 필요한 경우 페이지의 최근 업데이트일과 계산 기준일을 갱신합니다.',
              '모든 페이지에는 작성일, 최근 업데이트일, 계산 기준일 또는 최근 확인일을 표시하는 것을 원칙으로 합니다.',
            ],
          },
          {
            title: '오류 수정',
            body: [
              '사용자 제보 또는 내부 검토로 오류가 발견되면 공식 출처와 코드 계산식을 확인합니다. 오류가 확인된 경우 관련 페이지와 계산 로직을 수정하고, 변경 이력을 남깁니다.',
              '단순 의견 차이나 미래 전망은 오류로 처리하지 않습니다. KLEVX는 예측보다 비교 구조와 가정의 명확성을 우선합니다.',
            ],
          },
        ]}
      />
    </ContentLayout>
  );
}
