// src/services/studentService.ts
import { Student } from '../database/models/Student';
import { Application } from '../database/models/Application';
import { SchoolSpot } from '../database/models/SchoolSpot';
import { emailEmitter } from '../events/emailEvent';
import { School } from '../database/models/School';
import { uploadToCloud } from '../utils/uploadHelper';

export const createStudentApplication = async (data: any) => {
  const spot = await SchoolSpot.findByPk(data.schoolSpotId, {
    include: ['school'], 
  });
  if (!spot) throw new Error('School spot not found');

  
  const school = spot.get('school') as School | null;
  if (!school) throw new Error('Associated school not found');

  
  const student = await Student.create({
    ...data,
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
export const getPendingApplications = async (managerId: string) => {
  const school = await School.findOne({ where: { userId: managerId } });
  if (!school) throw new Error('School not found for manager');

  return Student.findAll({
    where: { status: 'pending', schoolId: school.id },
    include: ['application'],
    order: [['createdAt', 'DESC']],
  });
};
export const approveApplication = async (studentId: string, babyeyiFile: Express.Multer.File) => {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error('Student not found');

  
  const babyeyiUrl = await uploadToCloud(babyeyiFile);

  student.status = 'approved';
  student.babyeyiDocument = babyeyiUrl;
  await student.save();

  const application = await Application.findOne({ where: { studentId } });
  if (application) {
    application.status = 'approved';
    await application.save();
  }

  
  emailEmitter.emit('studentApplicationApproved', {
    parentEmail: student.representerEmail,
    studentName: `${student.firstName} ${student.lastName}`,
    babyeyiUrl,
  });

  return student;
};
export const rejectApplication = async (studentId: string, reason: string) => {
  const student = await Student.findByPk(studentId);
  if (!student) throw new Error('Student not found');

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