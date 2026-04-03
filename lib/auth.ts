import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env file');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'viewer' | 'analyst' | 'admin';
  iat?: number;
  exp?: number;
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function setAuthCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return response;
}

export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.delete('auth_token');
  return response;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  // Try cookie first
  const cookieToken = req.cookies.get('auth_token')?.value;
  if (cookieToken) return cookieToken;

  // Fallback: Authorization header
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
}
