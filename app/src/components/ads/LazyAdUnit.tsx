'use client';

import { useEffect, useRef, useState } from 'react';
import { AdUnit } from './AdUnit';

interface LazyAdUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  adStyle?: React.CSSProperties;
  className?: string;
  threshold?: number;
  publisherId: string;
}

export function LazyAdUnit({
  adSlot,
  adFormat = 'auto',
  adStyle,
  className,
  threshold = 0.1,
  publisherId,
}: LazyAdUnitProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <AdUnit
          adSlot={adSlot}
          adFormat={adFormat}
          adStyle={adStyle}
          className={className}
          publisherId={publisherId}
        />
      ) : (
        <div style={{ ...adStyle, background: '#f3f4f6' }} className={className} />
      )}
    </div>
  );
}
