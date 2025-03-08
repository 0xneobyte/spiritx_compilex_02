"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/team");
        if (!response.ok) {
          throw new Error("Failed to fetch your team");
        }

        const data = await response.json();
        setUserTeam(data.team || []);
        setBudget(data.budget || 0);

        // Calculate team points if team is complete
        if (data.team && data.team.length === 11) {
          const points = calculateTeamPoints(data.team);
          setTeamPoints(points);
        } else {
          setTeamPoints(null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load your team");
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeam();
  }, []);

  const removePlayerFromTeam = async (playerId: string) => {
    try {
      // Find the player and value
      const playerToRemove = userTeam.find((p) => p._id === playerId);
      if (!playerToRemove) return;
      const playerValue = getPlayerValue(playerToRemove);

      const response = await fetch("/api/user/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, playerValue }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to remove player");

      // Update local state
      const updatedTeam = userTeam.filter((p) => p._id !== playerId);
      setUserTeam(updatedTeam);
      setBudget((prevBudget) => prevBudget + playerValue);

      // Update team points
      if (updatedTeam.length < 11) {
        setTeamPoints(null);
      } else {
        setTeamPoints(calculateTeamPoints(updatedTeam));
      }

      toast.success("Player removed from your team");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove player");
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

  // Calculate statistics functions
  const calculateBattingStrikeRate = (player: Player) => {
    if (!player.ballsFaced || player.ballsFaced === 0) return 0;
    return (player.totalRuns / player.ballsFaced) * 100;
  };

  const calculateBattingAverage = (player: Player) => {
    if (!player.inningsPlayed || player.inningsPlayed === 0) return 0;
    return player.totalRuns / player.inningsPlayed;
  };

  const calculateBowlingStrikeRate = (player: Player) => {
    if (!player.wickets || player.wickets === 0) return 0;
    const ballsBowled = Math.floor(player.oversBowled * 6);
    return ballsBowled > 0 ? ballsBowled / player.wickets : 0;
  };

  const calculateEconomyRate = (player: Player) => {
    if (!player.oversBowled || player.oversBowled === 0) return 0;
    return player.runsConceded / player.oversBowled;
  };

  // Calculate player points
  const calculatePlayerPoints = (player: Player) => {
    let points = 0;
    const battingStrikeRate =
      player.battingStrikeRate > 0
        ? player.battingStrikeRate
        : calculateBattingStrikeRate(player);
    const battingAverage =
      player.battingAverage > 0
        ? player.battingAverage
        : calculateBattingAverage(player);
    const bowlingStrikeRate =
      player.bowlingStrikeRate > 0
        ? player.bowlingStrikeRate
        : calculateBowlingStrikeRate(player);
    const economyRate =
      player.economyRate > 0
        ? player.economyRate
        : calculateEconomyRate(player);

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

  // Calculate player value
  const getPlayerValue = (player: Player) => {
    if (player.value > 0) return player.value;
    const points = calculatePlayerPoints(player);
    return Math.round(((9 * points + 100) * 1000) / 50000) * 50000;
  };

  // Calculate team points
  const calculateTeamPoints = (team = userTeam) => {
    if (team.length !== 11) return null;
    return team.reduce(
      (total, player) => total + calculatePlayerPoints(player),
      0
    );
  };

  if (error) {
    return (
      <div className="p-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Error</h3>
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
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-gray-600">
            Your selected players ({userTeam.length}/11)
          </p>
        </div>

        {teamPoints !== null && (
          <div className="mt-2 bg-white border rounded-md px-3 py-2">
            <p className="text-gray-700 font-medium">
              Team Points:{" "}
              <span className="font-bold text-green-600">
                {teamPoints.toFixed(1)}
              </span>
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4">
          <p>Loading your team...</p>
        </div>
      ) : userTeam.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg border">
          <p className="text-gray-500 mb-3">
            You haven't selected any players yet.
          </p>
          <Button onClick={() => router.push("/user/team")}>
            Go to Select Players
          </Button>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          {userTeam.map((player, index) => (
            <div
              key={player._id}
              className={`${index !== 0 ? "border-t" : ""} p-3`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0 ${getAvatarColor(
                    player.name
                  )}`}
                >
                  {getPlayerInitials(player.name)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{player.name}</h3>
                      <p className="text-sm text-gray-600">
                        {player.university}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      Points: {calculatePlayerPoints(player).toFixed(1)}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <Badge
                      className={`${getCategoryColor(player.category)} text-xs`}
                    >
                      {player.category}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {formatCurrency(getPlayerValue(player))}
                      </span>
                      <button
                        className="text-xs text-red-600 hover:text-red-800"
                        onClick={() => removePlayerFromTeam(player._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {userTeam.length < 11 && (
            <div className="p-3 bg-amber-50 border-t border-amber-200">
              <p className="text-center text-amber-700 text-sm">
                Add {11 - userTeam.length} more player
                {11 - userTeam.length !== 1 ? "s" : ""} to see your team's total
                points.
                <Button
                  variant="link"
                  className="text-amber-700 font-medium p-0 h-auto ml-1"
                  onClick={() => router.push("/user/team")}
                >
                  Continue selecting
                </Button>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
