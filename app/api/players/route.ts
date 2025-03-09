import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Parse query parameters
    const url = new URL(req.url);
    const category = url.searchParams.get("category");

    // Build query
    const query: Record<string, string | RegExp> = {};
    if (category && ["Batsman", "Bowler", "All-Rounder"].includes(category)) {
      query.category = category;
    }

    // Fetch players with optional category filter
    const players = await Player.find(query).sort({ name: 1 });

    // Remove points from player data for non-admin users
    const sanitizedPlayers = players.map((player) => {
      const playerObj = player.toObject();

      // Only admins can see points
      if (auth.user?.role !== "admin") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { points, ...rest } = playerObj;
        return rest;
      }

      return playerObj;
    });

    return NextResponse.json({ players: sanitizedPlayers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { message: "Error fetching players" },
      { status: 500 }
    );
  }
}
