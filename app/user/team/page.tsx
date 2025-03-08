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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  const [budget, setBudget] = useState(0);
  const [teamPoints, setTeamPoints] = useState<number | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

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
          selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
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
      const response = await fetch("/api/user/team/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add player");
      }

      // Update the local state
      const updatedPlayer = allPlayers.find((p) => p._id === playerId);
      if (updatedPlayer) {
        setUserTeam([...userTeam, updatedPlayer]);
        setBudget(data.budget);

        // Check if team is complete
        if (data.teamSize === 11) {
          // Refresh to get the team points calculation
          const teamResponse = await fetch("/api/user/team");
          const teamData = await teamResponse.json();
          setTeamPoints(teamData.teamPoints);
        }
      }

      toast.success("Player added to your team");
    } catch (err: any) {
      toast.error(err.message || "Failed to add player");
    }
  };

  const removePlayerFromTeam = async (playerId: string) => {
    try {
      const response = await fetch("/api/user/team/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove player");
      }

      // Update the local state
      setUserTeam(userTeam.filter((p) => p._id !== playerId));
      setBudget(data.budget);

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
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300";
      case "Bowler":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300";
      case "All-Rounder":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300";
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
          <h1 className="text-3xl font-bold text-gray-800">Your Team</h1>
          <p className="text-gray-600">{userTeam.length}/11 players selected</p>
        </div>

        <div className="mt-4 md:mt-0">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Budget:</span>
                <span className="text-xl font-bold text-indigo-600">
                  {formatCurrency(budget)}
                </span>
              </div>

              {teamPoints !== null && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-gray-700">Team Points:</span>
                  <span className="text-xl font-bold text-green-600">
                    {teamPoints.toFixed(2)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Team Members Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Your selected players</CardDescription>
            </CardHeader>
            <CardContent>
              {userTeam.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No players selected yet.</p>
                  <p className="text-sm mt-2">
                    Add players from the selection panel.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTeam.map((player) => (
                    <div
                      key={player._id}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar
                          className={`h-8 w-8 ${getAvatarColor(player.name)}`}
                        >
                          <AvatarFallback>
                            {getPlayerInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{player.name}</p>
                          <Badge
                            className={`text-xs ${getCategoryColor(
                              player.category
                            )}`}
                          >
                            {player.category}
                          </Badge>
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                        onClick={() => removePlayerFromTeam(player._id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Player Selection Section */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Select Players</CardTitle>
              <CardDescription>
                Add players to complete your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="all"
                className="w-full"
                onValueChange={setSelectedCategory}
              >
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Batsman">Batsmen</TabsTrigger>
                  <TabsTrigger value="Bowler">Bowlers</TabsTrigger>
                  <TabsTrigger value="All-Rounder">All-Rounders</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedCategory} className="mt-2">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[...Array(6)].map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 rounded-lg border"
                        >
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {allPlayers.map((player) => {
                        const playerInTeam = isPlayerInTeam(player._id);
                        const canAfford = budget >= player.value;
                        const teamFull = userTeam.length >= 11;

                        return (
                          <div
                            key={player._id}
                            className={`flex items-center justify-between p-3 rounded-lg border 
                              ${
                                playerInTeam
                                  ? "bg-indigo-50 border-indigo-200"
                                  : "bg-white hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar
                                className={`h-10 w-10 ${getAvatarColor(
                                  player.name
                                )}`}
                              >
                                <AvatarFallback>
                                  {getPlayerInitials(player.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{player.name}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge
                                    className={`text-xs ${getCategoryColor(
                                      player.category
                                    )}`}
                                  >
                                    {player.category}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {formatCurrency(player.value)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              {playerInTeam ? (
                                <button
                                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200"
                                  onClick={() =>
                                    removePlayerFromTeam(player._id)
                                  }
                                >
                                  Remove
                                </button>
                              ) : (
                                <button
                                  className={`px-3 py-1 rounded-md text-sm ${
                                    canAfford && !teamFull
                                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  }`}
                                  onClick={() => {
                                    if (canAfford && !teamFull) {
                                      addPlayerToTeam(player._id);
                                    } else if (teamFull) {
                                      toast.error(
                                        "Your team is already full (11 players maximum)"
                                      );
                                    } else {
                                      toast.error(
                                        "Insufficient budget to add this player"
                                      );
                                    }
                                  }}
                                  disabled={!canAfford || teamFull}
                                >
                                  {!canAfford
                                    ? "Can't Afford"
                                    : teamFull
                                    ? "Team Full"
                                    : "Add"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
