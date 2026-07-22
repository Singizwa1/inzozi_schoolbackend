import { Request, Response } from "express";
import { AuthService,PasswordResetService} from "../services/AuthService";
import { ResponseService } from "../utils/response";
import { IRequestUser } from "../middlewares/authMiddleware";
import { LoginUserRequest } from "../types/userInterface";
import { sendEmail } from "../utils/mailer";

const authService = new AuthService();

export class AuthController {
  // Login
  static async login(req: LoginUserRequest, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      return ResponseService({ data: null, status: 400, success: false, message: "Email and password are required", res });
    }

    const response = await authService.login({ email, password });
    return ResponseService
    ({ ...response, res });
  }

  // Logout
  static async logout(req: IRequestUser, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];
    const response = await authService.logout(token);
    return ResponseService({ ...response, res });
  }
}



export class PasswordResetController {
  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return ResponseService({ res, success: false, status: 400, message: "Email required", data: null });

    try {
      await PasswordResetService.requestReset(email);
      return ResponseService({ res, success: true, status: 200, message: "OTP sent to your email", data: null });
    } catch (e: any) {
      return ResponseService({ res, success: false, status: 400, message: e.message, data: null });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    const { otp } = req.body;
    if (!otp) return ResponseService({ res, success: false, status: 400, message: "OTP required", data: null });

    try {
      await PasswordResetService.verifyOtp(otp);
      return ResponseService({ res, success: true, status: 200, message: "OTP verified successfully. You may now reset your password", data: null });
    } catch (e: any) {
      return ResponseService({ res, success: false, status: 400, message: e.message, data: null });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const { newPassword } = req.body;
    if (!newPassword) return ResponseService({ res, success: false, status: 400, message: "New password required", data: null });

    try {
      await PasswordResetService.resetPassword(newPassword);
      return ResponseService({ res, success: true, status: 200, message: "Password reset successfully", data: null });
    } catch (e: any) {
      return ResponseService({ res, success: false, status: 400, message: e.message, data: null });
    }
  }
}
