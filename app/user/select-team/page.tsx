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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatCurrency } from "@/app/lib/utils";
import { calculatePlayerValue } from "@/app/lib/utils/playerValue";

interface Player {
  _id: string;
  name: string;
  university: string;
  category: string;
  totalRuns: number;
  wickets: number;
  value: number;
  price: number;
  battingStrikeRate: number;
  battingAverage: number;
  economyRate: number;
  [key: string]: string | number | boolean | undefined; // Properly typed index signature
}

export default function SelectTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [userTeam, setUserTeam] = useState<Player[]>([]);
  const [budget, setBudget] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error("Error fetching team:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch your team"
        );
      }
    };

    fetchUserTeam();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const categoryParam =
          activeCategory !== "all" ? `?category=${activeCategory}` : "";
        const response = await fetch(`/api/players${categoryParam}`);

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        setPlayers(data.players);
      } catch (error: unknown) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [activeCategory]);

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

      // Update the local state with the player that was just added
      const addedPlayer = players.find((p) => p._id === playerId);
      if (addedPlayer) {
        setUserTeam([...userTeam, addedPlayer]);
        setBudget(data.budget);
      }

      toast.success("Player added to your team");
    } catch (error: unknown) {
      console.error("Error adding player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add player"
      );
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

      toast.success("Player removed from your team");
    } catch (error: unknown) {
      console.error("Error removing player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to remove player"
      );
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
          <p className="text-gray-600">
            Select players by category to build your team
          </p>
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
              <div className="mt-2">
                <span className="text-gray-700">Team Size:</span>
                <span className="ml-2 font-semibold">
                  {userTeam.length}/11 players
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={setActiveCategory}
      >
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="all">All Players</TabsTrigger>
          <TabsTrigger value="Batsman">Batsmen</TabsTrigger>
          <TabsTrigger value="Bowler">Bowlers</TabsTrigger>
          <TabsTrigger value="All-Rounder">All-Rounders</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Skeleton className="h-8 w-full rounded-md" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <Card
                  key={player._id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className={getAvatarColor(player.name)}>
                        <AvatarFallback>
                          {getPlayerInitials(player.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{player.name}</CardTitle>
                        <CardDescription>{player.university}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3">
                    <div className="flex justify-between items-center mb-2">
                      <Badge
                        className={`${getCategoryColor(
                          player.category
                        )} font-medium text-xs`}
                      >
                        {player.category}
                      </Badge>
                      <span className="font-semibold text-right">
                        {formatCurrency(calculatePlayerValue(player))}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    {isPlayerInTeam(player._id) ? (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => removePlayerFromTeam(player._id)}
                      >
                        Remove from Team
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => addPlayerToTeam(player._id)}
                        disabled={
                          userTeam.length >= 11 ||
                          budget < calculatePlayerValue(player)
                        }
                      >
                        Add to Team
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {players.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No players found in this category
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
