// src/routes/studentRoutes.ts
import { Router } from 'express';
import { submitStudentApplication,fetchPendingApplications,
  handleApproveApplication,
  handleRejectApplication } from '../controllers/studentController';
import { upload } from '../middlewares/uploadMiddleware';
import { authMiddleware,checkRole } from '../middlewares/authMiddleware';

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

router.post('/students/apply', studentFileFields, submitStudentApplication);
/**
 * @swagger
 * /api/students/applications/pending:
 *   get:
 *     summary: Get all pending student applications (SchoolManager)
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

router.get('/students/applications/pending', authMiddleware,checkRole(['SchoolManager']), fetchPendingApplications);

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
  checkRole(['SchoolManager']),
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
router.put('/students/:studentId/reject', authMiddleware,checkRole(['SchoolManager']), handleRejectApplication);

export default router;
