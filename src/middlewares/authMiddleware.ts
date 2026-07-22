import { Request, Response, NextFunction } from 'express';
import { ResponseService } from '../utils/response';
import { verifyToken } from '../utils/helper';
import { Role } from '../database/models/Roles';
import rateLimit from 'express-rate-limit';

// Rate limiting middleware
export const rateLimiting = (customLimit?: number) =>
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: customLimit || 100, // Limit each IP to specified requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
  });

interface JwtPayload {
  id?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface IRequestUser extends Request {
  user?: JwtPayload;
  token?: string;
}

// Authentication middleware
export const authMiddleware = async (req: IRequestUser, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return ResponseService({
        data: null,
        status: 401,
        success: false,
        message: 'Authentication token is missing',
        res,
      });
    }

    const user = (await verifyToken(token)) as JwtPayload;
    if (!user) {
      return ResponseService({
        data: null,
        status: 401,
        success: false,
        message: 'Invalid authentication token',
        res,
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    const { message, stack } = error as Error;
    return ResponseService({
      data: { message, stack },
      status: 401,
      success: false,
      message: 'Invalid authentication token',
      res,
    });
  }
};

export const checkRole =
  (roles: string[]) => async (req: IRequestUser, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.role) {
        return ResponseService({
          data: null,
          status: 403,
          success: false,
          message: 'Role information is missing',
          res,
        });
      }

      const userRole = await Role.findByPk(req.user.role);
      if (!userRole) {
        return ResponseService({
          data: null,
          status: 403,
          success: false,
          message: 'Invalid role',
          res,
        });
      }

      if (!roles.includes(userRole.name)) {
        return ResponseService({
          data: null,
          status: 403,
          success: false,
          message: 'You do not have the required role to perform this action',
          res,
        });
      }

      next();
    } catch (error) {
      const { message } = error as Error;
      return ResponseService({
        data: { message },
        status: 500,
        success: false,
        message: 'Error checking role permissions',
        res,
      });
    }
  };
