import Link from 'next/link';

const included = [
  '매수: 취득세, 중개보수, 보유세, 대출이자, 시세 변화, 자기자본 기회비용',
  '전세: 중개보수, 보증보험료, 전세대출 이자, 보증금 기회비용',
  '월세: 보증금 기회비용, 월세 누적, 중개보수, 임대료 상승 가정',
];

const excluded = [
  '관리비, 수선비, 이사비, 인테리어 비용',
  '개인별 대출 승인, DSR 세부 심사, 우대금리',
  '지역별 규제, 실제 협상가, 세대별 세무 특례',
];

export function CalculationDisclosure() {
  return (
    <section className="mx-4 mt-4 rounded-3xl bg-white border border-gray-100 p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">계산 기준과 한계</h3>
      <p className="text-xs text-gray-500 leading-relaxed mt-2">
        결과는 공개 기준과 입력값을 바탕으로 한 참고용 비교입니다. 실제 거래 전에는
        최신 제도와 개인 조건을 별도로 확인해야 합니다.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-bold text-blue-600 mb-2">반영된 항목</p>
          <ul className="space-y-1.5">
            {included.map((item) => (
              <li key={item} className="text-xs text-gray-600 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-amber-600 mb-2">별도 확인 필요</p>
          <ul className="space-y-1.5">
            {excluded.map((item) => (
              <li key={item} className="text-xs text-gray-600 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Link href="/methodology" className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">
          계산 방식
        </Link>
        <Link href="/data-sources" className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">
          데이터 출처
        </Link>
        <Link href="/disclaimer" className="rounded-xl bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">
          면책 고지
        </Link>
      </div>
    </section>
  );
}
