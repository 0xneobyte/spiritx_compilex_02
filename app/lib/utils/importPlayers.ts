import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { connectToDB } from "./database";
import Player from "../models/player";
import User from "../models/user";
import bcrypt from "bcryptjs";

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
    const insertResult = await Player.insertMany(players);
    console.log(`Inserted ${insertResult.length} players into database`);

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

export async function createPredefinedUser() {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username: "spiritx_2025" });

    if (existingUser) {
      console.log("Predefined user already exists, skipping creation");
      return {
        success: true,
        message: "Predefined user already exists",
        user: existingUser,
      };
    }

    // Create a randomly selected team of players
    // Get all players
    const allPlayers = await Player.find({});

    if (allPlayers.length < 11) {
      console.error("Not enough players to create a team");
      return {
        success: false,
        message: "Not enough players to create a team",
      };
    }

    // Randomly select 11 players
    const shuffled = allPlayers.sort(() => 0.5 - Math.random());
    const selectedPlayers = shuffled.slice(0, 11);

    // Calculate total value
    const totalValue = selectedPlayers.reduce(
      (sum, player) => sum + (player.value || 100000),
      0
    );

    // Create the user with password "cricket2025"
    const hashedPassword = await bcrypt.hash("cricket2025", 10);

    const newUser = new User({
      username: "spiritx_2025",
      password: hashedPassword,
      fullName: "SpiritX Admin",
      role: "user",
      team: selectedPlayers.map((p) => p._id),
      budget: 10000000 - totalValue,
      createdAt: new Date(),
    });

    await newUser.save();

    console.log(
      `Created predefined user with ${selectedPlayers.length} players and ${newUser.budget} budget`
    );

    return {
      success: true,
      message: "Predefined user created successfully",
      user: newUser,
    };
  } catch (error) {
    console.error("Error creating predefined user:", error);
    return {
      success: false,
      message: "Error creating predefined user",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
