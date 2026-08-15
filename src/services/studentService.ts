// src/services/studentService.ts
import { Student } from '../database/models/Student';
import { Application } from '../database/models/Application';
import { SchoolSpot } from '../database/models/SchoolSpot';
import { emailEmitter } from '../events/emailEvent';
import { School } from '../database/models/School';
import { User } from '../database/models/User';
import { uploadToCloud } from '../utils/uploadHelper';
import { sequelize } from '../database';

export const createStudentApplication = async (data: any) => {
  const spot = await SchoolSpot.findByPk(data.schoolSpotId, {
    include: ['school'],
  });
  if (!spot) throw new Error('School spot not found');


  const school = spot.get('school') as School | null;
  if (!school) throw new Error('Associated school not found');


  const student = await Student.create({
    ...data,
    schoolSpotId: spot.id,
    level: spot.level,
    studentType: spot.studentType,
    yearOfStudy: spot.yearofstudy,
    status: 'pending',
  });

  
  await Application.create({ studentId: student.id, status: 'pending' });

  
  emailEmitter.emit('newApplication', {
    parentEmail: student.representerEmail,
    studentName: `${student.firstName} ${student.lastName}`,
    schoolName: school.schoolName,
  });

  
  emailEmitter.emit('notifyManager', {
    managerEmail: school.email, 
    studentName: `${student.firstName} ${student.lastName}`,
    schoolName: school.schoolName,
  });

  return student;
};
// Resolves the school a SchoolManager or AdmissionManager acts on behalf of
const getManagedSchoolId = async (userId: string): Promise<string> => {
  const user = await User.findByPk(userId);
  if (!user || !user.schoolId) throw new Error('You are not linked to a school');
  return user.schoolId;
};

export const getPendingApplications = async (managerId: string) => {
  const schoolId = await getManagedSchoolId(managerId);

  return Student.findAll({
    where: { status: 'pending', schoolId },
    include: ['application'],
    order: [['createdAt', 'DESC']],
  });
};
export const approveApplication = async (studentId: string, babyeyiFile: Express.Multer.File, managerId: string) => {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error('Student not found');

  const schoolId = await getManagedSchoolId(managerId);
  if (student.schoolId !== schoolId) throw new Error('You do not have permission to approve this application');

  // Upload before opening the transaction - no reason to hold a row lock during a network call
  const babyeyiUrl = await uploadToCloud(babyeyiFile);

  await sequelize.transaction(async (t) => {
    // Row-lock the spot so two concurrent approvals can't both squeeze into the last opening
    const spot = await SchoolSpot.findByPk(student.schoolSpotId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!spot) throw new Error('School spot not found');
    if (spot.occupiedSpots >= spot.totalSpots) throw new Error('This spot is already full');

    spot.occupiedSpots += 1;
    await spot.save({ transaction: t });

    student.status = 'approved';
    student.babyeyiDocument = babyeyiUrl;
    await student.save({ transaction: t });

    const application = await Application.findOne({ where: { studentId }, transaction: t });
    if (application) {
      application.status = 'approved';
      await application.save({ transaction: t });
    }
  });

  emailEmitter.emit('studentApplicationApproved', {
    parentEmail: student.representerEmail,
    studentName: `${student.firstName} ${student.lastName}`,
    babyeyiUrl,
  });

  return student;
};
export const rejectApplication = async (studentId: string, reason: string, managerId: string) => {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error('Student not found');

  const schoolId = await getManagedSchoolId(managerId);
  if (student.schoolId !== schoolId) throw new Error('You do not have permission to reject this application');

  student.status = 'rejected';
  student.rejectedReason = reason;
  await student.save();

  const application = await Application.findOne({ where: { studentId } });
  if (application) {
    application.status = 'rejected';
    await application.save();
  }

  
  emailEmitter.emit('studentApplicationRejected', {
    parentEmail: student.representerEmail,
    studentName: `${student.firstName} ${student.lastName}`,
    reason,
  });

  return student;
};