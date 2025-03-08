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
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateToken({
        id: "admin",
        username: username,
        role: "admin",
      });

      setTokenCookie(token);

      return NextResponse.json(
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
      id: user._id.toString(),
      username: user.username,
      role: "user",
    });

    // Set token in cookie
    setTokenCookie(token);

    return NextResponse.json(
      {
        message: "User logged in successfully",
        user: {
          id: user._id,
          username: user.username,
          budget: user.budget,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
