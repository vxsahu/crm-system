import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import User, { IUser } from '@/models/User';
import dbConnect from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const TOKEN_NAME = 'auth-token';
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Generate JWT token for a user
 */
export function generateToken(user: IUser): string {
  const payload: JWTPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Set authentication cookie
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_MAX_AGE,
    path: '/',
  });
}

/**
 * Clear authentication cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/**
 * Get current user from request
 */
export async function getCurrentUser(): Promise<IUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    await dbConnect();
    const user = await User.findById(payload.userId).select('-password');
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Middleware to protect API routes
 * Returns the authenticated user or throws an error
 */
export async function requireAuth(): Promise<IUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Sanitize user object (remove password)
 */
export function sanitizeUser(user: IUser) {
  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
}
