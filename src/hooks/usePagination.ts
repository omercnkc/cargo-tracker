import { useState, useMemo, useEffect, useCallback } from 'react';

export interface UsePaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  paginatedItems: T[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  resetPage: () => void;
  startIndex: number;
  endIndex: number;
}

/**
 * Reusable Pagination Hook (DRY) with Lazy Slicing / Evaluation.
 * Ensures max items per page (default: 5) and avoids redundant re-renders.
 */
export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { itemsPerPage = 5, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  const totalItems = items.length;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / itemsPerPage));
  }, [totalItems, itemsPerPage]);

  // Adjust current page if items shrink and current page is out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage, totalItems);
  }, [startIndex, itemsPerPage, totalItems]);

  // Lazy Evaluation: Only slice visible items for active page
  const paginatedItems = useMemo(() => {
    if (totalItems === 0) return [];
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex, totalItems]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    setCurrentPage,
    nextPage,
    prevPage,
    goToPage,
    resetPage,
    startIndex,
    endIndex,
  };
}
