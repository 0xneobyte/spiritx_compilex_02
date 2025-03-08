import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

// Get all players (with additional admin data)
export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    const auth = authenticateRequest(req, "admin");
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();

    // Get query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    // Build query
    const query: any = {};
    if (category && ["Batsman", "Bowler", "All-Rounder"].includes(category)) {
      query.category = category;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Fetch players with filtering
    const players = await Player.find(query).sort({ name: 1 });

    return NextResponse.json({ players }, { status: 200 });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { message: "Error fetching players" },
      { status: 500 }
    );
  }
}

// Create a new player
export async function POST(req: NextRequest) {
  try {
    // Check if user is admin
    const auth = authenticateRequest(req, "admin");
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();

    const playerData = await req.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "university",
      "category",
      "totalRuns",
      "ballsFaced",
      "inningsPlayed",
    ];
    for (const field of requiredFields) {
      if (!playerData[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set as not from original dataset
    playerData.isFromOriginalDataset = false;

    // Create new player
    const player = new Player(playerData);
    await player.save();

    return NextResponse.json(
      {
        message: "Player created successfully",
        player,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { message: "Error creating player" },
      { status: 500 }
    );
  }
}
