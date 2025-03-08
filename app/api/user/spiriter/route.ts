import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/app/lib/utils/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Sample data from CSV - including ALL players
const samplePlayers = [
  {
    name: "Chamika Chandimal",
    university: "University of the Visual & Performing Arts",
    category: "Batsman",
    totalRuns: 530,
    ballsFaced: 588,
    inningsPlayed: 10,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 21,
  },
  {
    name: "Dimuth Dhananjaya",
    university: "University of the Visual & Performing Arts",
    category: "All-Rounder",
    totalRuns: 250,
    ballsFaced: 208,
    inningsPlayed: 10,
    wickets: 8,
    oversBowled: 40,
    runsConceded: 240,
  },
  {
    name: "Avishka Mendis",
    university: "Eastern University",
    category: "All-Rounder",
    totalRuns: 210,
    ballsFaced: 175,
    inningsPlayed: 7,
    wickets: 7,
    oversBowled: 35,
    runsConceded: 210,
  },
  {
    name: "Danushka Kumara",
    university: "University of the Visual & Performing Arts",
    category: "Batsman",
    totalRuns: 780,
    ballsFaced: 866,
    inningsPlayed: 15,
    wickets: 0,
    oversBowled: 5,
    runsConceded: 35,
  },
  {
    name: "Praveen Vandersay",
    university: "Eastern University",
    category: "Batsman",
    totalRuns: 329,
    ballsFaced: 365,
    inningsPlayed: 7,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 24,
  },
  {
    name: "Niroshan Mathews",
    university: "University of the Visual & Performing Arts",
    category: "Batsman",
    totalRuns: 275,
    ballsFaced: 305,
    inningsPlayed: 5,
    wickets: 0,
    oversBowled: 2,
    runsConceded: 18,
  },
  {
    name: "Chaturanga Gunathilaka",
    university: "University of Moratuwa",
    category: "Bowler",
    totalRuns: 132,
    ballsFaced: 264,
    inningsPlayed: 11,
    wickets: 29,
    oversBowled: 88,
    runsConceded: 528,
  },
  {
    name: "Lahiru Rathnayake",
    university: "University of Ruhuna",
    category: "Batsman",
    totalRuns: 742,
    ballsFaced: 824,
    inningsPlayed: 14,
    wickets: 0,
    oversBowled: 1,
    runsConceded: 8,
  },
  {
    name: "Jeewan Thirimanne",
    university: "University of Jaffna",
    category: "Batsman",
    totalRuns: 780,
    ballsFaced: 866,
    inningsPlayed: 15,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 24,
  },
  {
    name: "Kalana Samarawickrama",
    university: "Eastern University",
    category: "Batsman",
    totalRuns: 728,
    ballsFaced: 808,
    inningsPlayed: 14,
    wickets: 0,
    oversBowled: 4,
    runsConceded: 32,
  },
  {
    name: "Lakshan Vandersay",
    university: "University of the Visual & Performing Arts",
    category: "All-Rounder",
    totalRuns: 405,
    ballsFaced: 337,
    inningsPlayed: 15,
    wickets: 15,
    oversBowled: 75,
    runsConceded: 450,
  },
  {
    name: "Roshen Samarawickrama",
    university: "University of Kelaniya",
    category: "Bowler",
    totalRuns: 140,
    ballsFaced: 280,
    inningsPlayed: 14,
    wickets: 46,
    oversBowled: 140,
    runsConceded: 560,
  },
  {
    name: "Sammu Sandakan",
    university: "University of Ruhuna",
    category: "Bowler",
    totalRuns: 120,
    ballsFaced: 240,
    inningsPlayed: 10,
    wickets: 26,
    oversBowled: 80,
    runsConceded: 320,
  },
  {
    name: "Kalana Jayawardene",
    university: "University of Jaffna",
    category: "Bowler",
    totalRuns: 120,
    ballsFaced: 240,
    inningsPlayed: 10,
    wickets: 33,
    oversBowled: 100,
    runsConceded: 400,
  },
  {
    name: "Binura Samarawickrama",
    university: "University of the Visual & Performing Arts",
    category: "Bowler",
    totalRuns: 77,
    ballsFaced: 154,
    inningsPlayed: 7,
    wickets: 21,
    oversBowled: 63,
    runsConceded: 252,
  },
  {
    name: "Dasun Thirimanne",
    university: "Eastern University",
    category: "Bowler",
    totalRuns: 121,
    ballsFaced: 242,
    inningsPlayed: 11,
    wickets: 29,
    oversBowled: 88,
    runsConceded: 440,
  },
  {
    name: "Angelo Samarawickrama",
    university: "University of Kelaniya",
    category: "Batsman",
    totalRuns: 424,
    ballsFaced: 471,
    inningsPlayed: 8,
    wickets: 0,
    oversBowled: 1,
    runsConceded: 7,
  },
  {
    name: "Nuwan Jayawickrama",
    university: "University of Ruhuna",
    category: "Batsman",
    totalRuns: 300,
    ballsFaced: 333,
    inningsPlayed: 6,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 27,
  },
  {
    name: "Kusal Dhananjaya",
    university: "South Eastern University",
    category: "Batsman",
    totalRuns: 480,
    ballsFaced: 533,
    inningsPlayed: 10,
    wickets: 0,
    oversBowled: 2,
    runsConceded: 16,
  },
  {
    name: "Chamika Bandara",
    university: "Eastern University",
    category: "Batsman",
    totalRuns: 270,
    ballsFaced: 300,
    inningsPlayed: 5,
    wickets: 0,
    oversBowled: 5,
    runsConceded: 45,
  },
  {
    name: "Dilruwan Shanaka",
    university: "University of Peradeniya",
    category: "Batsman",
    totalRuns: 384,
    ballsFaced: 426,
    inningsPlayed: 8,
    wickets: 0,
    oversBowled: 5,
    runsConceded: 45,
  },
  {
    name: "Danushka Jayawickrama",
    university: "University of Peradeniya",
    category: "All-Rounder",
    totalRuns: 350,
    ballsFaced: 291,
    inningsPlayed: 14,
    wickets: 14,
    oversBowled: 70,
    runsConceded: 350,
  },
  {
    name: "Charith Shanaka",
    university: "University of Colombo",
    category: "Batsman",
    totalRuns: 477,
    ballsFaced: 530,
    inningsPlayed: 9,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 27,
  },
  {
    name: "Asela Nissanka",
    university: "University of Sri Jayewardenepura",
    category: "Batsman",
    totalRuns: 765,
    ballsFaced: 850,
    inningsPlayed: 15,
    wickets: 0,
    oversBowled: 0,
    runsConceded: 1,
  },
  {
    name: "Wanindu Hasaranga",
    university: "University of Colombo",
    category: "Bowler",
    totalRuns: 120,
    ballsFaced: 240,
    inningsPlayed: 10,
    wickets: 30,
    oversBowled: 90,
    runsConceded: 540,
  },
  {
    name: "Asela Vandersay",
    university: "University of the Visual & Performing Arts",
    category: "Bowler",
    totalRuns: 154,
    ballsFaced: 308,
    inningsPlayed: 14,
    wickets: 37,
    oversBowled: 112,
    runsConceded: 448,
  },
  {
    name: "Pathum Fernando",
    university: "University of Peradeniya",
    category: "Batsman",
    totalRuns: 450,
    ballsFaced: 500,
    inningsPlayed: 10,
    wickets: 0,
    oversBowled: 2,
    runsConceded: 18,
  },
  {
    name: "Angelo Kumara",
    university: "Eastern University",
    category: "Batsman",
    totalRuns: 330,
    ballsFaced: 366,
    inningsPlayed: 6,
    wickets: 0,
    oversBowled: 1,
    runsConceded: 8,
  },
  {
    name: "Danushka Rajapaksa",
    university: "University of Peradeniya",
    category: "Batsman",
    totalRuns: 441,
    ballsFaced: 490,
    inningsPlayed: 9,
    wickets: 0,
    oversBowled: 5,
    runsConceded: 35,
  },
  {
    name: "Suranga Shanaka",
    university: "South Eastern University",
    category: "Bowler",
    totalRuns: 55,
    ballsFaced: 110,
    inningsPlayed: 5,
    wickets: 13,
    oversBowled: 40,
    runsConceded: 160,
  },
  {
    name: "Pathum Dhananjaya",
    university: "Eastern University",
    category: "Batsman",
    totalRuns: 360,
    ballsFaced: 400,
    inningsPlayed: 8,
    wickets: 0,
    oversBowled: 1,
    runsConceded: 9,
  },
  {
    name: "Asela Asalanka",
    university: "South Eastern University",
    category: "Batsman",
    totalRuns: 550,
    ballsFaced: 611,
    inningsPlayed: 11,
    wickets: 0,
    oversBowled: 0,
    runsConceded: 1,
  },
  {
    name: "Minod Rathnayake",
    university: "University of Kelaniya",
    category: "Bowler",
    totalRuns: 154,
    ballsFaced: 308,
    inningsPlayed: 14,
    wickets: 37,
    oversBowled: 112,
    runsConceded: 448,
  },
  {
    name: "Binura Lakmal",
    university: "University of Kelaniya",
    category: "Batsman",
    totalRuns: 540,
    ballsFaced: 600,
    inningsPlayed: 12,
    wickets: 0,
    oversBowled: 2,
    runsConceded: 16,
  },
  {
    name: "Praveen Asalanka",
    university: "Eastern University",
    category: "Batsman",
    totalRuns: 477,
    ballsFaced: 530,
    inningsPlayed: 9,
    wickets: 0,
    oversBowled: 1,
    runsConceded: 7,
  },
  {
    name: "Angelo Jayawardene",
    university: "University of Jaffna",
    category: "Batsman",
    totalRuns: 468,
    ballsFaced: 520,
    inningsPlayed: 9,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 21,
  },
  {
    name: "Kamindu Asalanka",
    university: "University of Moratuwa",
    category: "Bowler",
    totalRuns: 135,
    ballsFaced: 270,
    inningsPlayed: 15,
    wickets: 45,
    oversBowled: 135,
    runsConceded: 810,
  },
  {
    name: "Sadeera Rajapaksa",
    university: "University of Jaffna",
    category: "All-Rounder",
    totalRuns: 275,
    ballsFaced: 229,
    inningsPlayed: 11,
    wickets: 8,
    oversBowled: 44,
    runsConceded: 264,
  },
  {
    name: "Sandakan Hasaranga",
    university: "University of Kelaniya",
    category: "Batsman",
    totalRuns: 795,
    ballsFaced: 883,
    inningsPlayed: 15,
    wickets: 0,
    oversBowled: 1,
    runsConceded: 7,
  },
  {
    name: "Bhanuka Rajapaksa",
    university: "University of Moratuwa",
    category: "All-Rounder",
    totalRuns: 364,
    ballsFaced: 303,
    inningsPlayed: 14,
    wickets: 11,
    oversBowled: 56,
    runsConceded: 336,
  },
  {
    name: "Chamika Rajapaksa",
    university: "University of Ruhuna",
    category: "Batsman",
    totalRuns: 450,
    ballsFaced: 500,
    inningsPlayed: 9,
    wickets: 0,
    oversBowled: 1,
    runsConceded: 7,
  },
  {
    name: "Kamindu Lakmal",
    university: "University of the Visual & Performing Arts",
    category: "Batsman",
    totalRuns: 780,
    ballsFaced: 866,
    inningsPlayed: 15,
    wickets: 0,
    oversBowled: 5,
    runsConceded: 35,
  },
  {
    name: "Lakshan Gunathilaka",
    university: "University of Peradeniya",
    category: "Bowler",
    totalRuns: 84,
    ballsFaced: 168,
    inningsPlayed: 7,
    wickets: 21,
    oversBowled: 63,
    runsConceded: 315,
  },
  {
    name: "Tharindu Thirimanne",
    university: "South Eastern University",
    category: "Batsman",
    totalRuns: 611,
    ballsFaced: 678,
    inningsPlayed: 13,
    wickets: 0,
    oversBowled: 2,
    runsConceded: 18,
  },
  {
    name: "Dinesh Samarawickrama",
    university: "University of Jaffna",
    category: "Batsman",
    totalRuns: 400,
    ballsFaced: 444,
    inningsPlayed: 8,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 27,
  },
  {
    name: "Suranga Sandakan",
    university: "University of Moratuwa",
    category: "Batsman",
    totalRuns: 235,
    ballsFaced: 261,
    inningsPlayed: 5,
    wickets: 0,
    oversBowled: 4,
    runsConceded: 36,
  },
  {
    name: "Sandakan Dickwella",
    university: "University of Jaffna",
    category: "Batsman",
    totalRuns: 368,
    ballsFaced: 408,
    inningsPlayed: 8,
    wickets: 0,
    oversBowled: 3,
    runsConceded: 27,
  },
  {
    name: "Sammu Rajapaksa",
    university: "University of Ruhuna",
    category: "Batsman",
    totalRuns: 240,
    ballsFaced: 266,
    inningsPlayed: 5,
    wickets: 0,
    oversBowled: 2,
    runsConceded: 16,
  },
  {
    name: "Suranga Bandara",
    university: "University of Moratuwa",
    category: "Bowler",
    totalRuns: 154,
    ballsFaced: 308,
    inningsPlayed: 14,
    wickets: 46,
    oversBowled: 140,
    runsConceded: 840,
  },
  {
    name: "Tharindu Embuldeniya",
    university: "University of the Visual & Performing Arts",
    category: "All-Rounder",
    totalRuns: 264,
    ballsFaced: 220,
    inningsPlayed: 12,
    wickets: 12,
    oversBowled: 60,
    runsConceded: 360,
  },
];

// Calculate derived statistics for players
const playersWithStats = samplePlayers.map((player) => {
  // Calculate batting average
  const battingAvg =
    player.inningsPlayed > 0
      ? (player.totalRuns / player.inningsPlayed).toFixed(2)
      : "0.00";

  // Calculate strike rate
  const strikeRate =
    player.ballsFaced > 0
      ? ((player.totalRuns / player.ballsFaced) * 100).toFixed(2)
      : "0.00";

  // Calculate bowling economy
  const totalBalls = player.oversBowled * 6;
  const economy =
    totalBalls > 0
      ? ((player.runsConceded / totalBalls) * 6).toFixed(2)
      : "0.00";

  // Calculate bowling strike rate
  const bowlingStrikeRate =
    player.wickets > 0 ? (totalBalls / player.wickets).toFixed(2) : "N/A";

  // Calculate player value based on performance (without revealing actual points)
  // This is used internally only for team selection
  let performanceScore = 0;

  // Batting performance
  if (player.ballsFaced > 0) {
    performanceScore += parseFloat(strikeRate) / 5;
    performanceScore += parseFloat(battingAvg) * 0.8;
  }

  // Bowling performance
  if (player.wickets > 0 && totalBalls > 0) {
    performanceScore +=
      500 / parseFloat(bowlingStrikeRate !== "N/A" ? bowlingStrikeRate : "999");
  }

  if (totalBalls > 0) {
    performanceScore += 140 / parseFloat(economy);
  }

  // Value calculation (similar to what's in the database model but simplified)
  const calculatedValue =
    performanceScore > 0
      ? Math.round(((9 * performanceScore + 100) * 1000) / 50000) * 50000
      : 100000;

  return {
    ...player,
    battingAverage: battingAvg,
    strikeRate: strikeRate,
    economy: economy,
    bowlingStrikeRate: bowlingStrikeRate,
    performanceScore: performanceScore, // Only used internally
    value: calculatedValue,
  };
});

// Function to find the optimal team of 11 players
const findOptimalTeam = () => {
  try {
    // Sort players by performance score
    const sortedPlayers = [...playersWithStats].sort(
      (a, b) => b.performanceScore - a.performanceScore
    );

    // We need a balanced team with:
    // - At least 3 batsmen
    // - At least 3 bowlers
    // - At least 1 all-rounder
    // - The remaining 4 slots filled with highest-score players

    // Filter players by category
    const batsmen = sortedPlayers.filter(
      (player) => player.category === "Batsman"
    );
    const bowlers = sortedPlayers.filter(
      (player) => player.category === "Bowler"
    );
    const allRounders = sortedPlayers.filter(
      (player) => player.category === "All-Rounder"
    );

    // Check if we have enough players
    if (batsmen.length < 3 || bowlers.length < 3 || allRounders.length < 1) {
      return {
        success: false,
        message:
          "Not enough players in required categories to form a balanced team.",
      };
    }

    // Select top players from each category
    const selectedBatsmen = batsmen.slice(0, 3);
    const selectedBowlers = bowlers.slice(0, 3);
    const selectedAllRounders = allRounders.slice(0, 1);

    // Combine selected players
    let selectedPlayers = [
      ...selectedBatsmen,
      ...selectedBowlers,
      ...selectedAllRounders,
    ];

    // For the remaining 4 slots, select highest-score players not already selected
    const remainingPlayers = sortedPlayers.filter(
      (player) =>
        !selectedPlayers.some((selected) => selected.name === player.name)
    );

    // Add top 4 remaining players
    const additionalPlayers = remainingPlayers.slice(0, 4);
    selectedPlayers = [...selectedPlayers, ...additionalPlayers];

    // Format player data (excluding performance score)
    const formattedPlayers = selectedPlayers.map((player) => ({
      name: player.name,
      university: player.university,
      category: player.category,
      value: player.value,
    }));

    // Calculate total team value
    const totalTeamValue = selectedPlayers.reduce(
      (sum, player) => sum + player.value,
      0
    );

    return {
      success: true,
      team: formattedPlayers,
      totalValue: totalTeamValue,
    };
  } catch (error) {
    console.error("Error finding optimal team:", error);
    return {
      success: false,
      message: "An error occurred while finding the optimal team.",
    };
  }
};

// Manual response generator as a fallback if Gemini API fails
const getManualResponse = (question: string) => {
  const lowerCaseQuestion = question.toLowerCase();

  // Handle "list all batmans/batsmen" query
  if (
    lowerCaseQuestion.includes("list all batman") ||
    lowerCaseQuestion.includes("list all batsman") ||
    lowerCaseQuestion.includes("list all batsmen") ||
    lowerCaseQuestion.includes("all batman") ||
    lowerCaseQuestion.includes("all batsman") ||
    lowerCaseQuestion.includes("all batsmen") ||
    (lowerCaseQuestion.includes("batsman") &&
      (lowerCaseQuestion.includes("all") || lowerCaseQuestion.includes("list")))
  ) {
    const batsmen = playersWithStats.filter(
      (player) => player.category === "Batsman"
    );

    if (batsmen.length === 0) {
      return "I don't have information about any batsmen.";
    }

    // Sort batsmen by total runs for a more useful response
    const sortedBatsmen = [...batsmen].sort(
      (a, b) => b.totalRuns - a.totalRuns
    );

    let response = "Here are all the batsmen in the tournament:\n\n";
    sortedBatsmen.forEach((player, index) => {
      response += `${index + 1}. ${player.name} - ${player.university} - ${
        player.totalRuns
      } runs\n`;
    });

    return response;
  }

  // Handle "statistics of ruhuna university" query
  if (
    lowerCaseQuestion.includes("statistics of ruhuna") ||
    lowerCaseQuestion.includes("stats of ruhuna") ||
    lowerCaseQuestion.includes("university of ruhuna") ||
    lowerCaseQuestion.includes("ruhuna university")
  ) {
    const ruhunaPlayers = playersWithStats.filter((player) =>
      player.university.toLowerCase().includes("ruhuna")
    );

    if (ruhunaPlayers.length === 0) {
      return "I don't have information about players from University of Ruhuna.";
    }

    // Calculate totals
    const totalRuns = ruhunaPlayers.reduce(
      (sum, player) => sum + player.totalRuns,
      0
    );
    const totalWickets = ruhunaPlayers.reduce(
      (sum, player) => sum + player.wickets,
      0
    );

    // Find top performers
    const sortedByRuns = [...ruhunaPlayers].sort(
      (a, b) => b.totalRuns - a.totalRuns
    );
    const sortedByWickets = [...ruhunaPlayers].sort(
      (a, b) => b.wickets - a.wickets
    );

    let response = "Statistics for University of Ruhuna:\n\n";
    response += `Total Players: ${ruhunaPlayers.length}\n`;
    response += `Total Runs: ${totalRuns}\n`;
    response += `Total Wickets: ${totalWickets}\n\n`;

    response += "Players from University of Ruhuna:\n";
    ruhunaPlayers.forEach((player, index) => {
      response += `${index + 1}. ${player.name} - ${player.category} - ${
        player.totalRuns
      } runs, ${player.wickets} wickets\n`;
    });

    if (sortedByRuns.length > 0) {
      response += `\nTop Run Scorer: ${sortedByRuns[0].name} with ${sortedByRuns[0].totalRuns} runs\n`;
    }

    if (sortedByWickets.length > 0 && sortedByWickets[0].wickets > 0) {
      response += `Top Wicket Taker: ${sortedByWickets[0].name} with ${sortedByWickets[0].wickets} wickets\n`;
    }

    return response;
  }

  // Handle "who has faced the most balls in the tournament?" query
  if (
    lowerCaseQuestion.includes("faced the most balls") ||
    lowerCaseQuestion.includes("most balls faced") ||
    lowerCaseQuestion.includes("highest balls faced") ||
    (lowerCaseQuestion.includes("balls") &&
      lowerCaseQuestion.includes("faced") &&
      (lowerCaseQuestion.includes("most") ||
        lowerCaseQuestion.includes("highest")))
  ) {
    const sortedByBallsFaced = [...playersWithStats].sort(
      (a, b) => b.ballsFaced - a.ballsFaced
    );
    const topPlayer = sortedByBallsFaced[0];

    return `The player who has faced the most balls in the tournament is ${topPlayer.name} with ${topPlayer.ballsFaced} balls faced. He has scored ${topPlayer.totalRuns} runs with a strike rate of ${topPlayer.strikeRate}.`;
  }

  // Handle "Do all-rounders generally have better batting averages than pure batsmen?" query
  if (
    (lowerCaseQuestion.includes("all-rounder") ||
      lowerCaseQuestion.includes("all rounder")) &&
    lowerCaseQuestion.includes("batsmen") &&
    (lowerCaseQuestion.includes("better") ||
      lowerCaseQuestion.includes("higher") ||
      lowerCaseQuestion.includes("compare"))
  ) {
    const allRounders = playersWithStats.filter(
      (player) => player.category === "All-Rounder"
    );
    const batsmen = playersWithStats.filter(
      (player) => player.category === "Batsman"
    );

    // Calculate average batting average for each group
    const allRounderAvg =
      allRounders.reduce(
        (sum, player) => sum + parseFloat(player.battingAverage),
        0
      ) / allRounders.length;
    const batsmenAvg =
      batsmen.reduce(
        (sum, player) => sum + parseFloat(player.battingAverage),
        0
      ) / batsmen.length;

    let response =
      "Comparing batting averages between all-rounders and pure batsmen:\n\n";
    response += `Average batting average for all-rounders: ${allRounderAvg.toFixed(
      2
    )}\n`;
    response += `Average batting average for pure batsmen: ${batsmenAvg.toFixed(
      2
    )}\n\n`;

    if (allRounderAvg > batsmenAvg) {
      response +=
        "Yes, all-rounders generally have better batting averages than pure batsmen in this tournament.";
    } else {
      response +=
        "No, pure batsmen generally have better batting averages than all-rounders in this tournament.";
    }

    // List all-rounders
    response += "\n\nHere are all the all-rounders in the tournament:\n";
    allRounders.forEach((player, index) => {
      response += `${index + 1}. ${player.name} - ${player.university} - ${
        player.totalRuns
      } runs, ${player.wickets} wickets, Batting Avg: ${
        player.battingAverage
      }\n`;
    });

    return response;
  }

  // Handle player with most runs queries
  if (
    lowerCaseQuestion.includes("most runs") ||
    lowerCaseQuestion.includes("highest runs") ||
    lowerCaseQuestion.includes("got most runs") ||
    lowerCaseQuestion.includes("most total runs")
  ) {
    const sortedByRuns = [...playersWithStats].sort(
      (a, b) => b.totalRuns - a.totalRuns
    );
    const topPlayer = sortedByRuns[0];

    return `The player with the most runs is ${
      topPlayer.name
    } with ${topPlayer.totalRuns.toLocaleString()} runs in ${
      topPlayer.inningsPlayed
    } innings. He has a batting average of ${
      topPlayer.battingAverage
    } and a strike rate of ${topPlayer.strikeRate}.`;
  }

  // Handle university queries
  if (lowerCaseQuestion.includes("university of colombo")) {
    const colomboPlayers = playersWithStats.filter(
      (player) => player.university.toLowerCase() === "university of colombo"
    );

    if (colomboPlayers.length === 0) {
      return "I don't have information about players from University of Colombo.";
    }

    let response = "Here are the players from University of Colombo:\n\n";
    colomboPlayers.forEach((player, index) => {
      response += `${index + 1}. ${player.name} - ${player.category}\n`;
    });

    return response;
  }

  // Handle highest batting average query
  if (
    lowerCaseQuestion.includes("highest batting average") ||
    lowerCaseQuestion.includes("best batting average")
  ) {
    const sortedByAverage = [...playersWithStats].sort(
      (a, b) => parseFloat(b.battingAverage) - parseFloat(a.battingAverage)
    );

    const topPlayer = sortedByAverage[0];
    return `The player with the highest batting average is ${topPlayer.name} with an average of ${topPlayer.battingAverage}. He has scored ${topPlayer.totalRuns} runs in ${topPlayer.inningsPlayed} innings.`;
  }

  // Handle most wickets query
  if (
    lowerCaseQuestion.includes("most wickets") ||
    lowerCaseQuestion.includes("highest wickets") ||
    (lowerCaseQuestion.includes("bowler") &&
      lowerCaseQuestion.includes("wickets"))
  ) {
    const sortedByWickets = [...playersWithStats].sort(
      (a, b) => b.wickets - a.wickets
    );
    const topBowler = sortedByWickets[0];

    return `The bowler who has taken the most wickets is ${topBowler.name} with ${topBowler.wickets} wickets in ${topBowler.oversBowled} overs at an economy rate of ${topBowler.economy}.`;
  }

  // Handle Eastern University query
  if (lowerCaseQuestion.includes("eastern university")) {
    const easternPlayers = playersWithStats.filter(
      (player) => player.university.toLowerCase() === "eastern university"
    );

    if (easternPlayers.length === 0) {
      return "I don't have information about players from Eastern University.";
    }

    let response = "Here are the players from Eastern University:\n\n";
    easternPlayers.forEach((player, index) => {
      response += `${index + 1}. ${player.name} - ${player.category}\n`;
    });

    return response;
  }

  // Handle specific player query - more flexible matching
  for (const player of playersWithStats) {
    const playerName = player.name.toLowerCase();
    // More flexible check for player names
    if (
      lowerCaseQuestion.includes(playerName) ||
      playerName
        .split(" ")
        .some(
          (namePart) =>
            namePart.length > 3 && lowerCaseQuestion.includes(namePart)
        )
    ) {
      let response = `Here are the statistics for ${player.name}, a ${player.category} from ${player.university}:\n\n`;
      response += `Value: Rs ${player.value.toLocaleString()}\n\n`;
      response += "Batting Statistics:\n";
      response += `- Total Runs: ${player.totalRuns}\n`;
      response += `- Balls Faced: ${player.ballsFaced}\n`;
      response += `- Innings Played: ${player.inningsPlayed}\n`;
      response += `- Batting Strike Rate: ${player.strikeRate}\n`;
      response += `- Batting Average: ${player.battingAverage}\n\n`;
      response += "Bowling Statistics:\n";
      response += `- Wickets: ${player.wickets}\n`;
      response += `- Overs Bowled: ${player.oversBowled}\n`;
      response += `- Runs Conceded: ${player.runsConceded}\n`;

      if (player.wickets > 0 || player.oversBowled > 0) {
        response += `- Economy Rate: ${player.economy}\n`;
        response += `- Bowling Strike Rate: ${
          player.bowlingStrikeRate === "N/A" ? "N/A" : player.bowlingStrikeRate
        }\n`;
      }

      return response;
    }
  }

  // Check for general category queries
  if (
    lowerCaseQuestion.includes("list all bowlers") ||
    lowerCaseQuestion.includes("all bowlers") ||
    lowerCaseQuestion.includes("show bowlers") ||
    (lowerCaseQuestion.includes("bowlers") &&
      (lowerCaseQuestion.includes("all") || lowerCaseQuestion.includes("list")))
  ) {
    const bowlers = playersWithStats.filter(
      (player) => player.category === "Bowler"
    );

    // Sort bowlers by wickets for more useful information
    const sortedBowlers = [...bowlers].sort((a, b) => b.wickets - a.wickets);

    let response = "Here are all the bowlers in the tournament:\n\n";
    sortedBowlers.forEach((player, index) => {
      response += `${index + 1}. ${player.name} - ${player.university} - ${
        player.wickets
      } wickets\n`;
    });

    return response;
  }

  if (
    lowerCaseQuestion.includes("list all rounders") ||
    lowerCaseQuestion.includes("all rounders") ||
    lowerCaseQuestion.includes("all-rounders") ||
    lowerCaseQuestion.includes("show all rounders") ||
    (lowerCaseQuestion.includes("all rounder") &&
      (lowerCaseQuestion.includes("all") || lowerCaseQuestion.includes("list")))
  ) {
    const allRounders = playersWithStats.filter(
      (player) => player.category === "All-Rounder"
    );

    let response = "Here are all the all-rounders in the tournament:\n\n";
    allRounders.forEach((player, index) => {
      response += `${index + 1}. ${player.name} - ${player.university} - ${
        player.totalRuns
      } runs, ${player.wickets} wickets\n`;
    });

    return response;
  }

  // Default fallback response
  return "I don't have enough knowledge to answer that question.";
};

// Process query with Gemini API with better error handling
const processWithGemini = async (prompt: string, context: string) => {
  try {
    // Log the API key presence (not the actual key)
    console.log("Gemini API Key present:", Boolean(process.env.GEMINI_API_KEY));

    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini API key is missing");
      // Return manual response as fallback
      return getManualResponse(prompt.split("User question: ")[1] || prompt);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the correct model name as specified in the curl example
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Safety settings to avoid rejections
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Try to generate content with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Gemini API request timed out")),
        10000
      );
    });

    const generatePromise = model.generateContent({
      contents: [
        { role: "user", parts: [{ text: prompt + "\n\nContext: " + context }] },
      ],
      generationConfig,
    });

    // Use Promise.race to implement timeout
    const result = (await Promise.race([generatePromise, timeoutPromise])) as {
      response?: { text: () => string };
    };

    if (!result?.response) {
      console.error("No response from Gemini API");
      return getManualResponse(prompt.split("User question: ")[1] || prompt);
    }

    return result.response.text();
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Use manual response as fallback
    return getManualResponse(prompt.split("User question: ")[1] || prompt);
  }
};

// Create comprehensive player context for Gemini
const buildPlayerContext = () => {
  // Create CSV-like representation of player data
  let csvData =
    "Name,University,Category,TotalRuns,BallsFaced,InningsPlayed,Wickets,OversBowled,RunsConceded,BattingStrikeRate,BattingAverage,Economy,BowlingStrikeRate,Value\n";

  playersWithStats.forEach((player) => {
    csvData += `${player.name},${player.university},${player.category},${player.totalRuns},${player.ballsFaced},${player.inningsPlayed},${player.wickets},${player.oversBowled},${player.runsConceded},${player.strikeRate},${player.battingAverage},${player.economy},${player.bowlingStrikeRate},${player.value}\n`;
  });

  // Add context with detailed instructions on understanding the data
  let context = "Cricket Tournament Player Dataset:\n\n";
  context += csvData;
  context += "\n\nPlayer Statistics Explanation:\n";
  context += "- TotalRuns: Total runs scored by the player\n";
  context += "- BallsFaced: Total number of balls faced by the player\n";
  context += "- InningsPlayed: Number of innings played\n";
  context += "- Wickets: Number of wickets taken\n";
  context += "- OversBowled: Number of overs bowled\n";
  context += "- RunsConceded: Runs conceded while bowling\n";
  context += "- BattingStrikeRate: (TotalRuns/BallsFaced)*100\n";
  context += "- BattingAverage: TotalRuns/InningsPlayed\n";
  context += "- Economy: RunsConceded/(OversBowled*6)*6\n";
  context += "- BowlingStrikeRate: (OversBowled*6)/Wickets (if Wickets > 0)\n";
  context += "- Value: Player's monetary value in Sri Lankan Rupees\n";

  context +=
    "\nIMPORTANT: Never mention or discuss player points, performance scores, or any internal metrics. The 'points' field is NOT included in the dataset and should never be referenced or calculated.";

  return context;
};

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get message from request
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { message: "Please provide a message" },
        { status: 400 }
      );
    }

    console.log("Processing query:", message); // Debug log

    const lowerCaseMessage = message.toLowerCase();

    // Special handling for team recommendation request
    if (
      lowerCaseMessage.includes("best team") ||
      lowerCaseMessage.includes("optimal team") ||
      lowerCaseMessage.includes("recommend team") ||
      lowerCaseMessage.includes("suggest team") ||
      lowerCaseMessage.includes("highest points team") ||
      (lowerCaseMessage.includes("team") && lowerCaseMessage.includes("best"))
    ) {
      console.log("Handling team recommendation request");
      const optimalTeam = findOptimalTeam();

      if (!optimalTeam.success) {
        return NextResponse.json(
          { message: optimalTeam.message },
          { status: 200 }
        );
      }

      // Format team recommendation response
      let response = "Here's my recommendation for the best possible team:\n\n";

      optimalTeam.team?.forEach((player, index) => {
        response += `${index + 1}. ${player.name} (${player.category}) - ${
          player.university
        } - Value: Rs ${player.value.toLocaleString()}\n`;
      });

      response += `\nTotal Team Value: Rs ${
        optimalTeam.totalValue?.toLocaleString() || 0
      }`;

      return NextResponse.json({ message: response }, { status: 200 });
    }

    // Check for explicit point queries to block them
    if (
      lowerCaseMessage.includes("points") ||
      lowerCaseMessage.includes("score") ||
      lowerCaseMessage.includes("rating") ||
      lowerCaseMessage.includes("rank")
    ) {
      console.log("Blocking points query");
      return NextResponse.json(
        { message: "I'm sorry, I cannot reveal player points information." },
        { status: 200 }
      );
    }

    // For all other queries, use Gemini with player context
    console.log("Using Gemini API for response");
    const playerContext = buildPlayerContext();

    // Prepare instructions for Gemini - more comprehensive for any type of question
    const instructions = `
    You are Spiriter, a helpful cricket assistant for the Spirit11 cricket fantasy league.
    Answer the user's question based on the player data provided.
    
    IMPORTANT RULES:
    1. NEVER mention or reveal any player's points, performance scores, or internal ratings
    2. If asked about points directly or indirectly, say "I'm sorry, I cannot reveal player points information."
    3. If the information isn't in the data, say "I don't have enough knowledge to answer that question."
    4. Format numbers with proper commas for readability (like 100,000 instead of 100000)
    5. Lists of players should be presented in a numbered format
    6. When showing statistics, use clear labels and line breaks for readability
    7. For questions like "who got most runs?" or "who has highest wickets?", calculate the answer from the data
    8. For questions about specific categories like "list all batsmen", filter and return all players of that category
    9. Respond to queries about universities by listing all players from that university
    10. Handle incomplete or informal questions by focusing on the intent (e.g., "batsman" → list all batsmen)
    
    User question: ${message}
    `;

    // Process with Gemini
    const responseText = await processWithGemini(instructions, playerContext);

    // Final safety check to ensure no points are mentioned
    if (
      responseText.toLowerCase().includes("point") ||
      responseText.toLowerCase().includes("score") ||
      responseText.toLowerCase().includes("rating")
    ) {
      // Try manual response first
      const manualResponse = getManualResponse(message);
      if (
        manualResponse !==
        "I don't have enough knowledge to answer that question."
      ) {
        return NextResponse.json({ message: manualResponse }, { status: 200 });
      }

      return NextResponse.json(
        { message: "I'm sorry, I cannot reveal player points information." },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: responseText }, { status: 200 });
  } catch (error) {
    console.error("Spiriter error:", error);
    // Provide more helpful error message
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        message: `I'm having trouble processing your request. Error: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
