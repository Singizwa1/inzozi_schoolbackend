import { User } from "../database/models/User";
import { Role } from "../database/models/Roles";
import { School } from "../database/models/School";
import { hashPassword } from "../utils/helper";
import { CreateSchoolManagerDto, CreateAdmissionManagerDto } from "../types/userInterface";
import { emailEmitter } from "../events/emailEvent";
export class UserService {

  
  static async createSchoolManager(data: CreateSchoolManagerDto): Promise<User> {
    const role = await Role.findOne({ where: { name: 'SchoolManager' } });
    if (!role) throw new Error('SchoolManager role not found');

    const hashedPassword = await hashPassword(data.password);

    const user = await User.create({
      ...data,
      password: hashedPassword,
      roleId: role.id,
    });

    return user;
  }
  static async createAdmissionManager(
  schoolId: string,
  data: CreateAdmissionManagerDto,
  actingUserId: string
): Promise<User> {
  // Role membership is already enforced by the checkRole(['SchoolManager']) route
  // middleware; here we only need to verify this manager owns *this* school.
  const manager = await User.findByPk(actingUserId);
  if (!manager) throw new Error("User not found");

  if (manager.schoolId !== schoolId) {
    throw new Error("You are not authorized to create Admission Managers for this school");
  }

  const role = await Role.findOne({ where: { name: "AdmissionManager" } });
  if (!role) throw new Error("AdmissionManager role not found");

  const plainPassword = data.password; 
  const hashedPassword = await hashPassword(plainPassword);

  const user = await User.create({
    ...data,
    password: hashedPassword,
    roleId: role.id,
    schoolId,
    mustChangePassword: true,
  });

  const school = await School.findByPk(schoolId);

   emailEmitter.emit("admissionManagerCreated", {
    email: user.email,
    name: user.firstName || "Admission Manager",
    password: plainPassword,
    schoolName: school?.schoolName || "your school",
  });

  return user;
}

  
  // requestingUser comes from the JWT payload, which never carries schoolId,
  // so we resolve the acting user's real schoolId from the DB when needed.
  private static async resolveSchoolId(userId: string): Promise<string | null> {
    const user = await User.findByPk(userId);
    return user?.schoolId ?? null;
  }

  static async getAllUsers(requestingUser: any) {
    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");


    if (requesterRole.name === "Admin") {
      return await User.findAll({
        include: [
          { model: Role, as: "role", attributes: ["id", "name"] },
          { model: School, as: "School" }
        ],
      });
    }


    if (requesterRole.name === "SchoolManager") {
      const requesterSchoolId = await this.resolveSchoolId(requestingUser.id);
      if (!requesterSchoolId) throw new Error("You are not linked to a school");

      const school = await School.findByPk(requesterSchoolId);
      if (!school || school.status !== "approved") {
        throw new Error("Your school is not approved yet. Action blocked.");
      }

      const admissionRole = await Role.findOne({ where: { name: "AdmissionManager" } });
      if (!admissionRole) throw new Error("AdmissionManager role not found");

      return await User.findAll({
        where: {
          schoolId: requesterSchoolId,
          roleId: admissionRole.id,
        },
        include: [
          { model: Role, as: "role", attributes: ["id", "name"] },
          { model: School, as: "School" }
        ],
      });
    }

    return [];
  }

  
  static async getMe(userId: string) {
    const user = await User.findByPk(userId, {
      include: [
        { model: Role, as: "role", attributes: ["id", "name"] },
        { model: School, as: "School" },
      
      ],
    });
    if (!user) throw new Error("User not found");
    return user;
  }

  
  static async getUserById(requestingUser: any, userId: string) {
    const user = await User.findByPk(userId, {
      include: [
        { model: Role, as: "role", attributes: ["id", "name"] },
        { model: School, as: "School" },
      ],
    });
    if (!user) throw new Error("User not found");

    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");

    
    if (requesterRole.name === "SchoolManager") {
      const requesterSchoolId = await this.resolveSchoolId(requestingUser.id);
      const school = requesterSchoolId ? await School.findByPk(requesterSchoolId) : null;
      if (!school || school.status !== "approved") {
        throw new Error("Your school is not approved yet. Action blocked.");
      }
    }

    return user;
  }

  // Hashes password (if present) and applies the update to the user
  private static async applyUserUpdate(user: User, data: any) {
    if (data.password) {
      data.password = await hashPassword(data.password);
      data.mustChangePassword = false;
    } else {
      delete data.password;
    }

    return await user.update(data);
  }

  // Update user
  static async updateUser(requestingUser: any, userId: string, data: any) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    // Self update
    if (requestingUser.id === user.id) return await this.applyUserUpdate(user, data);

    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");

    // Admin can update anyone
    if (requesterRole.name === "Admin") return await this.applyUserUpdate(user, data);

    // SchoolManager can update AdmissionManagers in their school
    if (requesterRole.name === "SchoolManager") {
      const requesterSchoolId = await this.resolveSchoolId(requestingUser.id);
      if (requesterSchoolId && user.schoolId === requesterSchoolId) {
        const targetRole = await Role.findByPk(user.roleId);
        if (targetRole?.name === "AdmissionManager") return await this.applyUserUpdate(user, data);
      }
    }

    throw new Error("You do not have permission to update this user");
  }

  // Delete user
  static async deleteUser(requestingUser: any, userId: string) {
    const userToDelete = await User.findByPk(userId);
    if (!userToDelete) throw new Error("User not found");

    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");

    const targetRole = await Role.findByPk(userToDelete.roleId);

    if (requesterRole.name === "Admin") {
      await userToDelete.destroy();
      return true;
    }

    const requesterSchoolId =
      requesterRole.name === "SchoolManager" ? await this.resolveSchoolId(requestingUser.id) : null;

    if (
      requesterRole.name === "SchoolManager" &&
      requesterSchoolId &&
      userToDelete.schoolId === requesterSchoolId &&
      targetRole?.name === "AdmissionManager"
    ) {
      await userToDelete.destroy();
      return true;
    }

    throw new Error("You do not have permission to delete this user");
  }
}
