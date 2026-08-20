import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { School } from '../database/models/School';
import { SubscriptionSetting } from '../database/models/SubscriptionSetting';
import { SubscriptionPayment } from '../database/models/SubscriptionPayment';
import { User } from '../database/models/User';
import { initiateCashin } from '../utils/paypackClient';
import { sendEmail } from '../utils/mailer';

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const settingsUrl = `${FRONTEND_URL}/schoolAdmin/settings`;

const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getSettings = async (): Promise<SubscriptionSetting> => {
  const existing = await SubscriptionSetting.findOne({ order: [['createdAt', 'ASC']] });
  if (existing) return existing;
  return SubscriptionSetting.create({});
};

export const updateSettings = async (
  adminId: string,
  data: { trialPeriodMonths?: number; billingPeriodMonths?: number; subscriptionFee?: number }
): Promise<SubscriptionSetting> => {
  const settings = await getSettings();
  await settings.update({ ...data, updatedBy: adminId });
  return settings;
};

// Called when a school is approved: starts the free trial clock
export const startTrial = async (school: School, transaction?: any): Promise<void> => {
  const settings = await getSettings();
  school.subscriptionStatus = 'trial';
  school.trialEndsAt = addMonths(new Date(), settings.trialPeriodMonths);
  school.currentPeriodEnd = null;
  school.reminderSentAt = null;
  await school.save({ transaction });
};

const getEffectiveEndDate = (school: School): Date | null => {
  return school.currentPeriodEnd ?? school.trialEndsAt ?? null;
};

export const getSchoolSubscription = async (schoolId: string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  const settings = await getSettings();
  const endDate = getEffectiveEndDate(school);
  const daysRemaining = endDate
    ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    subscriptionStatus: school.subscriptionStatus,
    trialEndsAt: school.trialEndsAt,
    currentPeriodEnd: school.currentPeriodEnd,
    daysRemaining,
    subscriptionFee: Number(settings.subscriptionFee),
    billingPeriodMonths: settings.billingPeriodMonths,
  };
};

export const initiatePayment = async (schoolId: string, userId: string, phoneNumber: string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  const settings = await getSettings();
  const amount = Number(settings.subscriptionFee);
  if (!amount || amount <= 0) throw new Error('Subscription fee has not been configured yet');

  const idempotencyKey = uuidv4().slice(0, 32);
  const transaction = await initiateCashin(amount, phoneNumber, idempotencyKey);

  const payment = await SubscriptionPayment.create({
    schoolId,
    initiatedBy: userId,
    amount,
    phoneNumber,
    paypackRef: transaction.ref,
    status: 'pending',
  });

  return payment;
};

export const listPayments = async (filters: { schoolId?: string; status?: string }) => {
  const where: any = {};
  if (filters.schoolId) where.schoolId = filters.schoolId;
  if (filters.status) where.status = filters.status;

  return SubscriptionPayment.findAll({
    where,
    include: [{ model: School, as: 'school', attributes: ['id', 'schoolName'] }],
    order: [['createdAt', 'DESC']],
  });
};

// Applies a Paypack `transaction:processed` webhook event
export const handlePaymentWebhook = async (payload: {
  ref: string;
  status: string;
  raw: Record<string, any>;
}): Promise<void> => {
  const payment = await SubscriptionPayment.findOne({ where: { paypackRef: payload.ref } });
  if (!payment) return;

  if (payment.status !== 'pending') return; // already processed, ignore duplicate webhook delivery

  const isSuccessful = payload.status === 'successful';
  payment.status = isSuccessful ? 'successful' : 'failed';
  payment.rawWebhookPayload = payload.raw;
  await payment.save();

  if (!isSuccessful) return;

  const school = await School.findByPk(payment.schoolId);
  if (!school) return;

  const settings = await getSettings();
  const baseline = school.currentPeriodEnd && school.currentPeriodEnd.getTime() > Date.now()
    ? school.currentPeriodEnd
    : new Date();

  school.currentPeriodEnd = addMonths(baseline, settings.billingPeriodMonths);
  school.subscriptionStatus = 'active';
  school.reminderSentAt = null;
  await school.save();
};

// Nightly sweep: expires lapsed subscriptions and sends "ending soon" reminders
export const runNightlySubscriptionSweep = async (): Promise<void> => {
  const now = new Date();
  const reminderWindowEnd = addMonths(now, 0);
  reminderWindowEnd.setDate(reminderWindowEnd.getDate() + 7);

  const schools = await School.findAll({
    where: {
      status: 'approved',
      subscriptionStatus: { [Op.ne]: 'expired' },
    },
  });

  for (const school of schools) {
    const endDate = getEffectiveEndDate(school);
    if (!endDate) continue;

    if (endDate.getTime() <= now.getTime()) {
      school.subscriptionStatus = 'expired';
      await school.save();
      continue;
    }

    const withinReminderWindow = endDate.getTime() <= reminderWindowEnd.getTime();
    if (withinReminderWindow && !school.reminderSentAt) {
      const manager = await User.findByPk(school.userId);
      if (manager) {
        const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        try {
          await sendEmail(manager.email, 'Your Inzozi subscription is ending soon', 'subscriptionReminder', {
            managerName: manager.firstName,
            schoolName: school.schoolName,
            daysRemaining,
            endDate,
            settingsUrl,
          });
        } catch (err) {
          console.error('Failed to send subscription reminder email:', err);
        }
      }
      school.reminderSentAt = now;
      await school.save();
    }
  }
};
