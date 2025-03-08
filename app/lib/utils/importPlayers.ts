import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { connectToDB } from "./database";
import Player from "../models/player";

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
    const playersCount = await Player.countDocuments({});
    if (playersCount > 0) {
      console.log("Players already imported, skipping...");
      return;
    }

    // Read the CSV file
    const csvFilePath = path.join(process.cwd(), "sample_data.csv");
    const fileContent = fs.readFileSync(csvFilePath, { encoding: "utf-8" });

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as PlayerCSVData[];

    // Transform and save players
    const players = records.map((record) => ({
      name: record.Name,
      university: record.University,
      category: record.Category,
      totalRuns: parseInt(record["Total Runs"]),
      ballsFaced: parseInt(record["Balls Faced"]),
      inningsPlayed: parseInt(record["Innings Played"]),
      wickets: parseInt(record.Wickets),
      oversBowled: parseInt(record["Overs Bowled"]),
      runsConceded: parseInt(record["Runs Conceded"]),
      isFromOriginalDataset: true,
    }));

    // Save all players to database
    await Player.insertMany(players);

    console.log(`Successfully imported ${players.length} players`);
  } catch (error) {
    console.error("Error importing players:", error);
  }
};

// Create the predefined user with the specific team
export const createPredefinedUser = async () => {
  try {
    await connectToDB();

    const User = (await import("../models/user")).default;

    // Check if predefined user already exists
    const existingUser = await User.findOne({ username: "spiritx_2025" });
    if (existingUser) {
      console.log("Predefined user already exists, skipping...");
      return;
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

    const players = await Player.find({ name: { $in: requiredPlayers } });

    if (players.length !== requiredPlayers.length) {
      console.error(
        "Could not find all required players for the predefined team"
      );
      return;
    }

    // Create the predefined user
    const user = new User({
      username: "spiritx_2025",
      password: "SpiritX@2025",
      team: players.map((player) => player._id),
      // Adjust budget based on the total value of selected players
      budget:
        9000000 - players.reduce((total, player) => total + player.value, 0),
    });

    await user.save();
    console.log("Successfully created predefined user with team");
  } catch (error) {
    console.error("Error creating predefined user:", error);
  }
};
