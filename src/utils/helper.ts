import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { redis } from './redis';
import { v4 as uuidv4 } from 'uuid';
import { errorLogger } from './logger';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  jti: string;
  iat?: number;
  exp?: number;
}

config();

export const generateSlug = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const hashPassword = async (password: string): Promise<string> =>
  await bcrypt.hash(password, 10);

export const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  await bcrypt.compare(password, hash);

export const secretKey = process.env.JWT_SECRET || 'SecretKey';

export const generateToken = async ({
  id,
  email,
  role,
}: {
  id: string;
  email: string;
  role: string;
}): Promise<string> => {
  const payload = { id, email, role };
  const jti = uuidv4();
  const tokenPayload = { ...payload, jti };
  const token = jwt.sign(tokenPayload, secretKey, { expiresIn: '12h' });

  await redis.setEx(`jwt:${jti}`, 12 * 60 * 60, JSON.stringify(tokenPayload));
  return token;
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const decoded = jwt.verify(token, secretKey) as JWTPayload;
    const storedData = await redis.get(`jwt:${decoded.jti}`);
    if (!storedData) {
      throw new Error('Token not found in Redis - may have been revoked');
    }

    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new Error('Token has been blacklisted');
    }
    return decoded;
  } catch (error) {
    errorLogger(error as Error, 'Token Verification');
    throw error;
  }
};

export const destroyToken = async (token: string | undefined): Promise<void> => {
  try {
    await redis.setEx(`blacklist:${token}`, 24 * 60 * 60, 'true');
  } catch (error) {
    errorLogger(error as Error, 'Token Destruction');
    throw error;
  }
};
