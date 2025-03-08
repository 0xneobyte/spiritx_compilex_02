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

  // Calculate Economy Rate
  if (updatedPlayer.oversBowled && updatedPlayer.oversBowled > 0) {
    updatedPlayer.economyRate =
      updatedPlayer.runsConceded / updatedPlayer.oversBowled;
  }

  return updatedPlayer;
};

interface Params {
  id: string;
}

// Get a specific player
export async function GET(req: NextRequest, { params }: { params: Params }) {
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
export async function PUT(req: NextRequest, { params }: { params: Params }) {
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
    const player = await Player.findById(params.id);

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Don't allow modification of original dataset players
    if (player.isFromOriginalDataset) {
      return NextResponse.json(
        { message: "Cannot modify players from the original dataset" },
        { status: 403 }
      );
    }

    // Calculate derived statistics
    playerData = calculateStats(playerData);

    // Update player
    Object.keys(playerData).forEach((key) => {
      if (key !== "_id" && key !== "isFromOriginalDataset") {
        player[key] = playerData[key];
      }
    });

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
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
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

    const player = await Player.findById(params.id);

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Don't allow deletion of original dataset players
    if (player.isFromOriginalDataset) {
      return NextResponse.json(
        { message: "Cannot delete players from the original dataset" },
        { status: 403 }
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
