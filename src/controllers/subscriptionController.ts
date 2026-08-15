import { Response, Request } from 'express';
import crypto from 'crypto';
import { ResponseService } from '../utils/response';
import { IRequestUser } from '../middlewares/authMiddleware';
import { User } from '../database/models/User';
import * as SubscriptionService from '../services/subscriptionService';

const getOwnSchoolId = async (req: IRequestUser): Promise<string> => {
  if (!req.user?.id) throw new Error('Unauthorized: User not found');
  const user = await User.findByPk(req.user.id);
  if (!user || !user.schoolId) throw new Error('You are not linked to a school');
  return user.schoolId;
};

export const getSubscriptionSettings = async (_req: IRequestUser, res: Response) => {
  try {
    const settings = await SubscriptionService.getSettings();
    return ResponseService({ data: settings, status: 200, success: true, message: 'Subscription settings fetched successfully', res });
  } catch (e: any) {
    return ResponseService({ data: null, status: 400, success: false, message: e.message, res });
  }
};

export const updateSubscriptionSettings = async (req: IRequestUser, res: Response) => {
  try {
    if (!req.user?.id) {
      return ResponseService({ data: null, status: 401, success: false, message: 'User not authenticated', res });
    }
    const settings = await SubscriptionService.updateSettings(req.user.id, req.body);
    return ResponseService({ data: settings, status: 200, success: true, message: 'Subscription settings updated successfully', res });
  } catch (e: any) {
    return ResponseService({ data: null, status: 400, success: false, message: e.message, res });
  }
};

export const listAllPayments = async (req: Request, res: Response) => {
  try {
    const { schoolId, status } = req.query;
    const filters: { schoolId?: string; status?: string } = {};
    if (schoolId) filters.schoolId = String(schoolId);
    if (status) filters.status = String(status);
    const payments = await SubscriptionService.listPayments(filters);
    return ResponseService({ data: payments, status: 200, success: true, message: 'Payments fetched successfully', res });
  } catch (e: any) {
    return ResponseService({ data: null, status: 400, success: false, message: e.message, res });
  }
};

export const getMySubscription = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = await getOwnSchoolId(req);
    const subscription = await SubscriptionService.getSchoolSubscription(schoolId);
    return ResponseService({ data: subscription, status: 200, success: true, message: 'Subscription status fetched successfully', res });
  } catch (e: any) {
    return ResponseService({ data: null, status: 400, success: false, message: e.message, res });
  }
};

export const payMySubscription = async (req: IRequestUser, res: Response) => {
  try {
    if (!req.user?.id) {
      return ResponseService({ data: null, status: 401, success: false, message: 'User not authenticated', res });
    }
    const schoolId = await getOwnSchoolId(req);
    const { phoneNumber } = req.body;
    const payment = await SubscriptionService.initiatePayment(schoolId, req.user.id, phoneNumber);
    return ResponseService({
      data: payment,
      status: 202,
      success: true,
      message: 'Payment initiated. Approve the prompt on your phone to complete it.',
      res,
    });
  } catch (e: any) {
    return ResponseService({ data: null, status: 400, success: false, message: e.message, res });
  }
};

export const listMyPayments = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = await getOwnSchoolId(req);
    const payments = await SubscriptionService.listPayments({ schoolId });
    return ResponseService({ data: payments, status: 200, success: true, message: 'Payments fetched successfully', res });
  } catch (e: any) {
    return ResponseService({ data: null, status: 400, success: false, message: e.message, res });
  }
};

const isValidSignature = (rawBody: Buffer | undefined, signature: string | undefined): boolean => {
  const secret = process.env.PAYPACK_WEBHOOK_SECRET;
  if (!secret || !rawBody || !signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const expectedBuf = Buffer.from(expected);
  const signatureBuf = Buffer.from(signature);
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
};

export const handlePaypackWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-paypack-signature'] as string | undefined;
  const rawBody = (req as any).rawBody as Buffer | undefined;

  if (!isValidSignature(rawBody, signature)) {
    return ResponseService({ data: null, status: 401, success: false, message: 'Invalid webhook signature', res });
  }

  try {
    const event = req.body as { kind: string; data: { ref: string; status: string } };
    if (event.kind === 'transaction:processed' && event.data?.ref) {
      await SubscriptionService.handlePaymentWebhook({
        ref: event.data.ref,
        status: event.data.status,
        raw: event,
      });
    }
    return ResponseService({ data: null, status: 200, success: true, message: 'Webhook processed', res });
  } catch (e: any) {
    return ResponseService({ data: null, status: 400, success: false, message: e.message, res });
  }
};
