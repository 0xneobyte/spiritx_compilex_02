import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "spirit11_default_secret";
const TOKEN_NAME = "spirit11_token";

export type UserRole = "user" | "admin";

export interface JwtPayload {
  id: string;
  username: string;
  role: UserRole;
}

// Generate JWT token
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// Set token in cookies
export const setTokenCookie = (token: string) => {
  cookies().set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
};

// Get token from cookies
export const getTokenCookie = (): string | undefined => {
  return cookies().get(TOKEN_NAME)?.value;
};

// Remove token cookie
export const removeTokenCookie = () => {
  cookies().delete(TOKEN_NAME);
};

// Get current user from token
export const getCurrentUser = (): JwtPayload | null => {
  const token = getTokenCookie();
  if (!token) return null;
  return verifyToken(token);
};

// Authentication middleware
export const authenticateRequest = (
  req: NextRequest,
  requiredRole?: UserRole
): { authenticated: boolean; user?: JwtPayload } => {
  const token = req.cookies.get(TOKEN_NAME)?.value;

  if (!token) {
    return { authenticated: false };
  }

  const user = verifyToken(token);
  if (!user) {
    return { authenticated: false };
  }

  if (requiredRole && user.role !== requiredRole) {
    return { authenticated: false };
  }

  return { authenticated: true, user };
};
