import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/utils/database";
import mongoose from "mongoose";
import User from "@/app/lib/models/user";
import Player from "@/app/lib/models/player";
import { authenticateRequest } from "@/app/lib/utils/auth";

// Ensure Player model is registered
if (mongoose.models.Player) {
  delete mongoose.models.Player;
}
mongoose.model("Player", Player.schema);

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const auth = authenticateRequest(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    console.log("User team API: Starting database connection");
    try {
      await connectToDB();
      console.log("User team API: Database connected successfully");
    } catch (dbError) {
      console.error("User team API: Database connection error:", dbError);
      return NextResponse.json(
        {
          message: "Database connection failed",
          error: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    try {
      console.log("User team API: Finding user with ID:", auth.user.id);
      // Find the user and populate their team with all fields
      const user = await User.findById(auth.user.id).populate({
        path: "team",
        select:
          "_id name university category value totalRuns ballsFaced inningsPlayed wickets oversBowled runsConceded battingStrikeRate battingAverage bowlingStrikeRate economyRate points",
      });

      if (!user) {
        console.log("User team API: User not found with ID:", auth.user.id);
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      console.log(
        "User team API: User found with team size:",
        user.team ? user.team.length : 0
      );

      // Calculate team points for any team size (not just complete teams)
      let teamPoints = 0;
      if (user.team && user.team.length > 0) {
        // We need to populate the team with player details to get points
        const populatedUser = await User.findById(user._id).populate("team");

        if (populatedUser && populatedUser.team) {
          // Calculate total team points by summing individual player points
          for (const player of populatedUser.team) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const playerAny = player as any;
            teamPoints += playerAny.points || 0;
          }
          console.log("User team API: Calculated team points:", teamPoints);
        }
      }

      return NextResponse.json(
        {
          team: user.team || [],
          budget: user.budget,
          teamComplete: user.team && user.team.length === 11,
          teamSize: user.team ? user.team.length : 0,
          teamPoints: teamPoints, // Always return teamPoints, even for incomplete teams
        },
        { status: 200 }
      );
    } catch (modelError) {
      console.error(
        "User team API: Error with Mongoose operations:",
        modelError
      );
      return NextResponse.json(
        {
          message: "Error processing team data",
          error:
            modelError instanceof Error ? modelError.message : "Unknown error",
          details:
            "This may be related to database models not being properly loaded",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("User team API: Unexpected error:", error);
    return NextResponse.json(
      {
        message: "Error fetching user team",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
