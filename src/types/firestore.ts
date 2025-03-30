import { WhereFilterOp, DocumentSnapshot } from 'firebase/firestore';

export interface FilterCondition {
  field: string;
  operator: WhereFilterOp;
  value: unknown;
}

export interface SortCondition {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  limit?: number;
  startAfter?: DocumentSnapshot | null;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount?: number;
  totalPages?: number;
  lastVisible?: DocumentSnapshot | null;
}
