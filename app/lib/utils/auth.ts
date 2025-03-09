import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "spirit11_default_secret";
const TOKEN_NAME = "spiritx_token";

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
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("Token verified successfully:", {
      username: decoded.username,
      role: decoded.role,
    });
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

// Set token in cookies using NextResponse
export const setTokenCookie = (
  token: string,
  response = NextResponse.next()
) => {
  response.cookies.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  });
  return response;
};

// Get token from cookies
export const getTokenCookie = (): string | undefined => {
  try {
    // In Next.js 15, cookies() returns a Promise
    // We'll handle this differently in server components vs client components
    if (typeof window === "undefined") {
      // Server-side: we can't use cookies() directly in a synchronous function
      // This is a limitation we'll have to work around
      return undefined;
    } else {
      // Client-side: use document.cookie
      const cookies = document.cookie.split(";");
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split("=");
        if (name === TOKEN_NAME && value) {
          return decodeURIComponent(value);
        }
      }
      return undefined;
    }
  } catch (error) {
    console.error("Error getting token cookie:", error);
    return undefined;
  }
};

// Remove token cookie using NextResponse
export const removeTokenCookie = (response = NextResponse.next()) => {
  response.cookies.delete(TOKEN_NAME);
  return response;
};

// Get current user from token
export const getCurrentUser = (): JwtPayload | null => {
  const token = getTokenCookie();
  if (!token) return null;
  return verifyToken(token);
};

// Authentication middleware
export function authenticateRequest(req: NextRequest, role?: string) {
  try {
    // Get token from cookie
    const token = req.cookies.get(TOKEN_NAME)?.value;
    console.log("Cookie check in authenticateRequest:", {
      cookieName: TOKEN_NAME,
      tokenExists: !!token,
      tokenLength: token?.length,
    });

    if (!token) {
      return { authenticated: false, user: null, message: "No token found" };
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      username: string;
      role: string;
    };

    console.log("Token decoded in authenticateRequest:", {
      username: decoded.username,
      role: decoded.role,
      requiredRole: role,
    });

    // Check role if required
    if (role && decoded.role !== role) {
      return {
        authenticated: false,
        user: decoded,
        message: `Role '${role}' required`,
      };
    }

    return { authenticated: true, user: decoded, message: "Authenticated" };
  } catch {
    return { authenticated: false, user: null, message: "Invalid token" };
  }
}
