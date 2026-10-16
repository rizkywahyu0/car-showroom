import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const secretKey = process.env.JWT_SECRET;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing in production!");
}

const JWT_SECRET = new TextEncoder().encode(
  secretKey || "shift-tech-dev-jwt-secret-do-not-use-in-production-2026"
);

export const AUTH_COOKIE_NAME = "shift_auth_session";

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  balance: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password with stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT session token
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Get current authenticated user from Next.js cookies
 */
export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        balance: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
