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

  // Only include bowling strike rate component if player has taken wickets
  if (
    updatedPlayer.wickets &&
    updatedPlayer.wickets > 0 &&
    updatedPlayer.bowlingStrikeRate !== null &&
    updatedPlayer.bowlingStrikeRate > 0
  ) {
    bowlingPoints += 500 / updatedPlayer.bowlingStrikeRate;
  }

  // Always include economy rate component if economy rate is > 0
  if (
    updatedPlayer.economyRate !== undefined &&
    updatedPlayer.economyRate > 0
  ) {
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

// Get a specific player
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const auth = authenticateRequest(request, "admin");
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();

    const player = await Player.findById(params.id);

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { message: "Error fetching player" },
      { status: 500 }
    );
  }
}

// Update a player
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const auth = authenticateRequest(request, "admin");
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();

    let playerData = await request.json();
    const player = await Player.findById(params.id);

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Calculate derived statistics
    playerData = calculateStats(playerData);

    // Update player safely - using mongoose's set method
    for (const [key, value] of Object.entries(playerData)) {
      if (key !== "_id") {
        player.set(key, value);
      }
    }

    await player.save();

    return NextResponse.json(
      {
        message: "Player updated successfully",
        player,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating player:", error);
    return NextResponse.json(
      { message: "Error updating player" },
      { status: 500 }
    );
  }
}

// Delete a player
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const auth = authenticateRequest(request, "admin");
    if (!auth.authenticated) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 401 }
      );
    }

    await connectToDB();

    const player = await Player.findById(params.id);

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    await Player.findByIdAndDelete(params.id);

    return NextResponse.json(
      {
        message: "Player deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting player:", error);
    return NextResponse.json(
      { message: "Error deleting player" },
      { status: 500 }
    );
  }
}
