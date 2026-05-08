import type { Metadata } from 'next';
import { ContentLayout } from '@/components/layout/ContentLayout';
import { TrustPageTemplate } from '@/components/content/TrustPageTemplate';
import { siteUrl } from '@/lib/site/content';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'KLEVX의 개인정보, 쿠키, Google 광고 및 제3자 서비스 사용 고지를 확인하세요.',
  alternates: { canonical: `${siteUrl}/privacy/` },
};

export default function PrivacyPage() {
  return (
    <ContentLayout title="개인정보처리방침" description="쿠키와 제3자 서비스 사용 안내" showIntro={false}>
      <TrustPageTemplate
        eyebrow="PRIVACY"
        title="개인정보처리방침"
        description="KLEVX는 계산기 입력값을 서버로 전송하지 않는 것을 원칙으로 하며, 광고와 분석 서비스 사용 시 필요한 고지를 명확히 제공합니다."
        sections={[
          {
            title: '수집하는 정보',
            body: [
              'KLEVX 계산기에 입력하는 매매가, 보증금, 월세, 대출금액, 금리 등은 브라우저의 로컬 저장소에 저장될 수 있습니다. 이 값은 사용자의 기기에서 편의를 위해 유지되며, 별도의 서버 데이터베이스로 전송하지 않습니다.',
              '문의 이메일을 보내는 경우 답변을 위해 이메일 주소와 문의 내용을 확인할 수 있습니다.',
            ],
          },
          {
            title: '쿠키와 로컬 저장소',
            body: [
              '사이트는 계산기 입력값 유지, 사용자 경험 개선, 광고 표시를 위해 쿠키 또는 브라우저 저장 기술을 사용할 수 있습니다. 사용자는 브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다.',
              '쿠키를 차단하면 일부 기능, 광고 개인화, 입력값 유지 기능이 제한될 수 있습니다.',
            ],
          },
          {
            title: 'Google 광고 및 제3자 서비스',
            body: [
              'KLEVX는 Google AdSense 등 제3자 광고 서비스를 사용할 수 있습니다. Google과 파트너는 쿠키, 웹 비콘, IP 주소, 기기 식별자 등을 사용하여 광고를 표시하고 광고 성과를 측정할 수 있습니다.',
              'Google 광고 설정에서 개인 맞춤 광고를 관리할 수 있으며, 브라우저 또는 기기 설정을 통해 쿠키 사용을 제한할 수 있습니다.',
            ],
          },
          {
            title: '정보 보관과 삭제',
            body: [
              '브라우저에 저장된 계산기 입력값은 사용자가 초기화 버튼을 누르거나 브라우저 저장 데이터를 삭제하면 제거됩니다.',
              '문의 메일에 포함된 정보는 문의 처리와 분쟁 방지를 위한 범위에서 보관될 수 있으며, 삭제 요청이 있으면 관련 법령상 필요한 경우를 제외하고 처리합니다.',
            ],
          },
          {
            title: '방침 변경',
            body: [
              '개인정보처리방침은 서비스 기능, 광고 정책, 관련 법령 변화에 따라 변경될 수 있습니다. 중요한 변경이 있을 경우 이 페이지의 업데이트일을 갱신합니다.',
            ],
          },
        ]}
      />
    </ContentLayout>
  );
}
