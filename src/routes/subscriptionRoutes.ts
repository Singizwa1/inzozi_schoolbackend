import { Router } from 'express';
import { authMiddleware, checkRole } from '../middlewares/authMiddleware';
import { ValidationMiddleware } from '../middlewares/validationMiddleware';
import { updateSubscriptionSettingsSchema, initiatePaymentSchema } from '../schema/subscriptionSchema';
import * as SubscriptionController from '../controllers/subscriptionController';

const router = Router();

/**
 * @swagger
 * /api/subscription/settings:
 *   get:
 *     summary: Get global subscription settings (Admin only)
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription settings fetched successfully
 */
router.get(
  '/subscription/settings',
  authMiddleware,
  checkRole(['Admin']),
  SubscriptionController.getSubscriptionSettings
);

/**
 * @swagger
 * /api/subscription/settings:
 *   put:
 *     summary: Update global subscription settings - trial length, billing period, fee (Admin only)
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trialPeriodMonths:
 *                 type: integer
 *               billingPeriodMonths:
 *                 type: integer
 *               subscriptionFee:
 *                 type: number
 *     responses:
 *       200:
 *         description: Subscription settings updated successfully
 */
router.put(
  '/subscription/settings',
  authMiddleware,
  checkRole(['Admin']),
  ValidationMiddleware({ type: 'body', schema: updateSubscriptionSettingsSchema }),
  SubscriptionController.updateSubscriptionSettings
);

/**
 * @swagger
 * /api/subscription/payments:
 *   get:
 *     summary: List all subscription payments across schools (Admin only)
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [pending, successful, failed]
 *     responses:
 *       200:
 *         description: Payments fetched successfully
 */
router.get(
  '/subscription/payments',
  authMiddleware,
  checkRole(['Admin']),
  SubscriptionController.listAllPayments
);

/**
 * @swagger
 * /api/subscription/me:
 *   get:
 *     summary: Get the authenticated user's school subscription status
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status fetched successfully
 */
router.get(
  '/subscription/me',
  authMiddleware,
  checkRole(['SchoolManager', 'AdmissionManager']),
  SubscriptionController.getMySubscription
);

/**
 * @swagger
 * /api/subscription/pay:
 *   post:
 *     summary: Pay the subscription fee for the authenticated user's school via Paypack mobile money
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "0788123456"
 *     responses:
 *       202:
 *         description: Payment initiated, awaiting confirmation on the phone
 */
router.post(
  '/subscription/pay',
  authMiddleware,
  checkRole(['SchoolManager']),
  ValidationMiddleware({ type: 'body', schema: initiatePaymentSchema }),
  SubscriptionController.payMySubscription
);

/**
 * @swagger
 * /api/subscription/payments/me:
 *   get:
 *     summary: List the authenticated user's school payment history
 *     tags: [Subscription]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments fetched successfully
 */
router.get(
  '/subscription/payments/me',
  authMiddleware,
  checkRole(['SchoolManager', 'AdmissionManager']),
  SubscriptionController.listMyPayments
);

/**
 * @swagger
 * /api/subscription/webhook:
 *   post:
 *     summary: Paypack webhook endpoint - receives transaction:processed events
 *     tags: [Subscription]
 *     responses:
 *       200:
 *         description: Webhook processed
 */
router.post('/subscription/webhook', SubscriptionController.handlePaypackWebhook);

export default router;
