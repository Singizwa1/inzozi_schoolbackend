import { Request, Response } from "express";
import { ResponseService } from "../utils/response";
import { UserService } from "../services/userServices";
import { CreateSchoolManagerDto } from "../types/userInterface";
import { IRequestUser } from "../middlewares/authMiddleware";
import {asString} from '../utils/helper';
import { uploadToCloud } from '../utils/uploadHelper';

export class UserController {

  static async registerSchoolManager(
    req: Request<{}, {}, CreateSchoolManagerDto>,
    res: Response
  ) {
    try {
      const user = await UserService.createSchoolManager(req.body);
      return ResponseService({
        data: { id: user.id, email: user.email, roleId: user.roleId },
        success: true,
        status: 201,
        message: "SchoolManager registered successfully",
        res,
      });
    } catch (error: any) {
      return ResponseService({ data: null, success: false, status: 400, message: error.message, res });
    }
  }

  static async getUsers(req: IRequestUser, res: Response) {
    try {
      const users = await UserService.getAllUsers(req.user);
      return ResponseService({
        data: users,
        success: true,
        status: 200,
        message: "Users fetched successfully",
        res
      });
    } catch (e: any) {
      return ResponseService({ data: null, success: false, status: 400, message: e.message, res });
    }
  }

  static async getMe(req: IRequestUser, res: Response) {
  try {
    if (!req.user?.id) {
      return ResponseService({
        data: null,
        success: false,
        status: 401,
        message: "User not authenticated",
        res
      });
    }

    const user = await UserService.getMe(req.user.id);
    return ResponseService({
      data: user,
      success: true,
      status: 200,
      message: "Authenticated user fetched successfully",
      res
    });
  } catch (e: any) {
    return ResponseService({
      data: null,
      success: false,
      status: 400,
      message: e.message,
      res
    });
  }
}

  static async getUserById(req: IRequestUser, res: Response) {
    const userId = asString(req.params.userId);
    if (!userId) return ResponseService({ data: null, success: false, status: 400, message: "UserId is required", res });

    try {
      const user = await UserService.getUserById(req.user, userId);
      return ResponseService({
        data: user,
        success: true,
        status: 200,
        message: "User fetched successfully",
        res
      });
    } catch (e: any) {
      return ResponseService({ data: null, success: false, status: 403, message: e.message, res });
    }
  }

  static async updateUser(req: IRequestUser, res: Response) {
    if (!req.user?.id) {
      return ResponseService({ data: null, success: false, status: 401, message: "User not authenticated", res });
    }

    const rawUserId = asString(req.params.userId);
    const userId = rawUserId === 'me' ? req.user.id : rawUserId;
    if (!userId) return ResponseService({ data: null, success: false, status: 400, message: "UserId is required", res });

    try {
      const data = { ...req.body };
      if (req.file) {
        data.profileImage = await uploadToCloud(req.file, 'users/profileImages', 'image');
      }

      const updatedUser = await UserService.updateUser(req.user, userId, data);
      return ResponseService({ data: updatedUser, success: true, status: 200, message: "User updated successfully", res });
    } catch (e: any) {
      return ResponseService({ data: null, success: false, status: 403, message: e.message, res });
    }
  }

  static async deleteUser(req: IRequestUser, res: Response) {
    const userId = asString(req.params.userId);
    if (!userId) return ResponseService({ data: null, success: false, status: 400, message: "UserId is required", res });

    try {
      await UserService.deleteUser(req.user, userId);
      return ResponseService({ data: null, success: true, status: 200, message: "User deleted successfully", res });
    } catch (e: any) {
      return ResponseService({ data: null, success: false, status: 403, message: e.message, res });
    }
  }

  static async createAdmissionManager(req: IRequestUser, res: Response) {
  try {
    const schoolId = asString(req.params.schoolId);

    
    if (!req.user?.id) {
      return ResponseService({
        data: null,
        success: false,
        status: 401,
        message: "User not authenticated",
        res,
      });
    }

    
    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    
    const newUser = await UserService.createAdmissionManager(schoolId,req.body,req.user.id);
            

    return ResponseService({
      data: newUser,
      success: true,
      status: 201,
      message: "Admission Manager created successfully",
      res,
    });

  } catch (e: any) {
    return ResponseService({
      data: null,
      success: false,
      status: 400,
      message: e.message || "Failed to create Admission Manager",
      res,
    });
  }
}



}
