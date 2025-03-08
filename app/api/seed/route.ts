import { NextRequest, NextResponse } from "next/server";
import {
  importPlayersFromCSV,
  createPredefinedUser,
} from "@/app/lib/utils/importPlayers";

export async function GET(req: NextRequest) {
  try {
    // Import players from CSV
    await importPlayersFromCSV();

    // Create predefined user with team
    await createPredefinedUser();

    return NextResponse.json(
      { message: "Database seeded successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { message: "Error seeding database" },
      { status: 500 }
    );
  }
}
