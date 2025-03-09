import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import User from "@/app/lib/models/user";
import { authenticateRequest } from "@/app/lib/utils/auth";

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    // Find the user and populate their team with all fields
    const user = await User.findById(auth.user.id).populate({
      path: "team",
      select:
        "_id name university category value totalRuns ballsFaced inningsPlayed wickets oversBowled runsConceded battingStrikeRate battingAverage bowlingStrikeRate economyRate points",
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Calculate team points if team is complete (has 11 players)
    let teamPoints = 0;
    if (user.team.length === 11) {
      // We need to populate the team with player details to get points
      const populatedUser = await User.findById(user._id).populate("team");

      if (populatedUser && populatedUser.team) {
        // Calculate total team points by summing individual player points
        teamPoints = 0;
        for (const player of populatedUser.team) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const playerAny = player as any;
          teamPoints += playerAny.points || 0;
        }
      }
    }

    return NextResponse.json(
      {
        team: user.team,
        budget: user.budget,
        teamComplete: user.team.length === 11,
        teamSize: user.team.length,
        teamPoints: user.team.length === 11 ? teamPoints : null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user team:", error);
    return NextResponse.json(
      { message: "Error fetching user team" },
      { status: 500 }
    );
  }
}
