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

    // Calculate averages - only include non-zero values and relevant players
    console.log("Total players:", players.length);

    // Log all players' batting stats to see their values
    console.log(
      "All players' stats:",
      players.slice(0, 5).map((p) => ({
        name: p.name,
        category: p.category,
        battingStrikeRate: p.battingStrikeRate,
        battingAverage: p.battingAverage,
        inningsPlayed: p.inningsPlayed,
        totalRuns: p.totalRuns,
        ballsFaced: p.ballsFaced,
      }))
    );

    // Try a different approach - directly calculate strike rates ourselves
    const playersWithBattingData = players.filter(
      (p) =>
        // Include players with either runs or who have faced balls
        (p.totalRuns > 0 || p.ballsFaced > 0) &&
        // Either not a pure bowler or has batting data
        (p.category !== "Bowler" || p.totalRuns > 0)
    );

    console.log(
      "Players with any batting data:",
      playersWithBattingData.length
    );

    // Calculate the averages manually to avoid using potentially zero fields
    let totalBattingStrikeRate = 0;
    let totalBattingAverage = 0;
    let countForStrikeRate = 0;
    let countForAverage = 0;

    for (const player of playersWithBattingData) {
      // Only include strike rate if player has faced balls
      if (player.ballsFaced > 0) {
        const strikeRate = (player.totalRuns / player.ballsFaced) * 100;
        totalBattingStrikeRate += strikeRate;
        countForStrikeRate++;
        console.log(`${player.name} strike rate: ${strikeRate}`);
      }

      // Only include batting average if player has played innings
      if (player.inningsPlayed > 0) {
        const average = player.totalRuns / player.inningsPlayed;
        totalBattingAverage += average;
        countForAverage++;
        console.log(`${player.name} average: ${average}`);
      }
    }

    const avgBattingStrikeRate =
      countForStrikeRate > 0 ? totalBattingStrikeRate / countForStrikeRate : 0;
    const avgBattingAverage =
      countForAverage > 0 ? totalBattingAverage / countForAverage : 0;

    console.log("Calculated averages:", {
      battingStrikeRate: avgBattingStrikeRate,
      battingAverage: avgBattingAverage,
      countForStrikeRate,
      countForAverage,
    });

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

    // For testing - set hard-coded values to see if frontend displays them correctly
    const testAvgBattingStrikeRate = 120.5;
    const testAvgBattingAverage = 35.2;

    console.log("Using test values:", {
      testStrikeRate: testAvgBattingStrikeRate,
      testBattingAvg: testAvgBattingAverage,
    });

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
        totalPlayers: players.length,
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
