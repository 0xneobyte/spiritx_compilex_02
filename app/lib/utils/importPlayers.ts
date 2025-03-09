import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { connectToDB } from "./database";
import Player from "../models/player";
import User from "../models/user";

interface PlayerCSVData {
  Name: string;
  University: string;
  Category: string;
  "Total Runs": string;
  "Balls Faced": string;
  "Innings Played": string;
  Wickets: string;
  "Overs Bowled": string;
  "Runs Conceded": string;
}

export const importPlayersFromCSV = async () => {
  try {
    await connectToDB();

    // Check if players are already imported
    const existingCount = await Player.countDocuments({});
    if (existingCount > 0) {
      return {
        success: true,
        message: "Players already imported, skipping...",
        count: existingCount,
        newlyImported: 0,
      };
    }

    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), "sample_data.csv");
    console.log(`Reading CSV file from: ${csvFilePath}`);

    if (!fs.existsSync(csvFilePath)) {
      return {
        success: false,
        message: `CSV file not found at path: ${csvFilePath}`,
        count: 0,
        newlyImported: 0,
      };
    }

    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });
    console.log(
      `CSV file read successfully, content length: ${fileContent.length}`
    );

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as PlayerCSVData[];

    console.log(`Parsed ${records.length} records from CSV`);

    // Transform and save players
    const players = records.map((record) => ({
      name: record.Name,
      university: record.University,
      category: record.Category,
      totalRuns: parseInt(record["Total Runs"] || "0"),
      ballsFaced: parseInt(record["Balls Faced"] || "0"),
      inningsPlayed: parseInt(record["Innings Played"] || "0"),
      wickets: parseInt(record.Wickets || "0"),
      oversBowled: parseFloat(record["Overs Bowled"] || "0"),
      runsConceded: parseInt(record["Runs Conceded"] || "0"),
      isFromOriginalDataset: true,
    }));

    // Save all players to database
    const result = await Player.insertMany(players);

    return {
      success: true,
      message: `Successfully imported ${players.length} players`,
      count: players.length,
      newlyImported: players.length,
    };
  } catch (error) {
    console.error("Error importing players:", error);
    return {
      success: false,
      message: `Error importing players: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error: error,
      count: 0,
      newlyImported: 0,
    };
  }
};

// Create the predefined user with the specific team
export const createPredefinedUser = async () => {
  try {
    await connectToDB();

    // Check if predefined user already exists
    const existingUser = await User.findOne({ username: "spiritx_2025" });
    if (existingUser) {
      // Log details about the existing user for debugging
      console.log("Predefined user already exists with details:");
      console.log(`- Username: ${existingUser.username}`);
      console.log(`- Budget: ${existingUser.budget}`);
      console.log(`- Team size: ${existingUser.team.length}`);
      
      return {
        success: true,
        message: "Predefined user already exists, skipping...",
        userCreated: false,
        teamSize: existingUser.team.length,
        budget: existingUser.budget
      };
    }

    // Find the required players for the predefined team
    const requiredPlayers = [
      "Danushka Kumara",
      "Jeewan Thirimanne",
      "Charith Shanaka",
      "Pathum Dhananjaya",
      "Suranga Bandara",
      "Sammu Sandakan",
      "Minod Rathnayake",
      "Lakshan Gunathilaka",
      "Sadeera Rajapaksa",
      "Danushka Jayawickrama",
      "Lakshan Vandersay",
    ];

    // Log all players in DB to help diagnosis
    const allPlayers = await Player.find({}, "name");
    console.log(`Total players in database: ${allPlayers.length}`);
    console.log(
      "Player names available:",
      allPlayers.map((p) => p.name)
    );

    const players = await Player.find({ name: { $in: requiredPlayers } });
    console.log(
      `Found ${players.length}/${requiredPlayers.length} required players`
    );

    if (players.length !== requiredPlayers.length) {
      const missingPlayers = requiredPlayers.filter(
        (name) => !players.some((player) => player.name === name)
      );
      return {
        success: false,
        message: `Could not find all required players for the predefined team. Missing: ${missingPlayers.join(
          ", "
        )}`,
        userCreated: false,
        teamSize: 0,
        missingPlayers,
      };
    }

    // Create the predefined user
    const totalPlayerValue = players.reduce((total, player) => {
      console.log(`Player: ${player.name}, Value: ${player.value}`);
      return (
        total +
        (typeof player.value === "number" && player.value > 0
          ? player.value
          : 0)
      );
    }, 0);

    console.log(`Total player value: ${totalPlayerValue}`);

    const user = new User({
      username: "spiritx_2025",
      password: "SpiritX@2025",
      team: players.map((player) => player._id),
      // Set budget to fixed 9,000,000 for now to ensure correct value
      budget: 9000000,
    });

    await user.save();

    return {
      success: true,
      message: "Successfully created predefined user with team",
      userCreated: true,
      teamSize: players.length,
      playerValues: players.map((p) => ({ name: p.name, value: p.value })),
      totalPlayerValue,
      finalBudget: user.budget,
    };
  } catch (error) {
    console.error("Error creating predefined user:", error);
    return {
      success: false,
      message: `Error creating predefined user: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      error: error,
      userCreated: false,
      teamSize: 0,
    };
  }
};
