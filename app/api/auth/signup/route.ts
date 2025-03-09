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

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      username,
      password,
      budget: 9000000,
      team: [],
    });

    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id?.toString() || "",
      username: user.username as string,
      role: username === process.env.ADMIN_USERNAME ? "admin" : "user",
    });

    // Create response
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: user._id,
          username: user.username,
          budget: user.budget,
          role: username === process.env.ADMIN_USERNAME ? "admin" : "user",
        },
      },
      { status: 201 }
    );

    // Set token in cookie
    return setTokenCookie(token, response);
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
