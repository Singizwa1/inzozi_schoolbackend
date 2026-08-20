import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { config } from 'dotenv';
import path from 'path';

config();


const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Cloudinary environment variables are missing");
}


cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

// Upload helper
export const uploadToCloud = (
  file: Express.Multer.File,
  folder: string = 'schools/licenses',
  resourceType: 'raw' | 'image' = 'raw'
): Promise<string> => {
  // Cloudinary's "raw" delivery uses the public_id as-is with no extension
  // unless one is baked into it - so without this, uploaded PDFs/docs come
  // back as an extension-less URL that browsers/OSes can't open as a real
  // document on download. Keeping the original extension on the public_id
  // fixes that for both raw and image uploads.
  const ext = path.extname(file.originalname);
  const publicId = ext ? `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}` : undefined;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType, ...(publicId ? { public_id: publicId } : {}) },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};
