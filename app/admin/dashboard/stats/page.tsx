"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Player {
  _id: string;
  name: string;
  university: string;
  category: string;
  totalRuns: number;
  ballsFaced: number;
  battingStrikeRate: number;
  battingAverage: number;
  inningsPlayed: number;
  wickets: number;
  economyRate: number;
  oversBowled: number;
  runsConceded: number;
  bowlingStrikeRate: number | null;
  points: number;
  value: number;
  price: number;
  isFromOriginalDataset: boolean;
}

// Update the getCategoryStyles function with a cleaner, minimalistic design using borders
const getCategoryStyles = (category: string) => {
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

// Define interfaces for proper typing
interface PlayerStats {
  name: string;
  totalRuns: number;
  battingStrikeRate: number;
  battingAverage: number;
  wickets: number;
  economyRate: number;
  bowlingStrikeRate: number | null;
  points: number;
  value: number;
  category: string;
  university: string;
}

export default function PlayerStats() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displaySortField, setDisplaySortField] = useState("name");
  const [selectedDetailPlayer, setSelectedDetailPlayer] =
    useState<Player | null>(null);
  const [showPlayerDetail, setShowPlayerDetail] = useState(false);

  // Calculate cricket statistics
  const calculateStats = (player: Player): Player => {
    const calculatedPlayer = { ...player };

    // Calculate Batting Strike Rate: (Total Runs / Balls Faced) × 100
    if (player.ballsFaced && player.ballsFaced > 0) {
      calculatedPlayer.battingStrikeRate =
        (player.totalRuns / player.ballsFaced) * 100;
    } else {
      calculatedPlayer.battingStrikeRate = 0;
    }

    // Calculate Batting Average: Total Runs / Innings Played
    if (player.inningsPlayed && player.inningsPlayed > 0) {
      calculatedPlayer.battingAverage = player.totalRuns / player.inningsPlayed;
    } else {
      calculatedPlayer.battingAverage = 0;
    }

    // Calculate balls bowled from overs (1 over = 6 balls)
    const ballsBowled = player.oversBowled ? player.oversBowled * 6 : 0;

    // Calculate Bowling Strike Rate: Total Balls Bowled / Total Wickets Taken
    if (player.wickets && player.wickets > 0) {
      calculatedPlayer.bowlingStrikeRate = ballsBowled / player.wickets;
    } else {
      // For players with 0 wickets, set to null - we'll display N/A in the UI
      calculatedPlayer.bowlingStrikeRate = null;
    }

    // Calculate Economy Rate: (Runs Conceded / Balls Bowled) × 6
    if (ballsBowled > 0) {
      calculatedPlayer.economyRate = (player.runsConceded / ballsBowled) * 6;
    } else {
      calculatedPlayer.economyRate = 0;
    }

    // Calculate Player Points
    let battingPoints = 0;
    let bowlingPoints = 0;

    // Batting component: (Batting Strike Rate / 5) + (Batting Average × 0.8)
    if (calculatedPlayer.battingStrikeRate > 0) {
      battingPoints =
        calculatedPlayer.battingStrikeRate / 5 +
        calculatedPlayer.battingAverage * 0.8;
    }

    // Bowling component: (500 / Bowling Strike Rate) + (140 / Economy Rate)
    // Only include bowling strike rate component if player has taken wickets
    if (
      player.wickets &&
      player.wickets > 0 &&
      calculatedPlayer.bowlingStrikeRate !== null &&
      calculatedPlayer.bowlingStrikeRate > 0
    ) {
      bowlingPoints += 500 / calculatedPlayer.bowlingStrikeRate;
    }

    // Always include economy rate component if economy rate is > 0
    if (calculatedPlayer.economyRate > 0) {
      bowlingPoints += 140 / calculatedPlayer.economyRate;
    }

    calculatedPlayer.points = battingPoints + bowlingPoints;

    // Calculate Player Value: (9 × Points + 100) × 1000, rounded to nearest 50,000
    if (calculatedPlayer.points > 0) {
      const rawValue = (9 * calculatedPlayer.points + 100) * 1000;
      calculatedPlayer.value = Math.round(rawValue / 50000) * 50000;
    } else {
      calculatedPlayer.value = 100000; // Default value
    }

    return calculatedPlayer;
  };

  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/players");

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();
        // Ensure all players have required properties and calculate derived statistics
        const cleanedPlayers = data.players.map((player: Player) => {
          const basePlayer = {
            ...player,
            battingStrikeRate: player.battingStrikeRate || 0,
            battingAverage: player.battingAverage || 0,
            economyRate: player.economyRate || 0,
            bowlingStrikeRate: player.bowlingStrikeRate || 0,
            price: player.price || 0,
            inningsPlayed: player.inningsPlayed || 0,
            wickets: player.wickets || 0,
            oversBowled: player.oversBowled || 0,
            runsConceded: player.runsConceded || 0,
            ballsFaced: player.ballsFaced || 0,
            totalRuns: player.totalRuns || 0,
            points: player.points || 0,
            value: player.value || 0,
          };

          // Calculate statistics based on raw data
          return calculateStats(basePlayer);
        });
        const calculatedPlayers = cleanedPlayers.map(calculateStats);
        setPlayers(calculatedPlayers);
        setFilteredPlayers(calculatedPlayers); // Initialize filtered players with all players
      } catch (error) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Filter and sort players when criteria changes
  useEffect(() => {
    let filtered = [...players];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (player) => player.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchText) {
      const query = searchText.toLowerCase();
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(query) ||
          player.university.toLowerCase().includes(query)
      );
    }

    // Sort players
    filtered.sort((a, b) => {
      let valueA: string | number | boolean | null =
        a[sortField as keyof Player];
      let valueB: string | number | boolean | null =
        b[sortField as keyof Player];

      // Handle null values
      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return sortDirection === "asc" ? -1 : 1;
      if (valueB === null) return sortDirection === "asc" ? 1 : -1;

      // Handle boolean values
      if (typeof valueA === "boolean" && typeof valueB === "boolean") {
        return sortDirection === "asc"
          ? (valueA ? 1 : 0) - (valueB ? 1 : 0)
          : (valueB ? 1 : 0) - (valueA ? 1 : 0);
      }

      // Handle string comparisons
      if (typeof valueA === "string" && typeof valueB === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredPlayers(filtered);
  }, [players, selectedCategory, searchText, sortField, sortDirection]);

  // Toggle sort direction
  const handleSort = (field: string) => {
    // If clicking on the same field, toggle sort direction
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If clicking on a new field, set it and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }

    // Also update display field for UI
    setDisplaySortField(field);
  };

  // Update the sort indicator to account for price/value relationship
  const getSortIndicator = (field: string) => {
    // For price and value, show the indicator on both when either is selected
    if (field === "price" && sortField === "value") {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }
    if (
      field === "value" &&
      sortField === "value" &&
      displaySortField === "price"
    ) {
      return sortDirection === "asc" ? " ↑" : " ↓";
    }

    // Normal behavior for other fields
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  // Safe number formatter
  const formatNumber = (value: number | null | undefined, decimals = 0) => {
    if (value === undefined || value === null) return "0";

    if (decimals > 0) {
      return value.toFixed(decimals);
    }

    return value.toLocaleString() || "0";
  };

  // Prepare data for charts with custom colors
  const categoryColors: Record<string, string> = {
    Batsman: "#0088FE",
    Bowler: "#00C49F",
    "All-Rounder": "#8884d8", // Purple color for All-Rounders
  };

  const categoryDistribution = players.reduce(
    (
      acc: Array<{ name: string; value: number; label: string; fill: string }>,
      player
    ) => {
      const existingCategory = acc.find(
        (item) => item.name === player.category
      );
      if (existingCategory) {
        existingCategory.value++;
        existingCategory.label = `${existingCategory.name} (${existingCategory.value})`;
      } else {
        acc.push({
          name: player.category,
          value: 1,
          label: `${player.category} (1)`,
          fill: categoryColors[player.category] || "#FFBB28", // Default fallback color
        });
      }
      return acc;
    },
    []
  );

  // Calculate performance metrics by category
  const performanceByCategory = players.reduce(
    (
      acc: Record<
        string,
        { name: string; batting: number; bowling: number; count: number }
      >,
      player
    ) => {
      const category = player.category;
      if (!acc[category]) {
        acc[category] = {
          name: category,
          batting: 0,
          bowling: 0,
          count: 0,
        };
      }

      // Batting metrics
      if (player.battingAverage > 0) {
        acc[category].batting += player.battingAverage;
      }

      // Bowling metrics
      if (player.economyRate > 0) {
        acc[category].bowling += player.economyRate;
      }

      acc[category].count++;
      return acc;
    },
    {}
  );

  const performanceData = Object.values(performanceByCategory).map(
    (metric: {
      name: string;
      batting: number;
      bowling: number;
      count: number;
    }) => ({
      name: metric.name,
      "Batting Average":
        metric.count > 0 ? Math.round(metric.batting / metric.count) : 0,
      "Economy Rate":
        metric.count > 0
          ? Number((metric.bowling / metric.count).toFixed(2))
          : 0,
    })
  );

  // Calculate correct statistics
  const calcStatistics = () => {
    if (!players || players.length === 0) return null;

    // Find highest run scorer from all players
    const highestRunScorer = players.reduce(
      (max, p) => ((p.totalRuns || 0) > (max.totalRuns || 0) ? p : max),
      players[0]
    );

    // Find highest wicket taker from all players
    const highestWicketTaker = players.reduce(
      (max, p) => ((p.wickets || 0) > (max.wickets || 0) ? p : max),
      players[0]
    );

    // Find most valuable player by value (not price) from all players
    const mostValuablePlayer = players.reduce(
      (max, p) => ((p.value || 0) > (max.value || 0) ? p : max),
      players[0]
    );

    // Calculate average price correctly
    // First ensure all players have a numeric price
    const playersWithPrice = players.map((p) => ({
      ...p,
      price: typeof p.price === "string" ? parseFloat(p.price) : p.price || 0,
    }));

    // Use the value field if price is not available
    const validPlayers = playersWithPrice.map((p) => ({
      ...p,
      price: p.price > 0 ? p.price : p.value || 0,
    }));

    // Calculate the average of all non-zero values
    const nonZeroPlayers = validPlayers.filter((p) => p.price > 0);
    const avgPrice =
      nonZeroPlayers.length > 0
        ? nonZeroPlayers.reduce((sum, p) => sum + p.price, 0) /
          nonZeroPlayers.length
        : 0;

    return {
      highestRunScorer,
      highestWicketTaker,
      mostValuablePlayer,
      avgPrice,
    };
  };

  const stats = calcStatistics();

  // Also update the sortPlayers function if it exists
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const sortPlayers = (players: Player[], field: string, direction: string) => {
    // Always treat price sorting as value sorting
    const effectiveField = field === "price" ? "value" : field;

    return [...players].sort((a, b) => {
      let valueA = a[effectiveField as keyof Player];
      let valueB = b[effectiveField as keyof Player];

      // Handle undefined, null, or NaN values
      if (
        valueA === undefined ||
        valueA === null ||
        (typeof valueA === "number" && isNaN(valueA))
      )
        valueA = 0;
      if (
        valueB === undefined ||
        valueB === null ||
        (typeof valueB === "number" && isNaN(valueB))
      )
        valueB = 0;

      // Convert to numbers for numeric fields
      if (typeof valueA === "string" && !isNaN(Number(valueA)))
        valueA = Number(valueA);
      if (typeof valueB === "string" && !isNaN(Number(valueB)))
        valueB = Number(valueB);

      if (direction === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  };

  // Update the TableCell that displays the Value column to also show the price if available
  // Find the part of the code where player values are displayed

  // Also add a custom renderer for the "Value" cell
  const formatValueCell = (player: Player) => {
    // Format value as currency
    return `Rs ${player.value?.toLocaleString() || 0}`;
  };

  // Update the handleSortFieldChange function
  const handleSortFieldChange = (value: string) => {
    setDisplaySortField(value);

    if (value === "price") {
      // When user selects Price, actually sort by value field
      setSortField("value");
    } else {
      setSortField(value);
    }
    setSortDirection("asc"); // Reset direction when changing fields
  };

  // Add a proper getFilteredAndSortedPlayers function that uses our sortPlayers function
  const getFilteredAndSortedPlayers = () => {
    // Just return the already filtered and sorted players
    return filteredPlayers;
  };

  // Use this function to get the filtered and sorted players
  const filteredAndSortedPlayers = getFilteredAndSortedPlayers();

  const openPlayerDetail = (player: Player) => {
    setSelectedDetailPlayer(player);
    setShowPlayerDetail(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Player Statistics
          </h1>
          <p className="text-gray-600">
            Detailed player statistics and analysis
          </p>
        </div>
        <Link href="/admin/dashboard">
          <Button variant="outline" className="mt-4 md:mt-0">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {!loading && players.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Batting</CardTitle>
              <CardDescription>Key batting statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Highest Run Scorer
                  </span>
                  <span className="font-medium">
                    {stats?.highestRunScorer?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Highest Total Runs
                  </span>
                  <span className="font-medium">
                    {stats?.highestRunScorer?.totalRuns || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Best Strike Rate
                  </span>
                  <span className="font-medium">
                    {formatNumber(
                      players.reduce(
                        (max, p) =>
                          (p.battingStrikeRate || 0) >
                          (max.battingStrikeRate || 0)
                            ? p
                            : max,
                        players[0]
                      )?.battingStrikeRate,
                      2
                    ) || "0"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bowling</CardTitle>
              <CardDescription>Key bowling metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Highest Wicket Taker
                  </span>
                  <span className="font-medium">
                    {stats?.highestWicketTaker?.name || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Most Wickets</span>
                  <span className="font-medium">
                    {stats?.highestWicketTaker?.wickets || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Best Economy Rate
                  </span>
                  <span className="font-medium">
                    {formatNumber(
                      players
                        .filter((p) => (p.economyRate || 0) > 0)
                        .reduce(
                          (min, p) =>
                            (p.economyRate || 999) < (min.economyRate || 999)
                              ? p
                              : min,
                          players.find((p) => (p.economyRate || 0) > 0) ||
                            players[0]
                        )?.economyRate,
                      2
                    ) || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall</CardTitle>
              <CardDescription>General statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Players</span>
                  <span className="font-medium">{players.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Price</span>
                  <span className="font-medium">
                    Rs {formatNumber(stats?.avgPrice, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Most Valuable Player
                  </span>
                  <span className="font-medium">
                    {stats?.mostValuablePlayer?.name || "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Updated Charts Section */}
      {!loading && players.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Player Categories</CardTitle>
              <CardDescription>Distribution of player roles</CardDescription>
            </CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={true}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.fill || categoryColors[entry.name] || "#FFBB28"
                        }
                        className="stroke-background hover:opacity-80"
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
              <CardDescription>
                Average batting and bowling metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={performanceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Bar
                    dataKey="Batting Average"
                    fill={categoryColors["Batsman"]}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Economy Rate"
                    fill={categoryColors["Bowler"]}
                    radius={[4, 4, 0, 0]}
                  />
                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    wrapperStyle={{
                      background: "white",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "5px",
                      zIndex: 1000,
                      pointerEvents: "auto",
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-md">
                            <p className="text-sm font-bold uppercase">
                              {payload[0].payload.name}
                            </p>
                            <div className="grid gap-1 mt-2">
                              {payload.map((entry, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between items-center gap-8"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  ></div>
                                  <span className="text-sm text-muted-foreground">
                                    {entry.name}:
                                  </span>
                                  <span className="text-sm font-bold">
                                    {entry.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Statistics Controls</CardTitle>
          <CardDescription>Filter and sort player statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">
                Search
              </label>
              <Input
                placeholder="Search by name or university"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="shadow-sm border-muted-foreground/20 focus:border-primary/30 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-muted-foreground">
                Filter by Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="shadow-sm border-muted-foreground/20 focus:border-primary/30 transition-colors">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Batsman">Batsmen</SelectItem>
                  <SelectItem value="Bowler">Bowlers</SelectItem>
                  <SelectItem value="All-Rounder">All-Rounders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm font-medium block text-muted-foreground">
                Sort By
              </label>
              <Select
                value={displaySortField}
                onValueChange={handleSortFieldChange}
              >
                <SelectTrigger className="w-[180px] shadow-sm border-muted-foreground/20 focus:border-primary/30 transition-colors">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="totalRuns">Total Runs</SelectItem>
                  <SelectItem value="wickets">Wickets</SelectItem>
                  <SelectItem value="battingStrikeRate">
                    Batting Strike Rate
                  </SelectItem>
                  <SelectItem value="battingAverage">
                    Batting Average
                  </SelectItem>
                  <SelectItem value="economyRate">Economy Rate</SelectItem>
                  <SelectItem value="value">Value</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                className="shadow-sm hover:bg-accent/20 transition-colors"
              >
                {sortDirection === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-8 w-full mb-6" />
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <Card>
            <CardContent className="p-0 overflow-auto">
              <div
                className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-b from-indigo-500/10 to-transparent 
                flex items-center justify-center text-muted-foreground text-sm rounded-t-md"
              >
                <span className="flex items-center gap-1.5">
                  <span className="animate-pulse">→</span>
                  Scroll to see more columns
                </span>
              </div>
              <div className="p-2 bg-muted/30 border-b text-sm text-center text-muted-foreground rounded-md shadow-sm md:hidden">
                <span className="flex items-center justify-center gap-1.5">
                  <span className="animate-pulse">←→</span>
                  Swipe left or right to see all columns
                </span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer w-[180px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      <span className="flex items-center gap-2">
                        Name {getSortIndicator("name")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer w-[200px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("university")}
                    >
                      <span className="flex items-center gap-2">
                        University {getSortIndicator("university")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer w-[120px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("category")}
                    >
                      <span className="flex items-center gap-2">
                        Category {getSortIndicator("category")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[80px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("inningsPlayed")}
                    >
                      <span className="flex items-center gap-2">
                        Innings {getSortIndicator("inningsPlayed")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[80px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("totalRuns")}
                    >
                      <span className="flex items-center gap-2">
                        Runs {getSortIndicator("totalRuns")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[80px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("wickets")}
                    >
                      <span className="flex items-center gap-2">
                        Wickets {getSortIndicator("wickets")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[80px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("oversBowled")}
                    >
                      <span className="flex items-center gap-2">
                        Overs {getSortIndicator("oversBowled")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[120px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("runsConceded")}
                    >
                      <span className="flex items-center gap-2">
                        Runs Conceded {getSortIndicator("runsConceded")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[150px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("battingStrikeRate")}
                    >
                      <span className="flex items-center gap-2">
                        Batting Strike Rate{" "}
                        {getSortIndicator("battingStrikeRate")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[150px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("battingAverage")}
                    >
                      <span className="flex items-center gap-2">
                        Batting Average {getSortIndicator("battingAverage")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[150px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("bowlingStrikeRate")}
                    >
                      <span className="flex items-center gap-2">
                        Bowling Strike Rate{" "}
                        {getSortIndicator("bowlingStrikeRate")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[120px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("economyRate")}
                    >
                      <span className="flex items-center gap-2">
                        Economy Rate {getSortIndicator("economyRate")}
                      </span>
                    </TableHead>
                    <TableHead
                      className="text-right cursor-pointer w-[150px] sticky top-0 hover:bg-accent/10 transition-colors"
                      onClick={() => handleSort("value")}
                    >
                      <span className="flex items-center gap-2">
                        Value {getSortIndicator("value")}
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedPlayers.length > 0 ? (
                    filteredAndSortedPlayers.map((player) => (
                      <TableRow
                        key={player._id}
                        onClick={() => openPlayerDetail(player)}
                        className="cursor-pointer hover:bg-accent/20 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {player.name}
                        </TableCell>
                        <TableCell>{player.university}</TableCell>
                        <TableCell>
                          <Badge
                            className={`px-3 py-1 font-medium rounded-md shadow-sm ${getCategoryStyles(
                              player.category
                            )}`}
                          >
                            {player.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {player.inningsPlayed || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {player.totalRuns || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {player.wickets || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(player.oversBowled, 1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {player.runsConceded || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(player.battingStrikeRate, 2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(player.battingAverage, 2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {player.wickets > 0
                            ? formatNumber(player.bowlingStrikeRate, 2)
                            : "Undefined"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(player.economyRate, 2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatValueCell(player)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={15}
                        className="text-center py-8 text-gray-500"
                      >
                        No players found matching the criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Player Detail Dialog */}
      <Dialog open={showPlayerDetail} onOpenChange={setShowPlayerDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              {selectedDetailPlayer?.name}
              <Badge
                className={`ml-3 px-3 py-1 font-medium rounded-md shadow-sm ${getCategoryStyles(
                  selectedDetailPlayer?.category || ""
                )}`}
              >
                {selectedDetailPlayer?.category}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedDetailPlayer?.university}
            </DialogDescription>
          </DialogHeader>

          {selectedDetailPlayer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Batting Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Total Runs
                    </span>
                    <span className="font-semibold">
                      {selectedDetailPlayer.totalRuns}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Innings Played
                    </span>
                    <span className="font-semibold">
                      {selectedDetailPlayer.inningsPlayed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Balls Faced
                    </span>
                    <span className="font-semibold">
                      {selectedDetailPlayer.ballsFaced}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Batting Strike Rate
                    </span>
                    <span className="font-semibold">
                      {formatNumber(selectedDetailPlayer.battingStrikeRate, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Batting Average
                    </span>
                    <span className="font-semibold">
                      {formatNumber(selectedDetailPlayer.battingAverage, 2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bowling Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Wickets
                    </span>
                    <span className="font-semibold">
                      {selectedDetailPlayer.wickets}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Overs Bowled
                    </span>
                    <span className="font-semibold">
                      {formatNumber(selectedDetailPlayer.oversBowled, 1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Runs Conceded
                    </span>
                    <span className="font-semibold">
                      {selectedDetailPlayer.runsConceded}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Economy Rate
                    </span>
                    <span className="font-semibold">
                      {formatNumber(selectedDetailPlayer.economyRate, 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Bowling Strike Rate
                    </span>
                    <span className="font-semibold">
                      {selectedDetailPlayer.wickets > 0
                        ? formatNumber(
                            selectedDetailPlayer.bowlingStrikeRate,
                            2
                          )
                        : "Undefined"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Value Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                      <div className="text-sm text-muted-foreground mb-2">
                        Player Points
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        {formatNumber(selectedDetailPlayer.points, 1)}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Points are calculated based on performance metrics:{" "}
                        <br />
                        • Batting: (Strike Rate / 5) + (Average × 0.8) <br />•
                        Bowling: (500 / Strike Rate) + (140 / Economy Rate)
                      </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-lg border border-primary/10">
                      <div className="text-sm text-muted-foreground mb-2">
                        Player Value
                      </div>
                      <div className="text-3xl font-bold text-primary">
                        $
                        {formatValueCell(selectedDetailPlayer).replace("$", "")}
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        Value is calculated using the formula: <br />
                        (9 × Points + 100) × 1000 <br />
                        Rounded to nearest 50,000
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
