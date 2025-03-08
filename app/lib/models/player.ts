import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlayer extends Document {
  name: string;
  university: string;
  category: string;
  totalRuns: number;
  ballsFaced: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  battingStrikeRate: number;
  battingAverage: number;
  bowlingStrikeRate: number;
  economyRate: number;
  points: number;
  value: number;
  isFromOriginalDataset: boolean;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true },
    university: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Batsman", "Bowler", "All-Rounder"],
    },
    totalRuns: { type: Number, required: true, default: 0 },
    ballsFaced: { type: Number, required: true, default: 0 },
    inningsPlayed: { type: Number, required: true, default: 0 },
    wickets: { type: Number, required: true, default: 0 },
    oversBowled: { type: Number, required: false, default: 0 },
    runsConceded: { type: Number, required: false, default: 0 },
    battingStrikeRate: { type: Number, required: true, default: 0 },
    battingAverage: { type: Number, required: true, default: 0 },
    bowlingStrikeRate: { type: Number, default: 0 },
    economyRate: { type: Number, required: true, default: 0 },
    points: { type: Number, default: 0 },
    value: { type: Number, default: 0 },
    isFromOriginalDataset: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Calculate derived stats when saving a player
PlayerSchema.pre("save", function (next) {
  // Calculate Batting Strike Rate
  if (this.ballsFaced > 0) {
    this.battingStrikeRate = (this.totalRuns / this.ballsFaced) * 100;
  }

  // Calculate Batting Average
  if (this.inningsPlayed > 0) {
    this.battingAverage = this.totalRuns / this.inningsPlayed;
  }

  // Calculate Bowling Strike Rate
  const totalBallsBowled =
    Math.floor(this.oversBowled) * 6 + (this.oversBowled % 1) * 10;
  if (this.wickets > 0) {
    this.bowlingStrikeRate = totalBallsBowled / this.wickets;
  } else {
    this.bowlingStrikeRate =
      this.wickets > 0 ? totalBallsBowled / this.wickets : 999;
  }

  // Calculate Economy Rate
  if (totalBallsBowled > 0) {
    this.economyRate = (this.runsConceded / totalBallsBowled) * 6;
  }

  // Calculate Player Points
  this.points = 0;

  if (this.battingStrikeRate > 0) {
    this.points += this.battingStrikeRate / 5 + this.battingAverage * 0.8;
  }

  if (this.bowlingStrikeRate > 0 && this.bowlingStrikeRate < 999) {
    this.points += 500 / this.bowlingStrikeRate;
  }

  if (this.economyRate > 0) {
    this.points += 140 / this.economyRate;
  }

  // Calculate Player Value and round to nearest 50,000
  this.value = Math.round(((9 * this.points + 100) * 1000) / 50000) * 50000;

  next();
});

// Delete the model if it exists to avoid overwrite warnings
if (mongoose.models.Player) {
  mongoose.deleteModel("Player");
}

const Player = mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;
