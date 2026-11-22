import { User } from "../database/models/User";
import {
  comparePassword,
  generateToken,
  destroyToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from "../utils/helper";
import { hashPassword } from "../utils/helper";
import { redis } from "../utils/redis";
import { emailEmitter } from "../events/emailEvent";
import { School } from "../database/models/School";
import { Role } from "../database/models/Roles";


interface LoginDto {
  email: string;
  password: string;
}

export class AuthService {

  async login(dto: LoginDto) {
    
    const user = await User.findOne({
      where: { email: dto.email },
      include: [{ model: Role, as: "role", attributes: ["id", "name"] }],
    });

    if (!user) {
      return { success: false, status: 404, message: "User not Found", data: null };
    }

    if (!user.password) {
      return { success: false, status: 500, message: "User password not set", data: null };
    }

    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch) {
      return { success: false, status: 401, message: "Incorrect email or password", data: null };
    }

    if (!user.id || !user.email || !user.role) {
      return { success: false, status: 500, message: "User data incomplete for token generation", data: null };
    }

    const token = await generateToken({
      id: user.id,
      email: user.email,
      role: user.role.id,
    });

    const refreshToken = await generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role.id,
    });


    let schoolStatus: "not_registered" | "pending" | "approved" | "rejected" | null = null;

    if (user.role.name === "SchoolManager") {
      const school = await School.findOne({ where: { userId: user.id } });
      if (!school) {
        schoolStatus = "not_registered";
      } else {
        switch (school.status) {
          case "not_registered":
          case "pending":
            schoolStatus = "pending"; // mapped to pending for frontend
            break;
          case "approved":
            schoolStatus = "approved";
            break;
          case "rejected":
            schoolStatus = "rejected";
            break;
          default:
            schoolStatus = "not_registered";
        }
      }
    }

    const responseData: any = {
      user: {

        email: user.email,
        name:user.firstName + ' ' + user.lastName,
        roleName: user.role.name,
        mustChangePassword: user.mustChangePassword ?? false,
      },
      token,
      refreshToken,
    };

    if (schoolStatus) responseData.schoolStatus = schoolStatus;

    return {
      success: true,
      status: 200,
      message: "Login successful",
      data: responseData,
    };
  }


  // Logout
  async logout(token: string | undefined, refreshToken?: string) {
    if (!token) {
      return { success: false, status: 400, message: "Token missing", data: null };
    }

    await destroyToken(token);

    if (refreshToken) {
      try {
        const decoded = await verifyRefreshToken(refreshToken);
        await revokeRefreshToken(decoded.jti);
      } catch {
        // Already expired/revoked - nothing left to clean up.
      }
    }

    return { success: true, status: 200, message: "Logged out successfully", data: null };
  }

  // Exchanges a still-valid refresh token for a new access + refresh token
  // pair. The refresh token is single-use (rotated): the old one is revoked
  // before the new pair is issued, so a stolen/replayed refresh token can't
  // be used twice.
  async refreshAccessToken(refreshToken: string | undefined) {
    if (!refreshToken) {
      return { success: false, status: 400, message: "Refresh token missing", data: null };
    }

    try {
      const decoded = await verifyRefreshToken(refreshToken);
      await revokeRefreshToken(decoded.jti);

      const newToken = await generateToken({ id: decoded.id, email: decoded.email, role: decoded.role });
      const newRefreshToken = await generateRefreshToken({ id: decoded.id, email: decoded.email, role: decoded.role });

      const data: { token: string; refreshToken?: string } = { token: newToken, refreshToken: newRefreshToken };
      return {
        success: true,
        status: 200,
        message: "Token refreshed successfully",
        data,
      };
    } catch {
      return { success: false, status: 401, message: "Invalid or expired refresh token", data: null };
    }
  }
}


export class PasswordResetService {
  static generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async requestReset(email: string) {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    const otp = this.generateCode();
    await redis.setEx(`resetCode:${otp}`, 300, email); 

    emailEmitter.emit("sendResetCode", email, otp);
  }

  static async verifyOtp(otp: string) {
    const email = await redis.get(`resetCode:${otp}`);
    if (!email) throw new Error("Invalid or expired OTP");

    await redis.setEx(`resetSession:${email}`, 600, email); 
    await redis.del(`resetCode:${otp}`);
  }

 static async resetPassword(newPassword: string): Promise<void> {
    
    const keys: string[] = await redis.keys("resetSession:*");
    if (keys.length === 0) throw new Error("No active reset session");

    
    const sessionKey = keys[0];
    if (!sessionKey) throw new Error("No active reset session (unexpected)");

    const email = await redis.get(sessionKey);
    if (!email) throw new Error("Reset session expired or invalid");

    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");
    user.password = await hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    await redis.del(sessionKey);
  }
}