"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  [key: string]: string | number | boolean | undefined;
}

export default function TeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userTeam, setUserTeam] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [budget, setBudget] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTeam = async (): Promise<Player[]> => {
      try {
        const response = await fetch("/api/user/team");
        if (!response.ok) {
          throw new Error("Failed to fetch your team");
        }

        const data = await response.json();
        setUserTeam(data.team || []);
        setBudget(data.budget || 0);
        return data.team || [];
      } catch (err) {
        console.error("Error fetching team:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch your team"
        );
        toast.error("Failed to load your team");
        return [];
      }
    };

    fetchUserTeam().then((team) => {
      setUserTeam(team);
    });
  }, []);

  useEffect(() => {
    const fetchPlayers = async (): Promise<Player[]> => {
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
        return data.players;
      } catch (error: unknown) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load players");
        return [];
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers().then((players) => {
      setAllPlayers(players);
    });
  }, [selectedCategory]);

  const addPlayerToTeam = async (playerId: string): Promise<void> => {
    try {
      // Find the player to get their value
      const playerToAdd = allPlayers.find((p) => p._id === playerId);
      if (!playerToAdd) return;

      const playerValue = calculatePlayerValue(playerToAdd);

      // Check if there's enough budget
      if (budget < playerValue) {
        toast.error("Insufficient budget to add this player");
        return;
      }

      const response = await fetch("/api/user/team/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerValue }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add player");

      // Update local state
      setUserTeam([...userTeam, playerToAdd]);
      setBudget((prevBudget) => prevBudget - playerValue);

      toast.success("Player added to your team");
    } catch (error: unknown) {
      console.error("Error adding player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add player"
      );
    }
  };

  const removePlayerFromTeam = async (playerId: string): Promise<void> => {
    try {
      // Find the player to get their value
      const playerToRemove = userTeam.find((p) => p._id === playerId);
      if (!playerToRemove) return;

      const playerValue = calculatePlayerValue(playerToRemove);

      const response = await fetch("/api/user/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerValue }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to remove player");

      // Update local state
      setUserTeam(userTeam.filter((p) => p._id !== playerId));
      setBudget((prevBudget) => prevBudget + playerValue);

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
        return "bg-blue-50 text-blue-700 border border-blue-300";
      case "Bowler":
        return "bg-green-50 text-green-700 border border-green-300";
      case "All-Rounder":
        return "bg-purple-50 text-purple-700 border border-purple-300";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-300";
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
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="font-medium text-red-800">Error</h3>
          <p className="text-red-700">{error}</p>
          <button
            className="mt-2 px-3 py-1 bg-red-700 text-white rounded-md"
            onClick={() => router.refresh()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Select Your Team</h1>
          <p className="text-gray-600">{userTeam.length}/11 players selected</p>
        </div>

        <div className="mt-2 bg-white border rounded-md px-3 py-2">
          <p className="text-gray-700 font-medium">
            Budget:{" "}
            <span className="font-bold text-indigo-600">
              {formatCurrency(budget)}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <div className="mb-4">
          <h2 className="font-medium mb-2">Select Players</h2>
          <p className="text-sm text-gray-600 mb-3">
            Add players to complete your team
          </p>

          <Tabs defaultValue="All" onValueChange={setSelectedCategory}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Batsman">Batsmen</TabsTrigger>
              <TabsTrigger value="Bowler">Bowlers</TabsTrigger>
              <TabsTrigger value="All-Rounder">All-Rounders</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allPlayers.map((player) => (
              <div
                key={player._id}
                className="border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${getAvatarColor(
                      player.name
                    )}`}
                  >
                    {getPlayerInitials(player.name)}
                  </div>
                  <div>
                    <h3 className="font-medium">{player.name}</h3>
                    <p className="text-sm text-gray-600">{player.university}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={`${getCategoryColor(
                          player.category
                        )} text-xs px-2 py-0.5`}
                      >
                        {player.category}
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatCurrency(calculatePlayerValue(player))}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className={`px-3 py-1 text-sm rounded-md ${
                    isPlayerInTeam(player._id)
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : userTeam.length >= 11 ||
                        budget < calculatePlayerValue(player)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                  onClick={() =>
                    isPlayerInTeam(player._id)
                      ? removePlayerFromTeam(player._id)
                      : addPlayerToTeam(player._id)
                  }
                  disabled={
                    !isPlayerInTeam(player._id) &&
                    (userTeam.length >= 11 ||
                      budget < calculatePlayerValue(player))
                  }
                >
                  {isPlayerInTeam(player._id) ? "Remove" : "Add"}
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && allPlayers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No players found in this category</p>
          </div>
        )}

        {userTeam.length === 11 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-center">
            <p className="text-green-700">
              Your team is complete!
              <button
                className="ml-1 text-green-700 font-medium hover:underline"
                onClick={() => router.push("/user/myteam")}
              >
                View your team details
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
