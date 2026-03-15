'use client';

import { useEffect, useState } from 'react';

export function AdBlockDetector() {
  const [isAdBlocked, setIsAdBlocked] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        setIsAdBlocked(false);
      } catch {
        setIsAdBlocked(true);
        setTimeout(() => setShowMessage(true), 3000);
      }
    };

    detectAdBlock();
  }, []);

  if (!isAdBlocked || !showMessage) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-40">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-2xl">ℹ️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-gray-900 mb-1">
            광고 차단기가 감지되었습니다
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            이 서비스는 광고 수익으로 운영됩니다. 광고를 허용해주시면 더 나은 서비스를 제공할 수 있습니다.
          </p>
          <button
            onClick={() => setShowMessage(false)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
