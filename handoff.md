# Handoff: KLEVX AdSense Recovery Work

## Current Goal

KLEVX(`klevx.com`) was rejected by Google AdSense for "valuable inventory: no content / low-value content". The current work is to reposition the app from a thin calculator landing page into a trustworthy Korean housing decision content site plus calculator.

The target product positioning:

- Audience: Korean 실거주 의사결정자, not real estate investors.
- Tone: cost comparison guidance, not financial/tax/legal/investment advice.
- Structure: content hub + guide articles + case studies + trust pages + calculator.

## Important Context

The user asked to:

1. Get planning feedback from a planning/design agent three times.
2. Write the resulting plan as a document.
3. Start implementation without stopping.
4. After implementation, get code review from a reviewer agent and update accordingly.

All of that has been done.

## Files Added

- `ADSENSE_RECOVERY_PLAN.md`
  - Product/content/SEO implementation plan.
  - Includes 3-round planning feedback summary and AdSense recovery checklist.

- `app/src/lib/site/content.ts`
  - Shared content data.
  - Includes `siteUrl`, `lastReviewed`, guide article data, case-study article data, data-source rows, official source links.

- `app/src/components/content/ArticleTemplate.tsx`
  - Shared renderer for guide/case-study articles.
  - Shows title, summary, published/updated/calculation dates, disclaimer, sections, included/excluded items, sources, calculator CTA.

- `app/src/components/content/TrustPageTemplate.tsx`
  - Shared renderer for trust pages.
  - Uses `lastReviewed` from `content.ts`.

- `app/src/components/results/CalculationDisclosure.tsx`
  - Result-page disclosure for included/excluded calculation items.

- `app/src/app/guide/[slug]/page.tsx`
  - Static dynamic routes for guide articles.
  - Uses `generateStaticParams`.
  - Adds Article JSON-LD and per-page metadata/canonical.

- `app/src/app/case-studies/page.tsx`
  - Case-study hub.

- `app/src/app/case-studies/[slug]/page.tsx`
  - Static dynamic routes for case-study articles.
  - Uses `generateStaticParams`.
  - Adds Article JSON-LD and per-page metadata/canonical.

- Trust pages:
  - `app/src/app/contact/page.tsx`
  - `app/src/app/privacy/page.tsx`
  - `app/src/app/editorial-policy/page.tsx`
  - `app/src/app/disclaimer/page.tsx`
  - `app/src/app/methodology/page.tsx`
  - `app/src/app/data-sources/page.tsx`

- Technical SEO:
  - `app/src/app/robots.ts`
  - `app/src/app/sitemap.ts`

## Files Modified

- `app/src/app/page.tsx`
  - Replaced old thin landing page with content-hub homepage.
  - Includes guide cards, case-study cards, trust links, WebApplication JSON-LD, calculator CTA.

- `app/src/app/guide/page.tsx`
  - Replaced long single guide with guide hub listing 8 guide articles.

- `app/src/app/about/page.tsx`
  - Updated positioning to KLEVX.
  - Added trust links.
  - Removed inaccurate claims that tax credits are reflected in jeonse/monthly rent calculations.

- `app/src/app/terms/page.tsx`
  - Added canonical.
  - Cleaned title branding.

- `app/src/app/layout.tsx`
  - Added site-wide metadataBase, title template, OG metadata.
  - Removed global AdSense script.
  - Removed mobile zoom lock (`maximumScale`, `userScalable`) after reviewer feedback.

- `app/src/app/calculator/page.tsx`
  - Adds `CalculationDisclosure` after results.

- `app/src/components/layout/ContentLayout.tsx`
  - Header link now goes to home.
  - Footer expanded with guide, case studies, trust/policy links.
  - Added `showIntro` prop to avoid duplicate H1s on article/trust pages.

- `app/src/components/layout/TopBar.tsx`
  - Brand label changed to `KLEVX`.
  - Added case-study and methodology links.

- `app/src/components/results/MonthlyCostSummary.tsx`
  - Changed buy monthly cost subtitle from `대출+세금+관리비` to `대출+보유세`.
  - Reason: actual calculation does not include maintenance fee.

- `app/src/components/results/ScenarioSwipeCards.tsx`
  - Removed visible `placeholder` text from invisible layout placeholders.

## Reviewer Agent Findings and Fixes

Reviewer found:

1. High: `about/page.tsx` claimed jeonse/monthly rent tax credits were reflected, but actual calculation sets those to `0`.
   - Fixed by removing those claims.

2. Medium: `MonthlyCostSummary` said buy monthly cost included maintenance fee, but actual calculation only uses loan + tax.
   - Fixed subtitle to `대출+보유세`.

3. Medium: Metadata branding mixed old name and `KLEVX`.
   - Fixed about/terms titles and about copy where appropriate.

4. Low: Hardcoded freshness dates.
   - Fixed `TrustPageTemplate` and `sitemap.ts` to use `lastReviewed`.

5. Low: Mobile zoom disabled.
   - Fixed by removing `maximumScale` and `userScalable`.

## Verification Done

Commands run:

```powershell
Get-ChildItem app\src -Recurse -File -Include *.tsx,*.ts | Select-String -Pattern 'adsbygoogle|pagead2|ca-pub|placeholder|준비 중'
```

Result: no matches after fixes.

Also searched for reviewer-mentioned inconsistent text:

```powershell
Select-String -Path app\src\app\about\page.tsx,app\src\app\terms\page.tsx,app\src\components\content\TrustPageTemplate.tsx,app\src\app\sitemap.ts,app\src\app\layout.tsx,app\src\components\results\MonthlyCostSummary.tsx -Pattern '세액공제|관리비|집 살까|2026-05-08|maximumScale|userScalable'
```

Result: no matches.

## Verification Blocked

Build and lint could not be run in this environment because `node` is not available in PATH.

Tried:

```powershell
npm run lint
npm run build
.\node_modules\.bin\next.CMD lint
.\node_modules\.bin\next.CMD build
```

Failure:

```text
'node' is not recognized as an internal or external command,
operable program or batch file.
```

Next session should run these once Node is available:

```powershell
cd app
npm run lint
npm run build
```

## Current Git Status at Handoff

Known changed files include:

- Modified:
  - `app/src/app/about/page.tsx`
  - `app/src/app/calculator/page.tsx`
  - `app/src/app/guide/page.tsx`
  - `app/src/app/layout.tsx`
  - `app/src/app/page.tsx`
  - `app/src/app/terms/page.tsx`
  - `app/src/components/layout/ContentLayout.tsx`
  - `app/src/components/layout/TopBar.tsx`
  - `app/src/components/results/MonthlyCostSummary.tsx`
  - `app/src/components/results/ScenarioSwipeCards.tsx`

- Added:
  - `ADSENSE_RECOVERY_PLAN.md`
  - `handoff.md`
  - `app/src/app/case-studies/`
  - `app/src/app/contact/`
  - `app/src/app/data-sources/`
  - `app/src/app/disclaimer/`
  - `app/src/app/editorial-policy/`
  - `app/src/app/guide/[slug]/`
  - `app/src/app/methodology/`
  - `app/src/app/privacy/`
  - `app/src/app/robots.ts`
  - `app/src/app/sitemap.ts`
  - `app/src/components/content/`
  - `app/src/components/results/CalculationDisclosure.tsx`
  - `app/src/lib/site/`

Run `git status --short` for exact current state.

## Remaining Work

1. Run build/lint once Node is available.
2. Fix any TypeScript or Next build errors.
3. Run a local dev server and do browser QA on:
   - `/`
   - `/guide`
   - `/guide/cashflow-net-worth`
   - `/case-studies`
   - `/case-studies/jeonse-ratio-70`
   - `/methodology`
   - `/data-sources`
   - `/privacy`
   - `/calculator`
4. Check mobile layout at 390px width.
5. Confirm sitemap output contains trailing slashes.
6. Deploy.
7. Register/update in Search Console.
8. Request indexing for key URLs.
9. Only after content and indexing are ready, re-add AdSense review script if needed.

## AdSense-Specific Notes

- Do not add visible ad slots before approval.
- Do not put ads on:
  - calculator idle/empty state
  - loading screen
  - near calculation buttons
  - nav/footer policy link area
- Current implementation removed global AdSense script from `layout.tsx`.
- `app/public/ads.txt` still exists from before.

## Important Product Rule

Keep all copy framed as guidance for 실거주 비용 비교. Avoid:

- guaranteed returns
- "무조건 매수/전세/월세가 유리"
- tax/legal/financial advice tone
- unsupported current-rate claims without source/date

## Useful Files to Start From

- Plan: `ADSENSE_RECOVERY_PLAN.md`
- Shared content: `app/src/lib/site/content.ts`
- Homepage: `app/src/app/page.tsx`
- Article renderer: `app/src/components/content/ArticleTemplate.tsx`
- Trust page renderer: `app/src/components/content/TrustPageTemplate.tsx`
- Sitemap: `app/src/app/sitemap.ts`
