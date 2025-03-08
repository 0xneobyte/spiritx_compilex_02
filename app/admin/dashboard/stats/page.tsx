"use client";

import { useState, useEffect } from "react";
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
  price: number;
  isFromOriginalDataset: boolean;
}

export default function PlayerStats() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
        setPlayers(data.players);
        setFilteredPlayers(data.players);
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(query) ||
          player.university.toLowerCase().includes(query)
      );
    }

    // Sort players
    filtered.sort((a, b) => {
      let valueA: any = a[sortField as keyof Player];
      let valueB: any = b[sortField as keyof Player];

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
  }, [players, selectedCategory, searchQuery, sortField, sortDirection]);

  // Toggle sort direction
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Generate sort indicator
  const getSortIndicator = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? " ↑" : " ↓";
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

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Statistics Controls</CardTitle>
          <CardDescription>Filter and sort player statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search by name or university"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Filter by Category
              </label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
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
            <div>
              <label className="text-sm font-medium mb-1 block">Sort By</label>
              <Select
                value={sortField}
                onValueChange={(value) => {
                  setSortField(value);
                  setSortDirection("desc");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select field to sort by" />
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
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
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
        <Card>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name {getSortIndicator("name")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("university")}
                  >
                    University {getSortIndicator("university")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("category")}
                  >
                    Category {getSortIndicator("category")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("totalRuns")}
                  >
                    Runs {getSortIndicator("totalRuns")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("wickets")}
                  >
                    Wickets {getSortIndicator("wickets")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("battingStrikeRate")}
                  >
                    Strike Rate {getSortIndicator("battingStrikeRate")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("battingAverage")}
                  >
                    Batting Avg {getSortIndicator("battingAverage")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("economyRate")}
                  >
                    Economy {getSortIndicator("economyRate")}
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    Price {getSortIndicator("price")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                    <TableRow key={player._id}>
                      <TableCell className="font-medium">
                        {player.name}
                        {player.isFromOriginalDataset && (
                          <Badge variant="outline" className="ml-2 bg-blue-50">
                            DS
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{player.university}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            player.category === "Batsman"
                              ? "bg-blue-500"
                              : player.category === "Bowler"
                              ? "bg-green-500"
                              : "bg-purple-500"
                          }
                        >
                          {player.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {player.totalRuns}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.wickets}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.battingStrikeRate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.battingAverage.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {player.economyRate.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${player.price.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
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
      )}

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Statistical Insights</CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {!loading && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Batting</h3>
                    <div className="bg-blue-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Highest Run Scorer
                        </span>
                        <span className="font-medium">
                          {players.reduce(
                            (max, p) => (p.totalRuns > max.totalRuns ? p : max),
                            players[0]
                          )?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Highest Total Runs
                        </span>
                        <span className="font-medium">
                          {players.reduce(
                            (max, p) => (p.totalRuns > max.totalRuns ? p : max),
                            players[0]
                          )?.totalRuns || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Best Strike Rate
                        </span>
                        <span className="font-medium">
                          {players
                            .reduce(
                              (max, p) =>
                                p.battingStrikeRate > max.battingStrikeRate
                                  ? p
                                  : max,
                              players[0]
                            )
                            ?.battingStrikeRate.toFixed(2) || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Bowling</h3>
                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Highest Wicket Taker
                        </span>
                        <span className="font-medium">
                          {players.reduce(
                            (max, p) => (p.wickets > max.wickets ? p : max),
                            players[0]
                          )?.name || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Most Wickets
                        </span>
                        <span className="font-medium">
                          {players.reduce(
                            (max, p) => (p.wickets > max.wickets ? p : max),
                            players[0]
                          )?.wickets || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Best Economy Rate
                        </span>
                        <span className="font-medium">
                          {players
                            .filter((p) => p.economyRate > 0)
                            .reduce(
                              (min, p) =>
                                p.economyRate < min.economyRate ? p : min,
                              players.find((p) => p.economyRate > 0) ||
                                players[0]
                            )
                            ?.economyRate.toFixed(2) || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Overall</h3>
                    <div className="bg-purple-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Total Players
                        </span>
                        <span className="font-medium">{players.length}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Avg. Price
                        </span>
                        <span className="font-medium">
                          $
                          {Math.round(
                            players.reduce((sum, p) => sum + p.price, 0) /
                              (players.length || 1)
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Most Valuable Player
                        </span>
                        <span className="font-medium">
                          {players.reduce(
                            (max, p) => (p.price > max.price ? p : max),
                            players[0]
                          )?.name || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
