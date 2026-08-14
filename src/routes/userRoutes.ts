// src/routes/userRoutes.ts
import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware";
import { ValidationMiddleware } from "../middlewares/validationMiddleware";
import { uploadImage } from "../middlewares/uploadMiddleware";
import {
  createSchoolManagerSchema,
  createAdmissionManagerSchema,
  updateUserSchema
} from "../schema/userSchema";

const router = Router();

/**
 * @swagger
 * /api/users/school-manager:
 *   post:
 *     summary: "Register a new School Manager"
 *     tags: [User Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSchoolManagerRequest'
 *     responses:
 *       201:
 *         description: "School Manager registered successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateSchoolManagerResponse'
 */
router.post(
  '/users/school-manager',
  ValidationMiddleware({ type: 'body', schema: createSchoolManagerSchema }),
  UserController.registerSchoolManager
);
/**
 * @swagger
 * /api/users/{schoolId}/admission-manager:
 *   post:
 *     summary: Create an Admission Manager (SchoolManager only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: schoolId
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
 *             $ref: '#/components/schemas/CreateAdmissionManagerRequest'
 *     responses:
 *       201:
 *         description: Admission Manager created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateAdmissionManagerResponse'
 */
router.post(
  '/users/:schoolId/admission-manager',
  authMiddleware,
  checkRole(['SchoolManager']),
  ValidationMiddleware({ type: 'body', schema: createAdmissionManagerSchema }),
  UserController.createAdmissionManager
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: "Get all users (Admin gets all, SchoolManager gets AdmissionManagers in their school)"
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "List of users"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUsersResponse'
 */
router.get(
  '/users',
  authMiddleware,
  checkRole(['Admin', 'SchoolManager']),
  UserController.getUsers
);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: "Get authenticated user"
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "Authenticated user's information"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetMeResponse'
 */
router.get(
  '/users/me',
  authMiddleware,
  UserController.getMe
);

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     summary: "Get a user by ID (Admin any user, SchoolManager: AdmissionManagers in their school)"
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: "User information"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetUserByIdResponse'
 */
router.get(
  '/users/:userId',
  authMiddleware,
  checkRole(['Admin', 'SchoolManager']),
  UserController.getUserById
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     summary: "Delete a user (Admin any user, SchoolManager: AdmissionManagers in their school)"
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: "User deleted successfully"
 */
router.delete(
  '/users/:userId',
  authMiddleware,
  checkRole(['Admin', 'SchoolManager']),
  UserController.deleteUser
);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: "Update user information and photo (use 'me' for your own profile; Admin: any user; SchoolManager: AdmissionManagers in their school)"
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: A user's UUID, or the literal "me" for the authenticated user
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               province:
 *                 type: string
 *               district:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: "User updated successfully"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateUserResponse'
 */
router.put(
  '/users/:userId',
  authMiddleware,
  uploadImage.single('profileImage'),
  ValidationMiddleware({ type: 'body', schema: updateUserSchema }),
  UserController.updateUser
);




export default router;
