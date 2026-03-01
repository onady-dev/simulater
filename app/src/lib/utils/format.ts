/**
 * 금액을 읽기 쉬운 한국어 형식으로 변환
 * 1억 이상 → "X.X억원", 만 이상 → "X만원", 미만 → "X원"
 */
export function formatWon(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 100_000_000) {
    return `${sign}${(abs / 100_000_000).toFixed(1)}억원`;
  }
  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만원`;
  }
  return `${sign}${abs.toLocaleString('ko-KR')}원`;
}

/**
 * 차트용: 억원/만원 단위만 (단위 레이블 별도)
 */
export function formatWonShort(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (abs >= 100_000_000) {
    return `${sign}${(abs / 100_000_000).toFixed(1)}억`;
  }
  if (abs >= 10_000) {
    return `${sign}${Math.round(abs / 10_000)}만`;
  }
  return `${sign}${abs}`;
}

/**
 * 퍼센트 포맷
 */
export function formatRate(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`;
}

/**
 * 입력 필드용: 쉼표 포함 정수 문자열 → 숫자
 */
export function parseWonInput(input: string): number {
  return parseInt(input.replace(/,/g, ''), 10) || 0;
}

/**
 * 컴팩트 표기 (바텀시트 제목용)
 * 6억, 4.5억, 150만
 */
export function formatWonCompact(value: number): string {
  const abs = Math.abs(value);

  if (abs >= 100_000_000) {
    const eok = abs / 100_000_000;
    return eok % 1 === 0 ? `${eok}억` : `${eok.toFixed(1)}억`;
  }
  if (abs >= 10_000) {
    return `${Math.round(abs / 10_000)}만`;
  }
  return `${abs.toLocaleString('ko-KR')}`;
}
