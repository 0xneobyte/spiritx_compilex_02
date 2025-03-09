import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

// Define a type for player data
interface PlayerData {
  ballsFaced?: number;
  totalRuns?: number;
  inningsPlayed?: number;
  oversBowled?: number;
  wickets?: number;
  runsConceded?: number;
  battingStrikeRate?: number;
  battingAverage?: number;
  bowlingStrikeRate?: number | null;
  economyRate?: number;
  points?: number;
  value?: number;
  price?: number;
  name?: string;
  university?: string;
  category?: string;
  [key: string]: string | number | boolean | null | undefined; // More specific type for index signature
}

// Helper function to calculate cricket statistics
const calculateStats = (playerData: PlayerData): PlayerData => {
  const updatedPlayer = { ...playerData };

  // Calculate Batting Strike Rate
  if (
    updatedPlayer.ballsFaced &&
    updatedPlayer.ballsFaced > 0 &&
    updatedPlayer.totalRuns !== undefined
  ) {
    updatedPlayer.battingStrikeRate =
      (updatedPlayer.totalRuns / updatedPlayer.ballsFaced) * 100;
  }

  // Calculate Batting Average
  if (
    updatedPlayer.inningsPlayed &&
    updatedPlayer.inningsPlayed > 0 &&
    updatedPlayer.totalRuns !== undefined
  ) {
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
  if (ballsBowled > 0 && updatedPlayer.runsConceded !== undefined) {
    updatedPlayer.economyRate = (updatedPlayer.runsConceded / ballsBowled) * 6;
  } else {
    updatedPlayer.economyRate = 0;
  }

  // Calculate Player Points
  let battingPoints = 0;
  let bowlingPoints = 0;

  // Batting component: (Batting Strike Rate / 5) + (Batting Average × 0.8)
  if (
    updatedPlayer.battingStrikeRate !== undefined &&
    updatedPlayer.battingStrikeRate > 0 &&
    updatedPlayer.battingAverage !== undefined
  ) {
    battingPoints =
      updatedPlayer.battingStrikeRate / 5 + updatedPlayer.battingAverage * 0.8;
  }

  // Bowling component: (500 / Bowling Strike Rate) + (140 / Economy Rate)
  // Only include bowling strike rate component if player has taken wickets
  if (
    updatedPlayer.wickets &&
    updatedPlayer.wickets > 0 &&
    updatedPlayer.bowlingStrikeRate !== null &&
    updatedPlayer.bowlingStrikeRate !== undefined &&
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
    const query: Record<string, string | RegExp> = {};
    if (category && ["Batsman", "Bowler", "All-Rounder"].includes(category)) {
      query.category = category;
    }
    if (search) {
      query.name = new RegExp(search, "i");
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
