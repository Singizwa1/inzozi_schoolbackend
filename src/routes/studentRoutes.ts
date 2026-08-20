// src/routes/studentRoutes.ts
import { Router } from 'express';
import { submitStudentApplication,fetchPendingApplications,
  handleApproveApplication,
  handleRejectApplication,
  handleTrackApplication } from '../controllers/studentController';
import { upload } from '../middlewares/uploadMiddleware';
import { authMiddleware,checkRole } from '../middlewares/authMiddleware';
import { requireActiveSubscription } from '../middlewares/subscriptionMiddleware';
import { ValidationMiddleware } from '../middlewares/validationMiddleware';
import { createStudentSchema } from '../schema/studentSchema';

const router = Router();

const studentFileFields = upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'resultSlip', maxCount: 1 },
  { name: 'previousReport', maxCount: 1 },
  { name: 'mitationLetter', maxCount: 1 },
]);

/**
 * @swagger
 * /api/students/apply:
 *   post:
 *     summary: Parent applies for a student (child)
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentSchema'
 *     responses:
 *       201:
 *         description: Student application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponseSchema'
 */

router.post(
  '/students/apply',
  studentFileFields,
  ValidationMiddleware({ type: 'body', schema: createStudentSchema }),
  submitStudentApplication
);
/**
 * @swagger
 * /api/students/applications/pending:
 *   get:
 *     summary: Get all pending student applications (SchoolManager or AdmissionManager)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending student applications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PendingApplicationsResponseSchema'
 */

router.get('/students/applications/pending', authMiddleware,checkRole(['SchoolManager', 'AdmissionManager']), requireActiveSubscription, fetchPendingApplications);

/**
 * @swagger
 * /api/students/{studentId}/approve:
 *   put:
 *     summary: Approve student application and send babyeyi document to parent
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ApproveApplicationSchema'
 *     responses:
 *       200:
 *         description: Student approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponseSchema'
 */
router.put(
  '/students/:studentId/approve',
  authMiddleware,
  checkRole(['SchoolManager', 'AdmissionManager']),
  requireActiveSubscription,
  upload.single('babyeyiDocument'),
  handleApproveApplication
);
/**
 * @swagger
 * /api/students/{studentId}/reject:
 *   put:
 *     summary: Reject student application and send rejection reason to parent
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RejectApplicationSchema'
 *     responses:
 *       200:
 *         description: Student rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StudentResponseSchema'
 */
router.put('/students/:studentId/reject', authMiddleware,checkRole(['SchoolManager', 'AdmissionManager']), requireActiveSubscription, handleRejectApplication);

/**
 * @swagger
 * /api/students/track/{code}:
 *   get:
 *     summary: Public application status lookup by tracking code (no auth - the code itself is the access control)
 *     tags: [Students]
 *     parameters:
 *       - name: code
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application status fetched successfully
 *       404:
 *         description: Application not found
 */
router.get('/students/track/:code', handleTrackApplication);

export default router;
