import { Request, Response } from 'express';
import * as SchoolService from '../services/schoolService';
import { ResponseService } from '../utils/response';
import {asString} from '../utils/helper';
import { uploadToCloud } from '../utils/uploadHelper';
import { IRequestUser } from '../middlewares/authMiddleware';
import { getPagination } from '../utils/pagination';
import { SearchFilters } from '../types/School';

const getUserId = (req: IRequestUser): string => {
  if (!req.user || !req.user.id) {
    throw new Error('Unauthorized: User not found');
  }
  return req.user.id;
};

/**
 * Register a new school (SchoolManager)
 */
export const registerSchool = async (req: IRequestUser, res: Response) => {
  try {
    console.log('Incoming body:', req.body);
    console.log('Incoming file:', req.file);

    const schoolData = req.body;

    // Upload license document if file provided
    if (req.file) {
      const fileUrl = await uploadToCloud(req.file);
      schoolData.licenseDocument = fileUrl;
    }

    const school = await SchoolService.registerSchool(getUserId(req), schoolData);

    return ResponseService({
      data: school,
      status: 201,
      success: true,
      message: 'School registered successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error registering school:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to register school',
      res,
    });
  }
};

/**
 * Approve a school (Admin)
 */
export const approveSchool = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId  = asString(req.params.schoolId);

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const school = await SchoolService.approveSchool(schoolId, getUserId(req));

    return ResponseService({
      data: school,
      status: 200,
      success: true,
      message: 'School approved successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error approving school:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to approve school',
      res,
    });
  }
};

/**
 * Reject a school (Admin)
 */
export const rejectSchool = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const { reason } = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    if (!reason) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Rejection reason is required',
        res,
      });
    }

    const school = await SchoolService.rejectSchool(schoolId, getUserId(req), reason);

    return ResponseService({
      data: school,
      status: 200,
      success: true,
      message: 'School rejected successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error rejecting school:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to reject school',
      res,
    });
  }
};

/**
 * Reassign a school to a different SchoolManager (Admin only)
 */
export const reassignManager = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const { newManagerId } = req.body;

    if (!schoolId) {
      return ResponseService({ data: null, status: 400, success: false, message: 'School ID is required', res });
    }

    const school = await SchoolService.reassignSchoolManager(schoolId, newManagerId);

    return ResponseService({
      data: school,
      status: 200,
      success: true,
      message: 'School reassigned successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: null,
      status: 400,
      success: false,
      message: error.message || 'Failed to reassign school',
      res,
    });
  }
};

/**
 * List pending schools (Admin)
 */
export const listPendingSchools = async (req: IRequestUser, res: Response) => {
  try {

    const {page,limit,offset}=getPagination(
       parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );
    const {rows,count} = await SchoolService.getPendingSchools(limit,offset);

    return ResponseService({
        data: {
    schools: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  },
      status: 200,
      success: true,
      message: 'Pending schools retrieved successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error fetching pending schools:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to fetch pending schools',
      res,
    });
  }
};

/**
 * List approved schools (Admin)
 */
export const listApprovedSchools = async (req: Request, res: Response) => {
  try {

     const { page, limit, offset } = getPagination(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );
      const result = await SchoolService.getApprovedSchools(limit, offset, page);

    return ResponseService({
      data: result,
      status: 200,
      success: true,
      message: 'Aprroved schools retrieved successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error fetching approved schools:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to fetch approved schools',
      res,
    });
  }
};

/**
 * List rejected schools (Admin)
 */
export const listRejectedSchools = async (req: IRequestUser, res: Response) => {
  try {
      const { page, limit, offset } = getPagination(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );

    const result = await SchoolService.getRejectedSchools(limit, offset, page);

    return ResponseService({
      data: result,
      status: 200,
      success: true,
      message: 'Rejected schools retrieved successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error fetching rejected schools:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to fetch rejected schools',
      res,
    });
  }
};

/**
 * Get school details by ID (Admin or Manager)
 */
export const getSchoolDetails = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const school = await SchoolService.getSchoolById(schoolId);

    if (!school) {
      return ResponseService({
        data: null,
        status: 404,
        success: false,
        message: 'School not found',
        res,
      });
    }

    return ResponseService({
      data: school,
      status: 200,
      success: true,
      message: 'School details retrieved successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error fetching school details:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to fetch school details',
      res,
    });
  }

};

export const listSchools = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPagination(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );

    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;

    const result = await SchoolService.getSchools(limit, offset, page, status);

    return ResponseService({
      data: result,
      status: 200,
      success: true,
      message: 'Schools retrieved successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error fetching schools:', error);
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to fetch schools',
      res,
    });
  }
};

export const resubmitSchool = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const updatedData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    // Handle licenseDocument file if uploaded
    if (req.file) {
      const fileUrl = await uploadToCloud(req.file);
      updatedData.licenseDocument = fileUrl;
    }

    const school = await SchoolService.resubmitSchool(schoolId,getUserId(req), updatedData);

    return ResponseService({
      data: school,
      status: 200,
      success: true,
      message: 'School resubmitted successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to resubmit school',
      res,
    });
  }
};
export const deleteSchool = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    if (!schoolId) {  
      return ResponseService({
        data: null, 
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    await SchoolService.deleteSchool(schoolId);
    return ResponseService({
      data: null,
      status: 200,
      success: true,
      message: 'School deleted successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to delete school',
      res,
    });
  } 
};
export const SchoolSearch = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { page: pageQuery, limit: limitQuery, ...queryFilters } = req.query;

    const { page, limit, offset } = getPagination(
      parseInt(pageQuery as string) || 1,
      parseInt(limitQuery as string) || 10
    );

    
    const filters: SearchFilters = {
      schoolName: queryFilters.schoolName ? String(queryFilters.schoolName) : undefined,
      district: queryFilters.district ? String(queryFilters.district) : undefined,
      schoolType: queryFilters.schoolType ? String(queryFilters.schoolType) : undefined,
      schoolLevel: queryFilters.schoolLevel ? String(queryFilters.schoolLevel) : undefined,
      schoolCategory: queryFilters.schoolCategory ? String(queryFilters.schoolCategory) : undefined,
      yearOfStudy: queryFilters.yearOfStudy ? String(queryFilters.yearOfStudy) : undefined,
      combination: queryFilters.combination ? String(queryFilters.combination) : undefined,
      academicYear: queryFilters.academicYear ? String(queryFilters.academicYear) : undefined,
      minAvailableSpots: queryFilters.minAvailableSpots ? parseInt(String(queryFilters.minAvailableSpots)) : undefined,
      studentType: queryFilters.studentType ? String(queryFilters.studentType) : undefined,
    };

    const result = await SchoolService.searchSchools(limit, offset, page, filters);

    return ResponseService({
      data: result,
      status: 200,
      success: true,
      message: 'Schools retrieved successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message || error,
      status: 500,
      success: false,
      message: 'Failed to search schools',
      res,
    });
  }
};