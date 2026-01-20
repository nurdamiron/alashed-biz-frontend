import { useState, useMemo } from 'react';

interface UsePaginationOptions {
  initialPageSize?: number;
  initialPage?: number;
}

interface UsePaginationResult<T> {
  // Current page items
  pageItems: T[];
  // All visible items (for "load more" mode)
  visibleItems: T[];
  // Pagination state
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  // Actions
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  loadMore: () => void;
  reset: () => void;
  setPageSize: (size: number) => void;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { initialPageSize = 20, initialPage = 1 } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [visibleCount, setVisibleCount] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasMore = visibleCount < totalItems;

  // Items for current page (traditional pagination)
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, page, pageSize]);

  // All visible items (for "load more" mode)
  const visibleItems = useMemo(() => {
    return items.slice(0, visibleCount);
  }, [items, visibleCount]);

  const nextPage = () => {
    setPage((p) => Math.min(p + 1, totalPages));
  };

  const prevPage = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const loadMore = () => {
    setVisibleCount((c) => Math.min(c + pageSize, totalItems));
  };

  const reset = () => {
    setPage(initialPage);
    setVisibleCount(initialPageSize);
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
    setVisibleCount(size);
  };

  return {
    pageItems,
    visibleItems,
    page,
    pageSize,
    totalPages,
    totalItems,
    hasMore,
    nextPage,
    prevPage,
    goToPage,
    loadMore,
    reset,
    setPageSize,
  };
}
