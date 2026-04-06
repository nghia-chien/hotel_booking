import { Request } from 'express';

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
}

export const buildPaginationOptions = (req: Request): PaginationOptions => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (req.query.sort) {
    sort = {};
    const fields = (req.query.sort as string).split(',');
    fields.forEach((field) => {
      const [key, order] = field.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    });
  }

  return { page, limit, skip, sort };
};
