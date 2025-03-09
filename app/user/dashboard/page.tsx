"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  DollarSign,
  TrendingUp,
  Trophy,
  CalendarDays,
  ChevronRight,
  Lightbulb,
  Award,
  Settings,
  RefreshCcw,
} from "lucide-react";

interface User {
  id: string;
  username: string;
  budget: number;
  role: string;
}

interface Player {
  _id: string;
  name: string;
  category: string;
  university: string;
  totalRuns: number;
  wickets: number;
  points: number;
  value: number;
  price: number;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  teamSize: number;
  points: number;
  isComplete: boolean;
  isCurrentUser: boolean;
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState<number | null>(null);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);

  // Combined data fetching function to ensure proper sequencing
  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log("Starting data fetch sequence");

      // 1. First fetch user data
      try {
        const userResponse = await fetch("/api/user/me");
        if (!userResponse.ok)
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        const userData = await userResponse.json();
        console.log("User data fetched:", userData);

        // Set user data
        const currentUser = {
          id: userData.id || "",
          username: userData.username || "",
          budget: userData.budget || 0,
          role: userData.role || "user",
        };
        setUser(currentUser);
      } catch (userError) {
        console.error("Error fetching user data:", userError);
        // Set fallback user data so we can continue
        setUser({
          id: "",
          username: "Guest",
          budget: 0,
          role: "user",
        });
      }

      // 2. Then fetch team data
      try {
        const teamResponse = await fetch("/api/user/team");

        // Log full response details for debugging
        console.log("Team API response status:", teamResponse.status);
        console.log("Team API response status text:", teamResponse.statusText);

        if (!teamResponse.ok) {
          // Get more details about the error
          let errorDetails = "";
          try {
            const errorData = await teamResponse.json();
            errorDetails = JSON.stringify(errorData);
          } catch {
            errorDetails = "Could not parse error response";
          }
          throw new Error(
            `Failed to fetch team data: ${teamResponse.status} - ${errorDetails}`
          );
        }

        const teamData = await teamResponse.json();
        console.log("Team data fetched:", teamData);

        // Set team players
        const players = teamData.team || [];
        const sortedPlayers = [...players].sort(
          (a, b) => (b.points || 0) - (a.points || 0)
        );
        setTeamPlayers(sortedPlayers);

        // Store team points from API or calculate locally if not provided
        let calculatedPoints = teamData.teamPoints;
        // If API doesn't provide teamPoints, calculate from player data
        if (calculatedPoints === null || calculatedPoints === undefined) {
          calculatedPoints = sortedPlayers.reduce(
            (sum: number, player: Player) => sum + (player.points || 0),
            0
          );
          console.log("Calculated points locally:", calculatedPoints);
        } else {
          console.log("Using points from API:", calculatedPoints);
        }

        // 3. Finally fetch leaderboard data - this is the source of truth for points
        try {
          const leaderboardResponse = await fetch("/api/leaderboard");
          if (!leaderboardResponse.ok)
            throw new Error(
              `Failed to fetch leaderboard: ${leaderboardResponse.status}`
            );

          const leaderboardData = await leaderboardResponse.json();
          console.log("Leaderboard data fetched:", leaderboardData);

          if (
            leaderboardData.leaderboard &&
            Array.isArray(leaderboardData.leaderboard)
          ) {
            const currentUser = user || { id: "", username: "" };
            // Add debug logs to check user IDs
            console.log("Current user to find:", {
              id: currentUser.id,
              username: currentUser.username,
            });

            // Log all leaderboard entries for debugging
            leaderboardData.leaderboard.forEach(
              (entry: LeaderboardEntry, index: number) => {
                console.log(`Leaderboard entry ${index}:`, {
                  id: entry.id,
                  username: entry.username,
                  isCurrentUser: entry.isCurrentUser,
                });
              }
            );

            // Prioritize the entry that has isCurrentUser flag set to true
            const userEntry = leaderboardData.leaderboard.find(
              (entry: LeaderboardEntry) => entry.isCurrentUser === true
            );

            if (!userEntry) {
              // Fallback to ID/username matching if isCurrentUser not found
              console.log(
                "No entry with isCurrentUser=true, trying to match by ID/username"
              );
            }

            if (userEntry) {
              // Get rank
              const rank =
                leaderboardData.leaderboard.findIndex(
                  (entry: LeaderboardEntry) => entry === userEntry
                ) + 1;

              // Set leaderboard data - THIS IS THE SOURCE OF TRUTH FOR POINTS
              console.log("Setting points from leaderboard:", userEntry.points);
              setLeaderboardRank(rank > 0 ? rank : null);
              setTotalPoints(userEntry.points);
            } else {
              console.log(
                "User not found in leaderboard, using team points calculation"
              );
              setLeaderboardRank(null);

              // Use calculated points from team data
              setTotalPoints(calculatedPoints || 0);
            }
          } else {
            // Fallback to calculated points if leaderboard data is invalid
            console.log(
              "Invalid leaderboard data, using team points calculation"
            );
            setTotalPoints(calculatedPoints || 0);
          }
        } catch (leaderboardError) {
          console.error("Error fetching leaderboard:", leaderboardError);
          // Use calculated points from team data as fallback
          setTotalPoints(calculatedPoints || 0);
        }
      } catch (teamError) {
        console.error("Error fetching team data:", teamError);
        // Set empty players array so UI can show "no players" state
        setTeamPlayers([]);
      }
    } catch (error) {
      console.error("Error in main data fetching flow:", error);
      // Default values for graceful degradation
      if (!user) {
        setUser({
          id: "",
          username: "Guest",
          budget: 0,
          role: "user",
        });
      }
      if (teamPlayers.length === 0) {
        setTeamPlayers([]);
      }
      if (totalPoints === null) {
        setTotalPoints(0);
      }
    } finally {
      setLoading(false);
    }
  };

  // Single useEffect to fetch all data
  useEffect(() => {
    fetchAllData();

    // Optional: Set up polling to keep data fresh
    const intervalId = setInterval(() => {
      console.log("Refreshing data...");
      fetchAllData();
    }, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, []);

  // Format points for display with proper decimal places
  const formatPoints = (points: number | null): string => {
    if (points === null) return "0.0"; // Return 0.0 instead of "..." for null points

    // Convert to number to ensure proper formatting
    const numPoints = Number(points);
    if (isNaN(numPoints)) return "0.0";

    // Format with 1 decimal place
    return numPoints.toFixed(1);
  };

  const tips = [
    "Balance your team with both batsmen and bowlers",
    "Invest in all-rounders for maximum points",
    "Track player performance and make strategic replacements",
    "Don&apos;t spend your entire budget - save for future transfers",
  ];

  if (loading && !totalPoints) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <Skeleton className="h-72 rounded-xl mb-6" />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight">
            Welcome, {user?.username || "Player"}!
          </h1>
          <p className="text-slate-600 mt-1">
            Here&apos;s an overview of your fantasy cricket team
          </p>
        </div>
        <div className="flex items-center gap-3">
          {leaderboardRank && (
            <div className="bg-purple-50 border border-purple-100 px-4 py-2 rounded-lg">
              <p className="text-sm font-medium text-purple-700">
                Your Rank: {leaderboardRank}(
                {leaderboardRank === 1
                  ? "1st"
                  : leaderboardRank === 2
                  ? "2nd"
                  : leaderboardRank === 3
                  ? "3rd"
                  : `${leaderboardRank}th`}{" "}
                Place)
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => fetchAllData()}
              variant="outline"
              className="flex items-center gap-1 border-slate-200 bg-white"
              aria-label="Refresh data"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Link href="/user/team">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manage Team
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Team Status Card */}
        <Link
          href="/user/myteam"
          className="block transition-all duration-300 group"
        >
          <Card className="overflow-hidden h-full border-none shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-2 w-full bg-blue-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-700">My Team</CardTitle>
              </div>
              <CardDescription>
                {teamPlayers && teamPlayers.length > 0
                  ? `${teamPlayers.length} players selected`
                  : "No players selected yet"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-slate-800">
                    {formatPoints(totalPoints)}
                  </p>
                  <p className="text-sm text-slate-600">Total Points</p>
                </div>
                {leaderboardRank && (
                  <div className="bg-purple-100 px-3 py-1 rounded-full">
                    <p className="text-sm font-medium text-purple-700">
                      #{leaderboardRank} in Leaderboard
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-blue-600 font-medium">
                <span>View Team</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Budget Card */}
        <Link
          href="/user/budget"
          className="block transition-all duration-300 group"
        >
          <Card className="overflow-hidden h-full border-none shadow-lg shadow-green-100 hover:shadow-green-200 hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-2 w-full bg-green-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-green-100 rounded-full p-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-700">Budget</CardTitle>
              </div>
              <CardDescription>Current available funds</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-slate-800">
                    Rs {user?.budget?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-slate-600">Available</p>
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <p className="text-sm font-medium text-green-700">
                    {user?.budget && user.budget > 500000
                      ? "Healthy"
                      : "Limited"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-green-600 font-medium">
                <span>View Budget</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Leaderboard Card */}
        <Link
          href="/user/leaderboard"
          className="block transition-all duration-300 group"
        >
          <Card className="overflow-hidden h-full border-none shadow-lg shadow-purple-100 hover:shadow-purple-200 hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-2 w-full bg-purple-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-100 rounded-full p-2">
                  <Trophy className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-700">
                  Leaderboard
                </CardTitle>
              </div>
              <CardDescription>See how you rank against others</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  {leaderboardRank ? (
                    <>
                      <p className="text-3xl font-bold text-slate-800">
                        #{leaderboardRank}
                      </p>
                      <p className="text-sm text-slate-600">
                        {leaderboardRank === 1
                          ? "1st Place"
                          : leaderboardRank === 2
                          ? "2nd Place"
                          : leaderboardRank === 3
                          ? "3rd Place"
                          : `${leaderboardRank}th Place`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-slate-800">
                        Not Ranked
                      </p>
                      <p className="text-sm text-slate-600">
                        Build your team to rank
                      </p>
                    </>
                  )}
                </div>
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <p className="text-sm font-medium text-purple-700">
                    {formatPoints(totalPoints)} pts
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-purple-600 font-medium">
                <span>View Leaderboard</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Performers */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Your Top Performers</CardTitle>
              </div>
              <Link href="/user/myteam">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900"
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {teamPlayers.length > 0 ? (
              <div className="space-y-4">
                {teamPlayers.slice(0, 3).map((player) => (
                  <div
                    key={player._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          player.category === "Batsman"
                            ? "bg-blue-100 text-blue-600"
                            : player.category === "Bowler"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {player.name}
                        </p>
                        <p className="text-sm text-slate-500">
                          {player.university} • {player.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        {player.category === "Batsman"
                          ? `${player.totalRuns} runs`
                          : player.category === "Bowler"
                          ? `${player.wickets} wickets`
                          : `${player.totalRuns} runs, ${player.wickets} wickets`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-600 mb-4">
                  You haven&apos;t selected any players yet!
                </p>
                <Link href="/user/team">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Select Players
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fantasy Tips */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Fantasy Cricket Tips</CardTitle>
            </div>
            <CardDescription>
              Expert advice to improve your fantasy team
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b last:border-0 border-slate-100"
                >
                  <div className="bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-none shadow-lg mb-6">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Shortcuts to common tasks</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/user/team">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 border-slate-200 hover:border-purple-200 hover:bg-purple-50"
              >
                <Users className="h-5 w-5 text-purple-600" />
                <span>Select Players</span>
              </Button>
            </Link>
            <Link href="/user/players">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 border-slate-200 hover:border-blue-200 hover:bg-blue-50"
              >
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>View Players</span>
              </Button>
            </Link>
            <Link href="/user/leaderboard">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 border-slate-200 hover:border-amber-200 hover:bg-amber-50"
              >
                <Trophy className="h-5 w-5 text-amber-600" />
                <span>Leaderboard</span>
              </Button>
            </Link>
            <Link href="/user/spiriter">
              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col gap-2 border-slate-200 hover:border-green-200 hover:bg-green-50"
              >
                <CalendarDays className="h-5 w-5 text-green-600" />
                <span>Spiriter</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
