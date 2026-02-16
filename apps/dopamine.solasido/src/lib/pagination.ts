import type { Pagination } from './types'

export const PAGE_SIZE = 12

export function getTotalPages(totalItems: number, pageSize = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalItems / pageSize))
}

export function getPageItems<T>(
  items: T[],
  currentPage: number,
  pageSize = PAGE_SIZE
): T[] {
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return items.slice(start, end)
}

export function buildPagination(
  currentPage: number,
  lastPage: number
): Pagination {
  return {
    currentPage,
    lastPage,
    url: {
      prev: currentPage > 1 ? (currentPage === 2 ? '/' : `/page/${currentPage - 1}`) : undefined,
      next: currentPage < lastPage ? `/page/${currentPage + 1}` : undefined,
    },
  }
}
