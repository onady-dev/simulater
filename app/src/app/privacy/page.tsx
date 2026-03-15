export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">개인정보 처리방침</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">1. 수집하는 정보</h2>
          <p className="text-gray-700 mb-2">
            본 웹사이트는 다음과 같은 정보를 수집할 수 있습니다:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>쿠키 및 유사 기술을 통한 사용 정보</li>
            <li>Google AdSense를 통한 광고 관련 정보</li>
            <li>Google Analytics를 통한 웹사이트 사용 통계</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">2. 정보 사용 목적</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li>웹사이트 기능 제공 및 개선</li>
            <li>맞춤형 광고 제공</li>
            <li>사용자 경험 분석 및 최적화</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">3. 제3자 서비스</h2>
          <p className="text-gray-700 mb-2">
            본 웹사이트는 다음 제3자 서비스를 사용합니다:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>
              <strong>Google AdSense</strong>: 광고 제공
              <br />
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 개인정보 처리방침
              </a>
            </li>
            <li>
              <strong>Google Analytics</strong>: 웹사이트 분석
              <br />
              <a
                href="https://policies.google.com/privacy"
                className="text-blue-600 hover:underline text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google 개인정보 처리방침
              </a>
            </li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">4. 쿠키 관리</h2>
          <p className="text-gray-700">
            브라우저 설정에서 쿠키를 차단하거나 삭제할 수 있습니다. 단, 쿠키를 차단하면 일부
            기능이 제한될 수 있습니다.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">5. 문의</h2>
          <p className="text-gray-700">
            개인정보 처리방침에 대한 문의사항이 있으시면 서비스 내 문의 채널을 통해 연락주시기
            바랍니다.
          </p>
        </section>

        <p className="text-sm text-gray-500 mt-8">최종 업데이트: 2026년 3월 14일</p>
      </div>
    </div>
  );
}
