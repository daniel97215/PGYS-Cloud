export interface PaginationCriteria {
  page?: number;
  pageSize?: number;
}

export interface PublicPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
