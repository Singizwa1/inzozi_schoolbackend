import Joi from 'joi';

export const updateSubscriptionSettingsSchema = Joi.object({
  trialPeriodMonths: Joi.number().integer().min(0).optional(),
  billingPeriodMonths: Joi.number().integer().min(1).optional(),
  subscriptionFee: Joi.number().min(0).optional(),
});

export const initiatePaymentSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^(\+?250|0)7[2389]\d{7}$/)
    .required()
    .messages({ 'string.pattern.base': 'Phone number must be a valid Rwandan mobile money number' }),
});
