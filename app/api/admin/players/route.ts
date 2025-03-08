import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

// Helper function to calculate cricket statistics
const calculateStats = (playerData: any) => {
  const updatedPlayer = { ...playerData };

  // Calculate Batting Strike Rate
  if (updatedPlayer.ballsFaced && updatedPlayer.ballsFaced > 0) {
    updatedPlayer.battingStrikeRate =
      (updatedPlayer.totalRuns / updatedPlayer.ballsFaced) * 100;
  }

  // Calculate Batting Average
  if (updatedPlayer.inningsPlayed && updatedPlayer.inningsPlayed > 0) {
    updatedPlayer.battingAverage =
      updatedPlayer.totalRuns / updatedPlayer.inningsPlayed;
  }

  // Calculate balls bowled from overs (1 over = 6 balls)
  const ballsBowled = updatedPlayer.oversBowled
    ? updatedPlayer.oversBowled * 6
    : 0;

  // Calculate Bowling Strike Rate: Total Balls Bowled / Total Wickets Taken
  if (updatedPlayer.wickets && updatedPlayer.wickets > 0) {
    updatedPlayer.bowlingStrikeRate = ballsBowled / updatedPlayer.wickets;
  } else {
    // For players with 0 wickets, set to null - we'll display N/A in the UI
    updatedPlayer.bowlingStrikeRate = null;
  }

  // Calculate Economy Rate: (Runs Conceded / Balls Bowled) × 6
  if (ballsBowled > 0) {
    updatedPlayer.economyRate = (updatedPlayer.runsConceded / ballsBowled) * 6;
  } else {
    updatedPlayer.economyRate = 0;
  }

  // Calculate Player Points
  let battingPoints = 0;
  let bowlingPoints = 0;

  // Batting component: (Batting Strike Rate / 5) + (Batting Average × 0.8)
  if (updatedPlayer.battingStrikeRate > 0) {
    battingPoints =
      updatedPlayer.battingStrikeRate / 5 + updatedPlayer.battingAverage * 0.8;
  }

  // Only include bowling strike rate component if player has taken wickets
  if (
    updatedPlayer.wickets &&
    updatedPlayer.wickets > 0 &&
    updatedPlayer.bowlingStrikeRate > 0
  ) {
    bowlingPoints += 500 / updatedPlayer.bowlingStrikeRate;
  }

  // Always include economy rate component if economy rate is > 0
  if (updatedPlayer.economyRate > 0) {
    bowlingPoints += 140 / updatedPlayer.economyRate;
  }

  updatedPlayer.points = battingPoints + bowlingPoints;

  // Calculate Player Value: (9 × Points + 100) × 1000, rounded to nearest 50,000
  if (updatedPlayer.points > 0) {
    const rawValue = (9 * updatedPlayer.points + 100) * 1000;
    updatedPlayer.value = Math.round(rawValue / 50000) * 50000;
  } else {
    updatedPlayer.value = 100000; // Default value
  }

  // Set price to value
  updatedPlayer.price = updatedPlayer.value;

  return updatedPlayer;
};

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

    let playerData = await req.json();

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

    // Calculate statistics
    const updatedPlayer = calculateStats(playerData);

    // Create new player
    const player = new Player(updatedPlayer);
    await player.save();

    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { message: "Error creating player" },
      { status: 500 }
    );
  }
}
