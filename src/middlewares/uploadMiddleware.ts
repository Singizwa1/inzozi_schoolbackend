
import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';


const storage = multer.memoryStorage();


const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
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
