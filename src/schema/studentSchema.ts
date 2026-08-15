// src/schemas/studentSchema.ts
import Joi from 'joi';

export const createStudentSchema = Joi.object({
  schoolId: Joi.string().uuid().optional(),
  schoolSpotId: Joi.string().uuid().required(),
  firstName: Joi.string().required(),
  middleName: Joi.string().optional(),
  lastName: Joi.string().required(),
  gender: Joi.string().valid('MALE','FEMALE','OTHER').required(),
  DOB: Joi.date().required(),
  studentType: Joi.string().valid('newcomer','transfer').required(),
  // passportPhoto arrives as a multipart file (req.files), not a body field -
  // its presence is enforced separately in the controller, not here.
  passportPhoto: Joi.string().optional(),
  fathersNames: Joi.string().required(),
  mothersNames: Joi.string().required(),
  representerEmail: Joi.string().email().required(),
  representerPhone: Joi.string().required(),
  nationality: Joi.string().required(),
  province: Joi.string().required(),
  district: Joi.string().required(),
  sector: Joi.string().required(),
  cell: Joi.string().required(),
  village: Joi.string().required(),
  resultSlip: Joi.string().optional(),
  previousReport: Joi.string().optional(),
  mitationLetter: Joi.string().optional(),
});



export const createApplicationSchema = Joi.object({
  studentId: Joi.string().uuid().required(),
  status: Joi.string().valid('pending','approved','rejected').optional(),
});
