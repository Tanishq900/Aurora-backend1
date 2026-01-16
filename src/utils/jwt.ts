import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

const accessSecret = env.jwtAccessSecret();
const refreshSecret = env.jwtRefreshSecret();
const accessExpiry = env.jwtAccessExpiry() as SignOptions['expiresIn'];
const refreshExpiry = env.jwtRefreshExpiry() as SignOptions['expiresIn'];

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, accessSecret, {
    expiresIn: accessExpiry,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, refreshSecret, {
    expiresIn: refreshExpiry,
  });
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, accessSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, refreshSecret) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
