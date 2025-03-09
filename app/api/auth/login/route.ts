import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import User from "@/app/lib/models/user";
import { generateToken, setTokenCookie } from "@/app/lib/utils/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { username, password } = await req.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if it's admin login
    console.log("Admin credentials check:", {
      providedUsername: username,
      providedPassword: password,
      expectedUsername: process.env.ADMIN_USERNAME,
      expectedPasswordLength: process.env.ADMIN_PASSWORD?.length,
      match:
        username === process.env.ADMIN_USERNAME &&
        password === process.env.ADMIN_PASSWORD,
    });

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateToken({
        id: "admin",
        username: username,
        role: "admin",
      });

      // Create response for admin
      const response = NextResponse.json(
        {
          message: "Admin logged in successfully",
          user: {
            id: "admin",
            username: username,
            role: "admin",
          },
        },
        { status: 200 }
      );

      // Set token in cookie and return the response
      return setTokenCookie(token, response);
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id: user._id?.toString() || "",
      username: user.username as string,
      role: "user",
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "User logged in successfully",
        user: {
          id: user._id,
          username: user.username,
          budget: user.budget,
          role: "user",
        },
      },
      { status: 200 }
    );

    // Set token in cookie
    return setTokenCookie(token, response);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
