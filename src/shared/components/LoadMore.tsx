import Icon from './Icon';

interface LoadMoreProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loadedCount: number;
  totalCount: number;
  isLoading?: boolean;
}

const LoadMore: React.FC<LoadMoreProps> = ({
  onLoadMore,
  hasMore,
  loadedCount,
  totalCount,
  isLoading = false,
}) => {
  if (!hasMore && loadedCount === totalCount) {
    return (
      <div className="flex flex-col items-center py-6 text-gray-400 dark:text-gray-500">
        <div className="h-1 w-12 rounded-full bg-gray-200 dark:bg-gray-700 mb-2" />
        <p className="text-xs font-medium">
          Показано {loadedCount} из {totalCount}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4">
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
        Показано {loadedCount} из {totalCount}
      </p>
      <button
        onClick={onLoadMore}
        disabled={isLoading || !hasMore}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Icon name="sync" className="text-lg animate-spin" />
            Загрузка...
          </>
        ) : (
          <>
            <Icon name="expand_more" className="text-lg" />
            Загрузить ещё
          </>
        )}
      </button>
    </div>
  );
};

export default LoadMore;
