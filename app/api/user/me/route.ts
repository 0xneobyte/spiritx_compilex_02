import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import User from "@/app/lib/models/user";
import { authenticateRequest } from "@/app/lib/utils/auth";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Handle admin user
    if (auth.user.id === "admin") {
      return NextResponse.json(
        {
          id: "admin",
          username: auth.user.username,
          role: "admin",
        },
        { status: 200 }
      );
    }

    // Find the user
    const user = await User.findById(auth.user.id).select("username budget");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: user._id,
        username: user.username,
        budget: user.budget,
        role: auth.user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user info:", error);
    return NextResponse.json(
      { message: "Error fetching user info" },
      { status: 500 }
    );
  }
}
