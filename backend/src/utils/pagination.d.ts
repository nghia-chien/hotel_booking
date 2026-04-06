import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

export function buildPaginationOptions(req: Request): PaginationOptions;
