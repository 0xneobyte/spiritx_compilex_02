import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import User from "@/app/lib/models/user";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { playerId, playerValue } = await req.json();

    if (!playerId) {
      return NextResponse.json(
        { message: "Player ID is required" },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find the user
    const user = await User.findById(auth.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if player is in the team
    const playerIndex = user.team.findIndex((id) => id.toString() === playerId);

    if (playerIndex === -1) {
      return NextResponse.json(
        { message: "Player is not in your team" },
        { status: 400 }
      );
    }

    // Find the player to get their value
    const player = await Player.findById(playerId);

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Use the provided player value if available (for dynamically calculated values)
    // Otherwise use the value from the database
    const valueToRefund = playerValue !== undefined ? playerValue : player.value;

    // Remove player from team and refund budget
    user.team.splice(playerIndex, 1);
    user.budget += valueToRefund;

    await user.save();

    return NextResponse.json(
      {
        message: "Player removed from team successfully",
        teamSize: user.team.length,
        budget: user.budget,
        player: {
          id: player._id,
          name: player.name,
          value: valueToRefund,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing player from team:", error);
    return NextResponse.json(
      { message: "Error removing player from team" },
      { status: 500 }
    );
  }
}
