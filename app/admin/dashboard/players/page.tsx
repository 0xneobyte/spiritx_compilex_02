"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";

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

export default function PlayersManagement() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCategory, setCurrentCategory] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    university: "",
    category: "Batsman",
    totalRuns: 0,
    ballsFaced: 0,
    battingStrikeRate: 0,
    battingAverage: 0,
    inningsPlayed: 0,
    wickets: 0,
    economyRate: 0,
    oversBowled: 0,
    runsConceded: 0,
    bowlingStrikeRate: 0,
    points: 0,
    value: 0,
    price: 100000,
  });
  const [isPointsInfoOpen, setIsPointsInfoOpen] = useState(false);

  // Format number safely
  const formatNumber = (value: number | undefined, decimals = 0) => {
    if (value === undefined || value === null) return "0";

    if (decimals > 0) {
      return value.toFixed(decimals);
    }

    return value.toLocaleString() || "0";
  };

  // Add a function to calculate cricket statistics
  const calculateStats = (player: Player) => {
    const calculatedPlayer = { ...player };

    // Calculate Batting Strike Rate: (Total Runs / Balls Faced) × 100
    if (player.ballsFaced && player.ballsFaced > 0) {
      calculatedPlayer.battingStrikeRate =
        (player.totalRuns / player.ballsFaced) * 100;
    }

    // Calculate Batting Average: Total Runs / Innings Played
    if (player.inningsPlayed && player.inningsPlayed > 0) {
      calculatedPlayer.battingAverage = player.totalRuns / player.inningsPlayed;
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

    // Bowling component:
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

    // Set price to value
    calculatedPlayer.price = calculatedPlayer.value;

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
            price: player.price || 0,
            totalRuns: player.totalRuns || 0,
            wickets: player.wickets || 0,
            inningsPlayed: player.inningsPlayed || 0,
            oversBowled: player.oversBowled || 0,
            runsConceded: player.runsConceded || 0,
            ballsFaced: player.ballsFaced || 0,
          };

          // Calculate statistics
          return calculateStats(basePlayer);
        });

        setPlayers(cleanedPlayers);
        setFilteredPlayers(cleanedPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
        toast.error("Failed to load players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Filter players when category or search changes
  useEffect(() => {
    let filtered = [...players];

    // Apply category filter
    if (currentCategory !== "all") {
      filtered = filtered.filter(
        (player) => player.category === currentCategory
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(query) ||
          player.university.toLowerCase().includes(query)
      );
    }

    setFilteredPlayers(filtered);
  }, [players, currentCategory, searchQuery]);

  // Form validation function
  const validatePlayerForm = (player: Partial<Player>) => {
    const errors: Record<string, string> = {};

    if (!player.name || player.name.trim() === "") {
      errors.name = "Name is required";
    }

    if (!player.university || player.university.trim() === "") {
      errors.university = "University is required";
    }

    if (!player.category) {
      errors.category = "Category is required";
    }

    if (player.inningsPlayed === undefined || player.inningsPlayed < 0) {
      errors.inningsPlayed = "Valid innings played value is required";
    }

    if (player.totalRuns === undefined || player.totalRuns < 0) {
      errors.totalRuns = "Valid total runs value is required";
    }

    if (player.ballsFaced === undefined || player.ballsFaced < 0) {
      errors.ballsFaced = "Valid balls faced value is required";
    }

    // Return null if no errors, otherwise return the errors object
    return Object.keys(errors).length > 0 ? errors : null;
  };

  // Handle adding a new player
  const handleAddPlayer = async () => {
    try {
      // Validate form data
      const errors = validatePlayerForm(newPlayer);
      if (errors) {
        // Display first error
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }

      // Calculate derived statistics
      const playerWithStats = calculateStats(newPlayer as Player);

      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerWithStats),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add player");
      }

      const data = await response.json();
      setPlayers([...players, data.player]);
      setIsAddDialogOpen(false);
      toast.success("Player added successfully");

      // Reset form
      setNewPlayer({
        name: "",
        university: "",
        category: "Batsman",
        totalRuns: 0,
        ballsFaced: 0,
        battingStrikeRate: 0,
        battingAverage: 0,
        inningsPlayed: 0,
        wickets: 0,
        economyRate: 0,
        oversBowled: 0,
        runsConceded: 0,
        bowlingStrikeRate: 0,
        points: 0,
        value: 0,
        price: 100000,
      });
    } catch (error: unknown) {
      console.error("Error adding player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to add player"
      );
    }
  };

  // Handle updating a player
  const handleUpdatePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      // Validate form data
      const errors = validatePlayerForm(selectedPlayer);
      if (errors) {
        // Display first error
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }

      // Calculate derived statistics
      const playerWithStats = calculateStats(selectedPlayer);

      // Preserve the isFromOriginalDataset flag
      const playerToUpdate = {
        ...playerWithStats,
        isFromOriginalDataset: selectedPlayer.isFromOriginalDataset,
      };

      const response = await fetch(`/api/admin/players/${selectedPlayer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerToUpdate),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update player");
      }

      const data = await response.json();

      // Update players list
      setPlayers(
        players.map((p) => (p._id === selectedPlayer._id ? data.player : p))
      );
      setIsEditDialogOpen(false);
      toast.success("Player's stats updated successfully!");
    } catch (error: unknown) {
      console.error("Error updating player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update player"
      );
    }
  };

  // Handle deleting a player
  const handleDeletePlayer = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/players/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete player");
      }

      // Update players list
      setPlayers(players.filter((p) => p._id !== id));
      toast.success("Player deleted successfully");
    } catch (error: unknown) {
      console.error("Error deleting player:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete player"
      );
    }
  };

  // Add this function to handle category styles
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

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Player Management
          </h1>
          <p className="text-gray-600">
            Add, update, and delete players in the system
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <Button
            onClick={() => setIsPointsInfoOpen(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <InfoIcon className="size-4" />
            <span>Points & Value Info</span>
          </Button>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <span>Add New Player</span>
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <Tabs
            defaultValue="all"
            className="md:w-auto"
            onValueChange={setCurrentCategory}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="Batsman">Batsmen</TabsTrigger>
              <TabsTrigger value="Bowler">Bowlers</TabsTrigger>
              <TabsTrigger value="All-Rounder">All-Rounders</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-6 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <Card
                key={player._id}
                className="overflow-hidden transition-all hover:shadow-md"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        {player.university}
                      </div>
                      <CardTitle className="mt-1">{player.name}</CardTitle>
                    </div>
                    <Badge className={getCategoryStyles(player.category)}>
                      {player.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-sm font-medium">
                        Innings: {player.inningsPlayed}
                      </div>
                      <div className="text-sm font-medium">
                        Wickets: {player.wickets}
                      </div>
                      <div className="text-sm font-medium">
                        Economy: {formatNumber(player.economyRate, 2)}
                      </div>
                      <div className="text-sm font-medium">
                        Runs Conceded: {player.runsConceded}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        Runs: {player.totalRuns}
                      </div>
                      <div className="text-sm font-medium">
                        Strike Rate: {formatNumber(player.battingStrikeRate, 2)}
                      </div>
                      <div className="text-sm font-medium">
                        Overs: {formatNumber(player.oversBowled, 1)}
                      </div>
                      <div className="text-sm font-medium">
                        Price: Rs {formatNumber(player.price)}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete {player.name} from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePlayer(player._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-gray-500">No players found</p>
            </div>
          )}
        </div>
      )}

      {/* Points and Value Calculation Information Dialog */}
      <Dialog open={isPointsInfoOpen} onOpenChange={setIsPointsInfoOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Points & Value Calculation</DialogTitle>
            <DialogDescription>
              How player points and value are dynamically calculated
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Player Points</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                  <p className="font-medium">Batting Component</p>
                  <code className="block mt-2 p-2 bg-background rounded border">
                    (Batting Strike Rate / 5) + (Batting Average × 0.8)
                  </code>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This rewards both scoring efficiency (strike rate) and
                    consistency (batting average).
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                  <p className="font-medium">Bowling Component</p>
                  <code className="block mt-2 p-2 bg-background rounded border">
                    (500 / Bowling Strike Rate) + (140 / Economy Rate)
                  </code>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This rewards both wicket-taking ability (bowling strike
                    rate) and run containment (economy rate).
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                  <p className="font-medium">Total Points</p>
                  <code className="block mt-2 p-2 bg-background rounded border">
                    Batting Component + Bowling Component
                  </code>
                  <p className="mt-2 text-sm text-muted-foreground">
                    All-rounders benefit from both components, while specialists
                    excel in their specific domain.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Player Value</h3>
              <div className="p-4 bg-primary/5 rounded-md border border-primary/10">
                <p className="font-medium">Value Calculation</p>
                <code className="block mt-2 p-2 bg-background rounded border">
                  (9 × Points + 100) × 1000
                </code>
                <p className="mt-1 text-sm text-muted-foreground">
                  This is then rounded to the nearest 50,000 to create
                  reasonable price brackets.
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-sm">Example calculations:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>
                      10 points → (9 × 10 + 100) × 1000 = 190,000 → 200,000
                    </li>
                    <li>
                      20 points → (9 × 20 + 100) × 1000 = 280,000 → 300,000
                    </li>
                    <li>
                      50 points → (9 × 50 + 100) × 1000 = 550,000 → 550,000
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
              <p className="font-medium text-amber-800">Important Notes</p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-amber-700">
                <li>
                  All calculations are performed automatically when you add or
                  update player statistics.
                </li>
                <li>
                  Players with 0 wickets will have &quot;Undefined&quot; bowling
                  strike rate but can still earn points from economy rate.
                </li>
                <li>
                  The minimum value for any player is 100,000, regardless of
                  performance statistics.
                </li>
                <li>
                  Original dataset players cannot have their statistics
                  modified.
                </li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsPointsInfoOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Player Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new player to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Player Name *
                </Label>
                <Input
                  id="name"
                  value={newPlayer.name}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, name: e.target.value })
                  }
                  placeholder="Enter player name"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Full name of the player
                </p>
              </div>
            </div>
            <div className="col-span-2">
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium">
                  University *
                </Label>
                <Input
                  id="university"
                  value={newPlayer.university}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, university: e.target.value })
                  }
                  placeholder="Enter university name"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  University the player represents
                </p>
              </div>
            </div>
            <div className="col-span-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Category *
                </Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded-md"
                  value={newPlayer.category}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, category: e.target.value })
                  }
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Player&apos;s primary role
                </p>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <h3 className="font-medium text-sm mb-2">Batting Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="inningsPlayed"
                    className="text-sm font-medium"
                  >
                    Innings Played *
                  </Label>
                  <Input
                    id="inningsPlayed"
                    type="number"
                    value={newPlayer.inningsPlayed}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        inningsPlayed: Number(e.target.value),
                      })
                    }
                    className="w-full"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalRuns" className="text-sm font-medium">
                    Total Runs *
                  </Label>
                  <Input
                    id="totalRuns"
                    type="number"
                    value={newPlayer.totalRuns}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        totalRuns: Number(e.target.value),
                      })
                    }
                    className="w-full"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ballsFaced" className="text-sm font-medium">
                    Balls Faced *
                  </Label>
                  <Input
                    id="ballsFaced"
                    type="number"
                    value={newPlayer.ballsFaced}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        ballsFaced: Number(e.target.value),
                      })
                    }
                    className="w-full"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 mt-2">
              <h3 className="font-medium text-sm mb-2">Bowling Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wickets" className="text-sm font-medium">
                    Wickets
                  </Label>
                  <Input
                    id="wickets"
                    type="number"
                    value={newPlayer.wickets}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        wickets: Number(e.target.value),
                      })
                    }
                    className="w-full"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oversBowled" className="text-sm font-medium">
                    Overs Bowled
                  </Label>
                  <Input
                    id="oversBowled"
                    type="number"
                    value={newPlayer.oversBowled}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        oversBowled: Number(e.target.value),
                      })
                    }
                    className="w-full"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="runsConceded" className="text-sm font-medium">
                    Runs Conceded
                  </Label>
                  <Input
                    id="runsConceded"
                    type="number"
                    value={newPlayer.runsConceded}
                    onChange={(e) =>
                      setNewPlayer({
                        ...newPlayer,
                        runsConceded: Number(e.target.value),
                      })
                    }
                    className="w-full"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-2 mt-3">
              <p className="text-sm text-muted-foreground mb-2">
                Note: Fields marked with * are required. Other statistics like
                batting strike rate, batting average, economy rate, points and
                value will be calculated automatically based on these inputs.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Player Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>Update player details.</DialogDescription>
          </DialogHeader>
          {selectedPlayer && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium">
                    Player Name *
                  </Label>
                  <Input
                    id="edit-name"
                    value={selectedPlayer.name}
                    onChange={(e) =>
                      setSelectedPlayer({
                        ...selectedPlayer,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter player name"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-university"
                    className="text-sm font-medium"
                  >
                    University *
                  </Label>
                  <Input
                    id="edit-university"
                    value={selectedPlayer.university}
                    onChange={(e) =>
                      setSelectedPlayer({
                        ...selectedPlayer,
                        university: e.target.value,
                      })
                    }
                    placeholder="Enter university name"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-category"
                    className="text-sm font-medium"
                  >
                    Category *
                  </Label>
                  <select
                    id="edit-category"
                    className="w-full p-2 border rounded-md"
                    value={selectedPlayer.category}
                    onChange={(e) =>
                      setSelectedPlayer({
                        ...selectedPlayer,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Player&apos;s primary role
                  </p>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="font-medium text-sm mb-2">Batting Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-inningsPlayed"
                      className="text-sm font-medium"
                    >
                      Innings Played *
                    </Label>
                    <Input
                      id="edit-inningsPlayed"
                      type="number"
                      value={selectedPlayer.inningsPlayed}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          inningsPlayed: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-totalRuns"
                      className="text-sm font-medium"
                    >
                      Total Runs *
                    </Label>
                    <Input
                      id="edit-totalRuns"
                      type="number"
                      value={selectedPlayer.totalRuns}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          totalRuns: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-ballsFaced"
                      className="text-sm font-medium"
                    >
                      Balls Faced *
                    </Label>
                    <Input
                      id="edit-ballsFaced"
                      type="number"
                      value={selectedPlayer.ballsFaced}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          ballsFaced: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-2">
                <h3 className="font-medium text-sm mb-2">Bowling Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-wickets"
                      className="text-sm font-medium"
                    >
                      Wickets
                    </Label>
                    <Input
                      id="edit-wickets"
                      type="number"
                      value={selectedPlayer.wickets}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          wickets: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-oversBowled"
                      className="text-sm font-medium"
                    >
                      Overs Bowled
                    </Label>
                    <Input
                      id="edit-oversBowled"
                      type="number"
                      value={selectedPlayer.oversBowled}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          oversBowled: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-runsConceded"
                      className="text-sm font-medium"
                    >
                      Runs Conceded
                    </Label>
                    <Input
                      id="edit-runsConceded"
                      type="number"
                      value={selectedPlayer.runsConceded}
                      onChange={(e) =>
                        setSelectedPlayer({
                          ...selectedPlayer,
                          runsConceded: Number(e.target.value),
                        })
                      }
                      className="w-full"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 mt-3">
                <p className="text-sm text-muted-foreground mb-2">
                  Note: Fields marked with * are required. Calculated statistics
                  (batting strike rate, batting average, economy rate, points,
                  and value) will update automatically based on these inputs.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePlayer}>Update Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
