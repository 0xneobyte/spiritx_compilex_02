import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import User from "@/app/lib/models/user";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";
import { sendUpdateToUser } from "@/app/lib/utils/updates";
import {
  calculatePlayerValueServer,
  PlayerData,
} from "@/app/lib/utils/playerValueServer";

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
    const user = await User.findById(auth.user.id).populate("team");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if team already has 11 players
    if (user.team.length >= 11) {
      return NextResponse.json(
        { message: "Team is already full (11 players maximum)" },
        { status: 400 }
      );
    }

    // Check if player is already in the team
    const isPlayerInTeam = user.team.some(
      (player) => player._id.toString() === playerId
    );

    if (isPlayerInTeam) {
      return NextResponse.json(
        { message: "Player is already in your team" },
        { status: 400 }
      );
    }

    // Find the player
    const player = await Player.findById(playerId);

    if (!player) {
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Use our shared utility to calculate player value consistently
    const valueToDeduct =
      playerValue !== undefined
        ? playerValue
        : calculatePlayerValueServer(
            player.toObject() as unknown as PlayerData
          );

    // Check if user has enough budget
    if (user.budget < valueToDeduct) {
      return NextResponse.json(
        { message: "Insufficient budget to add this player" },
        { status: 400 }
      );
    }

    // Add player to team and update budget
    if (player._id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user.team.push(player._id as any);
    }
    user.budget -= valueToDeduct;

    await user.save();

    // Before the return statement, add this to send real-time update
    sendUpdateToUser(auth.user.id, "team-update", {
      message: "Player added to team successfully",
      teamSize: user.team.length,
      budget: user.budget,
      player: {
        id: player._id,
        name: player.name,
        value: valueToDeduct,
      },
      action: "add",
    });

    return NextResponse.json(
      {
        message: "Player added to team successfully",
        teamSize: user.team.length,
        budget: user.budget,
        player: {
          id: player._id,
          name: player.name,
          value: valueToDeduct,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding player to team:", error);
    return NextResponse.json(
      { message: "Error adding player to team" },
      { status: 500 }
    );
  }
}
