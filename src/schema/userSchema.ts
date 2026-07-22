
import Joi from 'joi';

export const createSchoolManagerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  province: Joi.string().optional(),
  district: Joi.string().required(),
  schoolId: Joi.string().uuid().optional(),
});

export const createAdmissionManagerSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').required(),
  district: Joi.string().required(),
  schoolId: Joi.string().uuid().required(),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  province: Joi.string().optional(),
  district: Joi.string().optional(),
profileImage:Joi.string().optional(),
  schoolId:Joi.string().optional(),
});
