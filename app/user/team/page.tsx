"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency } from "@/app/lib/utils";

interface Player {
  _id: string;
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
  value: number;
}

export default function TeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userTeam, setUserTeam] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [budget, setBudget] = useState(0);
  const [teamPoints, setTeamPoints] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        const response = await fetch("/api/user/team");
        if (!response.ok) {
          throw new Error("Failed to fetch your team");
        }

        const data = await response.json();
        setUserTeam(data.team || []);
        setBudget(data.budget || 0);
        setTeamPoints(data.teamPoints);
      } catch (err: any) {
        setError(err.message || "Failed to load your team");
      }
    };

    fetchUserTeam();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const categoryParam =
          selectedCategory !== "All" ? `?category=${selectedCategory}` : "";
        const response = await fetch(`/api/players${categoryParam}`);

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        setAllPlayers(data.players);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedCategory]);

  const addPlayerToTeam = async (playerId: string) => {
    try {
      // Find the player to get their value (calculated if needed)
      const playerToAdd = allPlayers.find((p) => p._id === playerId);
      if (!playerToAdd) {
        throw new Error("Player not found");
      }

      // Get the actual value that should be used (from DB or calculated)
      const playerValue = getPlayerValue(playerToAdd);

      // Check if there's enough budget
      if (budget < playerValue) {
        toast.error("Insufficient budget to add this player");
        return;
      }

      const response = await fetch("/api/user/team/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          playerValue: playerValue, // Send the calculated value to ensure consistency
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add player");
      }

      // Update the local state
      setUserTeam([...userTeam, playerToAdd]);

      // Update budget by subtracting the player's value
      setBudget((prevBudget) => prevBudget - playerValue);

      // Check if team is complete
      if (userTeam.length + 1 === 11) {
        // Refresh to get the team points calculation
        const teamResponse = await fetch("/api/user/team");
        const teamData = await teamResponse.json();
        setTeamPoints(teamData.teamPoints);
      }

      toast.success("Player added to your team");
    } catch (err: any) {
      toast.error(err.message || "Failed to add player");
    }
  };

  const removePlayerFromTeam = async (playerId: string) => {
    try {
      // Find the player to get their value (calculated if needed)
      const playerToRemove = userTeam.find((p) => p._id === playerId);
      if (!playerToRemove) {
        throw new Error("Player not found in your team");
      }

      // Get the actual value that should be used (from DB or calculated)
      const playerValue = getPlayerValue(playerToRemove);

      const response = await fetch("/api/user/team/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
          playerValue: playerValue, // Send the calculated value to ensure consistency
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove player");
      }

      // Update the local state
      setUserTeam(userTeam.filter((p) => p._id !== playerId));

      // Update budget by adding back the player's value
      setBudget((prevBudget) => prevBudget + playerValue);

      // Reset team points if team is no longer complete
      if (userTeam.length <= 11) {
        setTeamPoints(null);
      }

      toast.success("Player removed from your team");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove player");
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Batsman":
        return "bg-blue-50 text-blue-700 border-2 border-blue-400 hover:border-blue-500 hover:bg-blue-100 transition-colors";
      case "Bowler":
        return "bg-green-50 text-green-700 border-2 border-green-400 hover:border-green-500 hover:bg-green-100 transition-colors";
      case "All-Rounder":
        return "bg-purple-50 text-purple-700 border-2 border-purple-400 hover:border-purple-500 hover:bg-purple-100 transition-colors";
      default:
        return "bg-gray-50 text-gray-700 border-2 border-gray-400 hover:border-gray-500 hover:bg-gray-100 transition-colors";
    }
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];

    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const isPlayerInTeam = (playerId: string) => {
    return userTeam.some((player) => player._id === playerId);
  };

  // Calculate batting strike rate on the fly
  const calculateBattingStrikeRate = (player: Player) => {
    if (!player.ballsFaced || player.ballsFaced === 0) return 0;
    return (player.totalRuns / player.ballsFaced) * 100;
  };

  // Calculate batting average on the fly
  const calculateBattingAverage = (player: Player) => {
    if (!player.inningsPlayed || player.inningsPlayed === 0) return 0;
    return player.totalRuns / player.inningsPlayed;
  };

  // Calculate bowling strike rate on the fly
  const calculateBowlingStrikeRate = (player: Player) => {
    if (!player.wickets || player.wickets === 0) return 0;
    const ballsBowled = Math.floor(player.oversBowled * 6);
    return ballsBowled > 0 ? ballsBowled / player.wickets : 0;
  };

  // Calculate economy rate on the fly
  const calculateEconomyRate = (player: Player) => {
    if (!player.oversBowled || player.oversBowled === 0) return 0;
    return player.runsConceded / player.oversBowled;
  };

  // Calculate player points on the fly
  const calculatePlayerPoints = (player: Player) => {
    let points = 0;

    // Get batting strike rate
    const battingStrikeRate =
      player.battingStrikeRate > 0
        ? player.battingStrikeRate
        : calculateBattingStrikeRate(player);

    // Get batting average
    const battingAverage =
      player.battingAverage > 0
        ? player.battingAverage
        : calculateBattingAverage(player);

    // Get bowling strike rate
    const bowlingStrikeRate =
      player.bowlingStrikeRate > 0
        ? player.bowlingStrikeRate
        : calculateBowlingStrikeRate(player);

    // Get economy rate
    const economyRate =
      player.economyRate > 0
        ? player.economyRate
        : calculateEconomyRate(player);

    // Calculate points using the same formula as the model
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

  // Calculate player value on the fly
  const getPlayerValue = (player: Player) => {
    if (player.value > 0) return player.value;

    const points = calculatePlayerPoints(player);

    // Calculate value using the same formula as the model
    return Math.round(((9 * points + 100) * 1000) / 50000) * 50000;
  };

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
              onClick={() => router.refresh()}
            >
              Try Again
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Select Your Team</h1>
          <p className="text-gray-600">{userTeam.length}/11 players selected</p>
        </div>

        <div className="mt-4 md:mt-0">
          <div className="rounded-lg border p-4 bg-white shadow-sm">
            <p className="text-gray-700 font-medium">
              Budget:{" "}
              <span className="font-bold text-indigo-600">
                {formatCurrency(budget)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Members Section */}
        <div className="md:col-span-1">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Your selected players</CardDescription>
            </CardHeader>
            <CardContent>
              {userTeam.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  No players in your team yet
                </p>
              ) : (
                <div className="space-y-4">
                  {userTeam.map((player) => (
                    <div
                      key={player._id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                            player.name
                          )}`}
                        >
                          {getPlayerInitials(player.name)}
                        </div>
                        <div>
                          <h3 className="font-medium">{player.name}</h3>
                          <Badge
                            className={`${getCategoryColor(
                              player.category
                            )} text-xs`}
                          >
                            {player.category}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removePlayerFromTeam(player._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Player Selection Section */}
        <div className="md:col-span-2">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>Select Players</CardTitle>
              <CardDescription>
                Add players to complete your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Tabs
                  defaultValue="All"
                  onValueChange={setSelectedCategory}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="All">All</TabsTrigger>
                    <TabsTrigger value="Batsman">Batsmen</TabsTrigger>
                    <TabsTrigger value="Bowler">Bowlers</TabsTrigger>
                    <TabsTrigger value="All-Rounder">All-Rounders</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-28 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-full mt-2" />
                      <div className="flex justify-between mt-3">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allPlayers.map((player) => (
                    <div
                      key={player._id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${getAvatarColor(
                              player.name
                            )}`}
                          >
                            {getPlayerInitials(player.name)}
                          </div>
                          <div>
                            <h3 className="font-medium">{player.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {player.university}
                            </p>
                            <Badge
                              className={`${getCategoryColor(
                                player.category
                              )} text-xs mt-1`}
                            >
                              {player.category}
                            </Badge>
                            <p className="text-sm font-medium text-gray-700 mt-1">
                              {formatCurrency(getPlayerValue(player))}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button
                            size="sm"
                            variant={
                              isPlayerInTeam(player._id)
                                ? "destructive"
                                : "default"
                            }
                            onClick={() =>
                              isPlayerInTeam(player._id)
                                ? removePlayerFromTeam(player._id)
                                : addPlayerToTeam(player._id)
                            }
                            disabled={
                              !isPlayerInTeam(player._id) &&
                              (userTeam.length >= 11 ||
                                budget < getPlayerValue(player))
                            }
                          >
                            {isPlayerInTeam(player._id) ? "Remove" : "Add"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && allPlayers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    No players found in this category
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
