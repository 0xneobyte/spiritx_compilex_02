import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import User from "@/app/lib/models/user";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Get all users with populated teams
    const users = await User.find().populate("team").select("username team");

    // Calculate team points for each user
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        // Only calculate points if the team has 11 players
        let points = 0;
        if (user.team.length === 11) {
          // Sum the points of all players in the team
          points = user.team.reduce(
            (total, player) => total + player.points,
            0
          );
        }

        return {
          id: user._id,
          username: user.username,
          teamSize: user.team.length,
          points: points,
          isComplete: user.team.length === 11,
          isCurrentUser: user._id.toString() === auth.user.id,
        };
      })
    );

    // Sort by points in descending order
    leaderboard.sort((a, b) => b.points - a.points);

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { message: "Error fetching leaderboard" },
      { status: 500 }
    );
  }
}
