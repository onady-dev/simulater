import type { Metadata } from 'next';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { TrustPageTemplate } from '@/components/content/TrustPageTemplate';
import { siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '문의 및 오류 제보',
  description: 'KLEVX 계산 기준, 콘텐츠 오류, 개인정보, 광고 관련 문의 방법을 안내합니다.',
  alternates: { canonical: `${siteUrl}/contact/` },
};

export default function ContactPage() {
  return (
    <ContentLayout title="문의 및 오류 제보" description="계산 기준과 콘텐츠 관련 문의 안내" showIntro={false}>
      <TrustPageTemplate
        eyebrow="CONTACT"
        title="문의 및 오류 제보"
        description="계산 기준 오류, 출처 업데이트, 개인정보 관련 문의를 받습니다."
        sections={[
          {
            title: '문의 가능한 내용',
            body: [
              'KLEVX는 매수, 전세, 월세 비교 계산과 관련된 오류 제보를 중요하게 봅니다. 세율 변경, 보증보험 요율 변경, 대출금리 기준 변경, 콘텐츠 오탈자, 깨진 링크를 발견했다면 문의해 주세요.',
              '계산 결과가 개인 상황과 다르게 보이는 경우에는 입력값, 사용한 페이지 주소, 기대한 결과와 실제 결과를 함께 남기면 확인이 쉽습니다.',
            ],
          },
          {
            title: '연락 방법',
            body: [
              '문의 이메일: contact@klevx.com',
              '운영 상황에 따라 답변까지 시간이 걸릴 수 있습니다. 법률, 세무, 금융 상담은 제공하지 않으며, 구체적인 거래 판단은 전문가에게 확인해야 합니다.',
            ],
          },
          {
            title: '오류 수정 원칙',
            body: [
              '공식 출처와 계산 로직을 확인한 뒤 오류가 맞으면 콘텐츠와 계산 기준을 업데이트합니다. 업데이트가 완료되면 관련 페이지의 최근 업데이트일과 계산 기준일을 함께 갱신합니다.',
              '정책이나 세법이 바뀐 경우에는 기존 계산 결과가 과거 기준일 수 있으므로, 최신 기준일을 확인한 뒤 결과를 해석해야 합니다.',
            ],
          },
        ]}
      />
    </ContentLayout>
  );
}
