import fs from 'fs';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Every uploaded field lands in a folder mirroring what its content
// actually is, under the project's uploads/ root - keeps the same
// organization the old Cloudinary folder args were meant to provide
// (most of them were never actually passed, so everything used to land
// in one bucket regardless of type).
const FIELD_FOLDERS: Record<string, string> = {
  licenseDocument: 'schools/licenses',
  profilePhoto: 'schools/profiles',
  imageUrl: 'schools/gallery',
  babyeyiDocument: 'students/babyeyi',
  passportPhoto: 'students/documents',
  resultSlip: 'students/documents',
  previousReport: 'students/documents',
  mitationLetter: 'students/documents',
  profileImage: 'users/profileImages',
};

export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    const folder = FIELD_FOLDERS[file.fieldname] ?? 'misc';
    const fullPath = path.join(UPLOADS_ROOT, folder);
    fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    // Same collision-proof + extension-preserving scheme the Cloudinary
    // helper used - a missing extension is exactly what caused documents
    // to fail to open correctly after download, so this must never fall
    // through to an extension-less name.
    const ext = path.extname(file.originalname) || MIME_EXTENSIONS[file.mimetype] || '';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.match(/\/(jpeg|jpg|png|pdf)$/)) {
    cb(new Error('Only jpg, jpeg, png, and pdf files are allowed!'));
  } else {
    cb(null, true);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.match(/\/(jpeg|jpg|png)$/)) {
    cb(new Error('Only jpg, jpeg, and png image files are allowed!'));
  } else {
    cb(null, true);
  }
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
