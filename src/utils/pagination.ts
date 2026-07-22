
import { Request, Response, NextFunction } from 'express';


export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}


export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Generate pagination options
 * @param page Current page (default 1)
 * @param limit Items per page (default 10)
 * @param maxLimit Maximum allowed limit (default 100)
 */
export const getPagination = (
  page: number = 1,
  limit: number = 10,
  maxLimit: number = 100
): PaginationOptions => {
  const validLimit = Math.min(Math.max(limit, 1), maxLimit); // min 1, max maxLimit
  const validPage = Math.max(page, 1); // min 1
  const offset = (validPage - 1) * validLimit;
  return { page: validPage, limit: validLimit, offset };
};


export const getPagedResult = <T>(
  data: T[] = [],
  total: number = 0,
  page: number = 1,
  limit: number = 10
): PaginatedResult<T> => {
  const totalPages = Math.ceil(total / limit) || 1;
  return { data, total, page, limit, totalPages };
};


export const paginationMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  req.pagination = getPagination(page, limit);

  next();
};

declare global {
  namespace Express {
    interface Request {
      pagination?: PaginationOptions;
    }
  }
}
