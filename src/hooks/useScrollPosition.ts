import { useState, useEffect } from 'react';
import type { RefObject } from 'react';

interface ScrollPosition {
  isNearBottom: boolean;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

export function useScrollPosition(
  containerRef: RefObject<HTMLElement>,
  threshold: number = 100
): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    isNearBottom: true,
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      const isNearBottom = maxScroll - scrollTop < threshold;

      setPosition({
        isNearBottom,
        scrollTop,
        scrollHeight,
        clientHeight,
      });
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, threshold]);

  return position;
}
