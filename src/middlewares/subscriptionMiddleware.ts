import { Response, NextFunction } from 'express';
import { ResponseService } from '../utils/response';
import { IRequestUser } from './authMiddleware';
import { User } from '../database/models/User';
import { School } from '../database/models/School';

// Blocks SchoolManagers/AdmissionManagers from acting once their school's subscription has expired
export const requireActiveSubscription = async (req: IRequestUser, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return ResponseService({ data: null, status: 401, success: false, message: 'Authentication required', res });
    }

    const user = await User.findByPk(req.user.id);
    if (!user || !user.schoolId) {
      // Admins and users not tied to a school aren't subject to this gate
      return next();
    }

    const school = await School.findByPk(user.schoolId);
    if (!school) return next();

    if (school.subscriptionStatus === 'expired') {
      return ResponseService({
        data: null,
        status: 402,
        success: false,
        message: 'Your school subscription has expired. Please pay to continue using the platform.',
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
      message: 'Error checking subscription status',
      res,
    });
  }
};
