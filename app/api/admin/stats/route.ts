import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

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

    // Get all players
    const players = await Player.find();

    // Calculate total runs and wickets
    const totalRuns = players.reduce(
      (sum, player) => sum + player.totalRuns,
      0
    );
    const totalWickets = players.reduce(
      (sum, player) => sum + player.wickets,
      0
    );

    // Find highest run scorer
    const highestRunScorer = players.reduce((highest, player) => {
      return player.totalRuns > highest.totalRuns ? player : highest;
    }, players[0]);

    // Find highest wicket taker
    const highestWicketTaker = players.reduce((highest, player) => {
      return player.wickets > highest.wickets ? player : highest;
    }, players[0]);

    // Calculate averages
    const totalPlayers = players.length;
    const avgBattingStrikeRate =
      players.reduce((sum, player) => sum + player.battingStrikeRate, 0) /
      totalPlayers;
    const avgBattingAverage =
      players.reduce((sum, player) => sum + player.battingAverage, 0) /
      totalPlayers;

    // Count by category
    const categoryCounts = {
      Batsman: players.filter((p) => p.category === "Batsman").length,
      Bowler: players.filter((p) => p.category === "Bowler").length,
      "All-Rounder": players.filter((p) => p.category === "All-Rounder").length,
    };

    // Count by university
    const universityCounts = players.reduce((counts, player) => {
      counts[player.university] = (counts[player.university] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return NextResponse.json(
      {
        totalRuns,
        totalWickets,
        highestRunScorer: {
          id: highestRunScorer._id,
          name: highestRunScorer.name,
          university: highestRunScorer.university,
          totalRuns: highestRunScorer.totalRuns,
        },
        highestWicketTaker: {
          id: highestWicketTaker._id,
          name: highestWicketTaker.name,
          university: highestWicketTaker.university,
          wickets: highestWicketTaker.wickets,
        },
        averages: {
          battingStrikeRate: avgBattingStrikeRate,
          battingAverage: avgBattingAverage,
        },
        categoryCounts,
        universityCounts,
        totalPlayers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Error fetching stats" },
      { status: 500 }
    );
  }
}
