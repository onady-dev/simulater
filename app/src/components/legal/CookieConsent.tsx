'use client';

import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm mb-1">
              이 웹사이트는 쿠키를 사용하여 사용자 경험을 개선하고 광고를 제공합니다.
            </p>
            <a
              href="/privacy"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              개인정보 처리방침 보기
            </a>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800"
            >
              거부
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700"
            >
              동의
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
