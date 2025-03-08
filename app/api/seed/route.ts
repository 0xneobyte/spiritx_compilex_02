import { NextRequest, NextResponse } from "next/server";
import {
  importPlayersFromCSV,
  createPredefinedUser,
} from "@/app/lib/utils/importPlayers";
import { connectToDB } from "@/app/lib/utils/database";
import Player from "@/app/lib/models/player";
import User from "@/app/lib/models/user";
import fs from "fs";
import path from "path";

// For debugging only - remove in production
export const dynamic = "force-dynamic"; // Disable caching

export async function GET(req: NextRequest) {
  try {
    console.log("Starting database seeding process...");

    // First, connect to the database
    await connectToDB();
    console.log("Database connected successfully");

    // Check if CSV file exists
    const csvFilePath = path.join(process.cwd(), "sample_data.csv");
    if (!fs.existsSync(csvFilePath)) {
      console.error(`CSV file not found at path: ${csvFilePath}`);
      return NextResponse.json(
        { message: `CSV file not found at path: ${csvFilePath}` },
        { status: 404 }
      );
    }
    console.log(`Found CSV file at: ${csvFilePath}`);

    // Check current state of database
    const playersCount = await Player.countDocuments();
    const usersCount = await User.countDocuments();
    console.log(
      `Current database state: ${playersCount} players, ${usersCount} users`
    );

    // Import players from CSV
    const importResult = await importPlayersFromCSV();
    console.log("Player import result:", importResult);

    // Create predefined user with team
    const userResult = await createPredefinedUser();
    console.log("Predefined user creation result:", userResult);

    // Check final state
    const finalPlayersCount = await Player.countDocuments();
    const finalUsersCount = await User.countDocuments();
    const predefinedUser = await User.findOne({
      username: "spiritx_2025",
    }).populate("team");

    return NextResponse.json(
      {
        message: "Database seeding successfully initiated",
        details: {
          playersImported: finalPlayersCount - playersCount,
          totalPlayers: finalPlayersCount,
          usersCreated: finalUsersCount - usersCount,
          totalUsers: finalUsersCount,
          predefinedUser: predefinedUser
            ? {
                username: predefinedUser.username,
                teamSize: predefinedUser.team?.length || 0,
                budget: predefinedUser.budget,
              }
            : null,
          importResult,
          userResult,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      {
        message: "Error seeding database",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
