"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
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
  price: number;
  [key: string]: unknown; // For any other properties
}

export default function PlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

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
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [activeCategory]);

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
  const calculatePlayerValue = (player: Player) => {
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Players</h1>

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
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player) => (
                <Card
                  key={player._id}
                  className="overflow-hidden transition-all hover:shadow-lg"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar
                          className={`h-12 w-12 ${getAvatarColor(player.name)}`}
                        >
                          <AvatarFallback>
                            {getPlayerInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {player.name}
                          </CardTitle>
                          <CardDescription>{player.university}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getCategoryColor(player.category)}>
                        {player.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="text-sm text-gray-800 font-medium mt-1">
                      Value:{" "}
                      {formatCurrency(
                        player.value > 0
                          ? player.value
                          : calculatePlayerValue(player)
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          View Details
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Player Details</DialogTitle>
                          <DialogDescription>
                            Complete statistics for {player.name}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedPlayer && (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                              <Avatar
                                className={`h-16 w-16 ${getAvatarColor(
                                  selectedPlayer.name
                                )}`}
                              >
                                <AvatarFallback>
                                  {getPlayerInitials(selectedPlayer.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {selectedPlayer.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {selectedPlayer.university}
                                </p>
                                <Badge
                                  className={`mt-1 ${getCategoryColor(
                                    selectedPlayer.category
                                  )}`}
                                >
                                  {selectedPlayer.category}
                                </Badge>
                              </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                              <h4 className="font-medium">
                                Batting Statistics
                              </h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Total Runs:
                                  </span>
                                  <p className="font-medium">
                                    {selectedPlayer.totalRuns}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Innings Played:
                                  </span>
                                  <p className="font-medium">
                                    {selectedPlayer.inningsPlayed}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Balls Faced:
                                  </span>
                                  <p className="font-medium">
                                    {selectedPlayer.ballsFaced}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Batting Strike Rate:
                                  </span>
                                  <p className="font-medium">
                                    {selectedPlayer.battingStrikeRate > 0
                                      ? selectedPlayer.battingStrikeRate.toFixed(
                                          2
                                        )
                                      : calculateBattingStrikeRate(
                                          selectedPlayer
                                        ).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">
                                    Batting Average:
                                  </span>
                                  <p className="font-medium">
                                    {selectedPlayer.battingAverage > 0
                                      ? selectedPlayer.battingAverage.toFixed(2)
                                      : calculateBattingAverage(
                                          selectedPlayer
                                        ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {(selectedPlayer.category === "Bowler" ||
                              selectedPlayer.category === "All-Rounder") && (
                              <>
                                <Separator />
                                <div className="space-y-3">
                                  <h4 className="font-medium">
                                    Bowling Statistics
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="text-gray-500">
                                        Wickets:
                                      </span>
                                      <p className="font-medium">
                                        {selectedPlayer.wickets}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Overs Bowled:
                                      </span>
                                      <p className="font-medium">
                                        {selectedPlayer.oversBowled}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Runs Conceded:
                                      </span>
                                      <p className="font-medium">
                                        {selectedPlayer.runsConceded}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Economy Rate:
                                      </span>
                                      <p className="font-medium">
                                        {selectedPlayer.economyRate > 0
                                          ? selectedPlayer.economyRate.toFixed(
                                              2
                                            )
                                          : calculateEconomyRate(
                                              selectedPlayer
                                            ).toFixed(2)}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500">
                                        Bowling Strike Rate:
                                      </span>
                                      <p className="font-medium">
                                        {selectedPlayer.bowlingStrikeRate > 0
                                          ? selectedPlayer.bowlingStrikeRate.toFixed(
                                              2
                                            )
                                          : calculateBowlingStrikeRate(
                                              selectedPlayer
                                            ).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            <Separator />

                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-gray-500">
                                  Player Value:
                                </span>
                                <p className="text-lg font-semibold">
                                  {formatCurrency(selectedPlayer.value)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
