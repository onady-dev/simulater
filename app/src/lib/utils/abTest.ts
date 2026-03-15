export function getABTestVariant(testName: string): 'A' | 'B' {
  const stored = localStorage.getItem(`ab-test-${testName}`);
  if (stored === 'A' || stored === 'B') return stored;

  const variant: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem(`ab-test-${testName}`, variant);
  return variant;
}
