"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  bowlingStrikeRate: number;
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

  // Format number safely
  const formatNumber = (value: number | undefined, decimals = 0) => {
    if (value === undefined || value === null) return "0";

    if (decimals > 0) {
      return value.toFixed(decimals);
    }

    return value.toLocaleString() || "0";
  };

  // Add a function to calculate cricket statistics
  const calculateStats = (player: any) => {
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
      calculatedPlayer.bowlingStrikeRate = ballsBowled > 0 ? 999 : 0; // High value if bowled but no wickets
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
      battingPoints = (calculatedPlayer.battingStrikeRate / 5) + 
                       (calculatedPlayer.battingAverage * 0.8);
    }
    
    // Bowling component: (500 / Bowling Strike Rate) + (140 / Economy Rate)
    if (calculatedPlayer.bowlingStrikeRate > 0 && calculatedPlayer.economyRate > 0) {
      bowlingPoints = (500 / calculatedPlayer.bowlingStrikeRate) + 
                      (140 / calculatedPlayer.economyRate);
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
        const cleanedPlayers = data.players.map((player: any) => {
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

  // Handle adding a new player
  const handleAddPlayer = async () => {
    try {
      // Calculate derived statistics
      const playerWithStats = calculateStats(newPlayer);

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
    } catch (error: any) {
      console.error("Error adding player:", error);
      toast.error(error.message || "Failed to add player");
    }
  };

  // Handle updating a player
  const handleUpdatePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      // Calculate derived statistics
      const playerWithStats = calculateStats(selectedPlayer);

      const response = await fetch(`/api/admin/players/${selectedPlayer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerWithStats),
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
      toast.success("Player updated successfully");
    } catch (error: any) {
      console.error("Error updating player:", error);
      toast.error(error.message || "Failed to update player");
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
    } catch (error: any) {
      console.error("Error deleting player:", error);
      toast.error(error.message || "Failed to delete player");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Players Management
          </h1>
          <p className="text-gray-600">View, add, edit, or delete players</p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            Add New Player
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
                className={
                  player.isFromOriginalDataset
                    ? "border-blue-200"
                    : "border-green-200"
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardDescription>
                      {player.university}
                      {player.isFromOriginalDataset && (
                        <Badge variant="outline" className="ml-2 bg-blue-50">
                          Original Dataset
                        </Badge>
                      )}
                    </CardDescription>
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
                  </div>
                  <CardTitle className="text-xl">{player.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="font-medium">Innings:</span>{" "}
                      {player.inningsPlayed || 0}
                    </div>
                    <div>
                      <span className="font-medium">Runs:</span>{" "}
                      {player.totalRuns || 0}
                    </div>
                    <div>
                      <span className="font-medium">Wickets:</span>{" "}
                      {player.wickets || 0}
                    </div>
                    <div>
                      <span className="font-medium">Strike Rate:</span>{" "}
                      {formatNumber(player.battingStrikeRate, 2)}
                    </div>
                    <div>
                      <span className="font-medium">Economy:</span>{" "}
                      {formatNumber(player.economyRate, 2)}
                    </div>
                    <div>
                      <span className="font-medium">Overs:</span>{" "}
                      {formatNumber(player.oversBowled, 1)}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Runs Conceded:</span>{" "}
                      {player.runsConceded || 0}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Price:</span> $
                      {(player.price || 0).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedPlayer(player);
                      setIsEditDialogOpen(true);
                    }}
                    disabled={player.isFromOriginalDataset}
                  >
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={player.isFromOriginalDataset}
                      >
                        Delete
                      </Button>
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

      {/* Add Player Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new player to the database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="name">Player Name</Label>
              <Input
                id="name"
                value={newPlayer.name}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, name: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="university">University</Label>
              <Input
                id="university"
                value={newPlayer.university}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, university: e.target.value })
                }
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="category">Category</Label>
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
            </div>
            <div>
              <Label htmlFor="inningsPlayed">Innings Played</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="totalRuns">Total Runs</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="ballsFaced">Balls Faced</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="wickets">Wickets</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="oversBowled">Overs Bowled</Label>
              <Input
                id="oversBowled"
                type="number"
                step="0.1"
                value={newPlayer.oversBowled}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    oversBowled: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="runsConceded">Runs Conceded</Label>
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
              />
            </div>
            <div>
              <Label htmlFor="economyRate">Economy Rate</Label>
              <Input
                id="economyRate"
                type="number"
                step="0.01"
                value={newPlayer.economyRate}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    economyRate: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="10000"
                value={newPlayer.price}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, price: Number(e.target.value) })
                }
              />
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>Update player details.</DialogDescription>
          </DialogHeader>
          {selectedPlayer && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Player Name</Label>
                <Input
                  id="edit-name"
                  value={selectedPlayer.name}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-university">University</Label>
                <Input
                  id="edit-university"
                  value={selectedPlayer.university}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      university: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-category">Category</Label>
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
              </div>
              <div>
                <Label htmlFor="edit-inningsPlayed">Innings Played</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="edit-totalRuns">Total Runs</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="edit-ballsFaced">Balls Faced</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="edit-wickets">Wickets</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="edit-oversBowled">Overs Bowled</Label>
                <Input
                  id="edit-oversBowled"
                  type="number"
                  step="0.1"
                  value={selectedPlayer.oversBowled}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      oversBowled: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-runsConceded">Runs Conceded</Label>
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
                />
              </div>
              <div>
                <Label htmlFor="edit-economyRate">Economy Rate</Label>
                <Input
                  id="edit-economyRate"
                  type="number"
                  step="0.01"
                  value={selectedPlayer.economyRate}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      economyRate: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="10000"
                  value={selectedPlayer.price}
                  onChange={(e) =>
                    setSelectedPlayer({
                      ...selectedPlayer,
                      price: Number(e.target.value),
                    })
                  }
                />
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
