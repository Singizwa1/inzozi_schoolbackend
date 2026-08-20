
import { Request, Response } from 'express';
import {  createStudentApplication,getPendingApplications, approveApplication, rejectApplication, trackApplication } from '../services/studentService';
import { ResponseService } from '../utils/response';
import { uploadToCloud } from '../utils/uploadHelper';
import { IRequestUser } from '../middlewares/authMiddleware';


const getUserId = (req: IRequestUser): string => {
  if (!req.user || !req.user.id) {
    throw new Error('Unauthorized: User not found');
  }
  return req.user.id;
};

export const submitStudentApplication = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

    if (!files.passportPhoto?.[0]) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Passport photo is required',
        res,
      });
    }

    data.passportPhoto = await uploadToCloud(files.passportPhoto[0]);
    if (files.resultSlip?.[0]) {
      data.resultSlip = await uploadToCloud(files.resultSlip[0]);
    }
    if (files.previousReport?.[0]) {
      data.previousReport = await uploadToCloud(files.previousReport[0]);
    }
    if (files.mitationLetter?.[0]) {
      data.mitationLetter = await uploadToCloud(files.mitationLetter[0]);
    }

    const student = await createStudentApplication(data);

    return ResponseService({
      data: student,
      status: 201,
      success: true,
      message: 'Student application submitted successfully',
      res,
    });
  } catch (error: any) {
    console.error('Error submitting student application:', error);
    return ResponseService({
      data: error.message || error,
      status: 400,
      success: false,
      message: 'Failed to submit student application',
      res,
    });
  }
};
export const handleTrackApplication = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const result = await trackApplication(code as string);

    return ResponseService({
      data: result,
      status: 200,
      success: true,
      message: 'Application status fetched successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: null,
      status: 404,
      success: false,
      message: error.message || 'Application not found',
      res,
    });
  }
};
export const fetchPendingApplications = async (req: Request, res: Response) => {
  try {
    const managerId = getUserId(req);
    const applications = await getPendingApplications(managerId);

    return ResponseService({
      data: applications,
      status: 200,
      success: true,
      message: 'Pending applications fetched successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to fetch pending applications',
      res,
    });
  }
};
export const handleApproveApplication = async (req: IRequestUser, res: Response) => {
  try {
    const { studentId } = req.params;
    if (!req.file) throw new Error('Babyeyi document is required');

    const student = await approveApplication(studentId as string, req.file, getUserId(req));

    return ResponseService({
      data: student,
      status: 200,
      success: true,
      message: 'Application approved and Babyeyi document sent',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to approve application',
      res,
    });
  }
};
export const handleRejectApplication = async (req: IRequestUser, res: Response) => {
  try {
    const { studentId } = req.params;
    const { reason } = req.body;
    if (!reason) throw new Error('Rejection reason is required');

    const student = await rejectApplication(studentId as string, reason, getUserId(req));

    return ResponseService({
      data: student,
      status: 200,
      success: true,
      message: 'Application rejected and parent notified',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to reject application',
      res,
    });
  }
};
