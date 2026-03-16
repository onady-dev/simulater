# klevx.com 랜딩 페이지 + 애드센스 검수 통과 계획

## 현재 상태

| 리소스 | 상태 |
|--------|------|
| `calculator.klevx.com` | CloudFront(`E3O4Y7T1KMPYMR`) → S3(`onady.kro.kr`) 정상 운영 중 |
| `klevx.com` | CloudFront(`EORX3EAKESTQR`) → S3(`klevx-root-adstxt`) - ads.txt + 빈 index.html만 존재 |
| ACM 인증서 | `klevx.com`용 발급 완료 (`3d7e83ab`) |
| 애드센스 | `klevx.com`으로 검수 요청 → 빈 화면으로 정책 위반 거절 |

## 목표

- `klevx.com`에 랜딩 페이지를 올려 애드센스 검수 통과
- 검수 통과 후 `calculator.klevx.com`에 광고 코드 삽입
- `klevx.com`은 나중에 다른 프로젝트로 교체 가능하도록 독립 유지

## 작업 단계

### 1단계: klevx.com 랜딩 페이지 제작

- 프로젝트 소개 + calculator 링크가 포함된 단일 페이지 HTML 작성
- 구글 애드센스 검수 요건 충족:
  - 충분한 텍스트 콘텐츠 (프로젝트 소개, 서비스 설명)
  - 개인정보처리방침 페이지 (또는 섹션)
  - 명확한 네비게이션
  - 반응형 디자인
- 파일: `landing/index.html`, `landing/privacy.html`

### 2단계: S3 업로드

- 기존 `klevx-root-adstxt` 버킷에 랜딩 페이지 파일 업로드
- 기존 `ads.txt`는 유지
- Content-Type 올바르게 설정 (`text/html; charset=utf-8`)

### 3단계: CloudFront 설정 확인

- 기존 CloudFront 배포(`EORX3EAKESTQR`)가 이미 `klevx.com`에 연결되어 있음
- 기본 루트 객체가 `index.html`로 설정되어 있는지 확인
- 커스텀 에러 응답 설정 (404 → index.html)
- 캐시 무효화 실행

### 4단계: 동작 확인

- `https://klevx.com` 접속하여 랜딩 페이지 정상 표시 확인
- `https://klevx.com/ads.txt` 정상 접근 확인
- `https://klevx.com/privacy.html` 정상 접근 확인

### 5단계: 애드센스 재검수 요청

- 구글 애드센스 콘솔에서 `klevx.com` 재검수 요청
- 검수 통과 후 → `calculator.klevx.com`을 사이트로 추가
- `calculator.klevx.com` 페이지에 광고 코드 삽입
