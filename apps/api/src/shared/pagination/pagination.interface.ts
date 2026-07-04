export interface PaginationResult<T> {
  items: T[];
  total: number;
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
}

