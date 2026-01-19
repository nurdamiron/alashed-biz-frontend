import { useState, useRef, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container && container.scrollTop <= 5) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === 0 || isRefreshing) return;

    const container = containerRef.current;
    if (container && container.scrollTop > 5) {
      touchStartY.current = 0;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0 && distance < 150) {
      setPullDistance(distance);
    }
  };

  const handleTouchEnd = async () => {
    if (isRefreshing) return;

    if (pullDistance > 80) {
      setIsRefreshing(true);
      setPullDistance(0);

      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }

      setTimeout(() => setIsRefreshing(false), 500);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <div
          className="absolute left-0 right-0 flex justify-center z-50 transition-opacity"
          style={{
            top: Math.min(pullDistance - 40, 60),
            opacity: Math.min(pullDistance / 80, 1),
          }}
        >
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700">
            <div
              className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary"
              style={{ transform: `rotate(${pullDistance * 3}deg)` }}
            />
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
              {pullDistance > 80 ? 'Отпустите' : 'Потяните вниз'}
            </span>
          </div>
        </div>
      )}

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div className="absolute left-0 right-0 top-4 flex justify-center z-50">
          <div className="flex items-center gap-2 bg-primary px-4 py-2 rounded-full shadow-lg">
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span className="text-xs font-semibold text-white">Обновление...</span>
          </div>
        </div>
      )}

      {/* Content with pull offset */}
      <div style={{ transform: `translateY(${pullDistance > 0 ? Math.min(pullDistance * 0.5, 50) : 0}px)` }}>
        {children}
      </div>
    </div>
  );
}
