// src/services/studentService.ts
import { Student } from '../database/models/Student';
import { Application } from '../database/models/Application';
import { SchoolSpot } from '../database/models/SchoolSpot';
import { emailEmitter } from '../events/emailEvent';
import { School } from '../database/models/School';
import { User } from '../database/models/User';
import { uploadToCloud } from '../utils/uploadHelper';
import { sequelize } from '../database';

// no 0/O/1/I/L - avoids visual confusion, matches the migration's backfill alphabet
const TRACKING_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

const generateTrackingCode = (): string => {
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += TRACKING_CODE_ALPHABET[Math.floor(Math.random() * TRACKING_CODE_ALPHABET.length)];
  }
  return code;
};

const generateUniqueTrackingCode = async (): Promise<string> => {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateTrackingCode();
    const existing = await Student.findOne({ where: { trackingCode: code } });
    if (!existing) return code;
  }
  throw new Error('Could not generate a unique tracking code, please retry');
};

const normalizeTrackingCode = (code: string): string =>
  code.trim().toUpperCase().replace(/[\s-]/g, '');

export const createStudentApplication = async (data: any) => {
  const spot = await SchoolSpot.findByPk(data.schoolSpotId, {
    include: ['school'],
  });
  if (!spot) throw new Error('School spot not found');


  const school = spot.get('school') as School | null;
  if (!school) throw new Error('Associated school not found');

  const trackingCode = await generateUniqueTrackingCode();

  const student = await Student.create({
    ...data,
    schoolSpotId: spot.id,
    level: spot.level,
    studentType: spot.studentType,
    yearOfStudy: spot.yearofstudy,
    status: 'pending',
    trackingCode,
  });


  await Application.create({ studentId: student.id, status: 'pending' });


  emailEmitter.emit('newApplication', {
    parentEmail: student.representerEmail,
    studentName: `${student.firstName} ${student.lastName}`,
    schoolName: school.schoolName,
    trackingCode: student.trackingCode,
  });


  emailEmitter.emit('notifyManager', {
    managerEmail: school.email,
    studentName: `${student.firstName} ${student.lastName}`,
    schoolName: school.schoolName,
  });

  return student;
};
// Public tracking lookup by short tracking code (OTP-style, generated at
// application time). No auth - possession of the (unguessable, random) code
// is the access control, the same pattern as a courier tracking number. Only
// returns what the parent already gave us at application time, plus the
// school's decision.
export const trackApplication = async (trackingCode: string) => {
  const student = await Student.findOne({
    where: { trackingCode: normalizeTrackingCode(trackingCode) },
    include: [{ model: School, as: 'school', attributes: ['schoolName'] }],
  });
  if (!student) throw new Error('Application not found');

  const school = student.get('school') as School | null;

  return {
    id: student.id,
    trackingCode: student.trackingCode,
    status: student.status,
    firstName: student.firstName,
    lastName: student.lastName,
    level: student.level,
    yearOfStudy: student.yearOfStudy,
    studentType: student.studentType,
    representerEmail: student.representerEmail,
    schoolName: school?.schoolName ?? null,
    rejectedReason: student.rejectedReason ?? null,
    babyeyiDocument: student.babyeyiDocument ?? null,
    submittedAt: student.createdAt,
    decidedAt: student.status === 'pending' ? null : student.updatedAt,
  };
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