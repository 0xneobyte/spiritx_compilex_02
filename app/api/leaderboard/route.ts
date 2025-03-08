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

    // Get all users with populated teams (including all player stats)
    const users = await User.find()
      .populate({
        path: "team",
        select:
          "_id name category points value totalRuns ballsFaced inningsPlayed wickets oversBowled runsConceded battingStrikeRate battingAverage bowlingStrikeRate economyRate",
      })
      .select("username team");

    // Function to calculate player points properly
    const calculatePlayerPoints = (player: any) => {
      if (player.points > 0) return player.points;

      // Calculate stats
      const battingStrikeRate =
        player.battingStrikeRate > 0
          ? player.battingStrikeRate
          : player.ballsFaced > 0
          ? (player.totalRuns / player.ballsFaced) * 100
          : 0;

      const battingAverage =
        player.battingAverage > 0
          ? player.battingAverage
          : player.inningsPlayed > 0
          ? player.totalRuns / player.inningsPlayed
          : 0;

      const bowlingStrikeRate =
        player.bowlingStrikeRate > 0
          ? player.bowlingStrikeRate
          : player.wickets > 0 && player.oversBowled > 0
          ? Math.floor(player.oversBowled * 6) / player.wickets
          : 0;

      const economyRate =
        player.economyRate > 0
          ? player.economyRate
          : player.oversBowled > 0 && player.runsConceded !== undefined
          ? player.runsConceded / player.oversBowled
          : 0;

      // Calculate points
      let points = 0;
      if (battingStrikeRate > 0) {
        points += battingStrikeRate / 5 + battingAverage * 0.8;
      }
      if (bowlingStrikeRate > 0 && bowlingStrikeRate < 999) {
        points += 500 / bowlingStrikeRate;
      }
      if (economyRate > 0) {
        points += 140 / economyRate;
      }

      return points;
    };

    // Calculate team points for each user
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        // Only calculate points if the team has 11 players
        let points = 0;
        if (user.team.length === 11) {
          // Calculate points for each player and sum them up
          points = user.team.reduce(
            (total, player) => total + calculatePlayerPoints(player),
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
