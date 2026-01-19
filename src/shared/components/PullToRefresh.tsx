import { useState, useRef, type ReactNode, type CSSProperties } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function PullToRefresh({ onRefresh, children, className = '', style }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const container = containerRef.current;
    if (container && container.scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || isRefreshing) return;

    const container = containerRef.current;
    if (container && container.scrollTop > 0) {
      isPulling.current = false;
      touchStartY.current = 0;
      setPullDistance(0);
      return;
    }

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0) {
      // Prevent default to stop iOS rubber-band effect
      e.preventDefault();
      // Apply diminishing returns for smoother feel
      const dampedDistance = Math.min(distance * 0.5, 100);
      setPullDistance(dampedDistance);
    }
  };

  const handleTouchEnd = async () => {
    if (isRefreshing) return;

    if (pullDistance > 50) {
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
    isPulling.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ overscrollBehavior: 'none', ...style }}
    >
      {/* Pull indicator - fixed at top */}
      {pullDistance > 0 && (
        <div
          className="fixed left-0 right-0 flex justify-center z-50 pointer-events-none"
          style={{
            top: `calc(env(safe-area-inset-top) + ${Math.min(pullDistance, 60)}px)`,
            opacity: Math.min(pullDistance / 50, 1),
          }}
        >
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-zinc-700">
            <div
              className="h-5 w-5 rounded-full border-2 border-primary/30 border-t-primary"
              style={{ transform: `rotate(${pullDistance * 5}deg)` }}
            />
            <span className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
              {pullDistance > 50 ? 'Отпустите' : 'Потяните'}
            </span>
          </div>
        </div>
      )}

      {/* Refreshing indicator */}
      {isRefreshing && (
        <div
          className="fixed left-0 right-0 flex justify-center z-50 pointer-events-none"
          style={{ top: 'calc(env(safe-area-inset-top) + 60px)' }}
        >
          <div className="flex items-center gap-2 bg-primary px-4 py-2 rounded-full shadow-lg">
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span className="text-xs font-semibold text-white">Обновление...</span>
          </div>
        </div>
      )}

      {/* Content - no transform to avoid bottom gap */}
      {children}
    </div>
  );
}
