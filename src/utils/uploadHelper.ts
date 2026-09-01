import fs from 'fs';
import path from 'path';
import { UPLOADS_ROOT } from '../middlewares/uploadMiddleware';

const PUBLIC_BASE_URL = (process.env.PUBLIC_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

/**
 * Multer's disk storage (see uploadMiddleware.ts) has already written the
 * file to uploads/<folder>/<filename> by the time a controller runs - this
 * just builds the public URL for it. No network call, no await needed;
 * kept as the same function name/shape the codebase already calls
 * (`uploadToStorage(file)`) so every call site stayed a one-line swap from
 * the old Cloudinary version.
 */
export const uploadToStorage = (file: Express.Multer.File): string => {
  const relativePath = path.relative(UPLOADS_ROOT, file.path).split(path.sep).join('/');
  return `${PUBLIC_BASE_URL}/uploads/${relativePath}`;
};

/**
 * Removes a file previously returned by uploadToStorage, given its public
 * URL. Unlike Cloudinary, local disk space isn't free/managed for us, so
 * callers that replace or discard an uploaded asset (e.g. gallery image
 * update/delete) need to actually reclaim it. Silently no-ops for
 * anything that isn't one of our own /uploads URLs (old Cloudinary links
 * still in the DB, external URLs, etc) or that's already gone.
 */
export const deleteFromStorage = (url: string | null | undefined): void => {
  if (!url || !url.startsWith(`${PUBLIC_BASE_URL}/uploads/`)) return;
  const relativePath = url.slice(`${PUBLIC_BASE_URL}/uploads/`.length);
  const filePath = path.join(UPLOADS_ROOT, ...relativePath.split('/'));
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete file at ${filePath}:`, err.message);
    }
  });
};
