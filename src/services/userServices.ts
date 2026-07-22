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
  currentUser: { id?: string; role?: string; schoolId?: string }
): Promise<User> {
  if (currentUser.role !== "SchoolManager") {
    throw new Error("Only School Managers can create an Admission Manager");
  }

  if (currentUser.schoolId !== schoolId) {
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
      const school = await School.findByPk(requestingUser.schoolId);
      if (!school || school.status !== "approved") {
        throw new Error("Your school is not approved yet. Action blocked.");
      }

      const admissionRole = await Role.findOne({ where: { name: "AdmissionManager" } });
      if (!admissionRole) throw new Error("AdmissionManager role not found");

      return await User.findAll({
        where: {
          schoolId: requestingUser.schoolId,
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
      const school = await School.findByPk(requestingUser.schoolId);
      if (!school || school.status !== "approved") {
        throw new Error("Your school is not approved yet. Action blocked.");
      }
    }

    return user;
  }

  // Update user
  static async updateUser(requestingUser: any, userId: string, data: any) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const requesterRole = await Role.findByPk(requestingUser.role);
    if (!requesterRole) throw new Error("Invalid role");

    // Hash password if updating it
    if (data.password) data.password = await hashPassword(data.password);
    else delete data.password;

    // Self update
    if (requestingUser.id === user.id) return await user.update(data);

    // Admin can update anyone
    if (requesterRole.name === "Admin") return await user.update(data);

    // SchoolManager can update AdmissionManagers in their school
    if (
      requesterRole.name === "SchoolManager" &&
      user.schoolId === requestingUser.schoolId
    ) {
      const targetRole = await Role.findByPk(user.roleId);
      if (targetRole?.name === "AdmissionManager") return await user.update(data);
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

    if (
      requesterRole.name === "SchoolManager" &&
      userToDelete.schoolId === requestingUser.schoolId &&
      targetRole?.name === "AdmissionManager"
    ) {
      await userToDelete.destroy();
      return true;
    }

    throw new Error("You do not have permission to delete this user");
  }
}
