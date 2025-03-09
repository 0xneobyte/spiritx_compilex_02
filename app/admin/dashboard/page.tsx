"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  BarChart2,
  TrendingUp,
  Plus,
  RefreshCcw,
  ChevronRight,
} from "lucide-react";

// Define player type
interface PlayerData {
  name: string;
  university: string;
  category: string;
  totalRuns: number;
  ballsFaced: number;
  inningsPlayed: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  price: number;
  battingStrikeRate?: number;
  battingAverage?: number;
  economyRate?: number;
  bowlingStrikeRate?: number | null;
  points?: number;
  value?: number;
  [key: string]: string | number | boolean | null | undefined;
}

export default function AdminDashboard() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState<PlayerData>({
    name: "",
    university: "",
    category: "Batsman",
    totalRuns: 0,
    ballsFaced: 0,
    inningsPlayed: 0,
    wickets: 0,
    oversBowled: 0,
    runsConceded: 0,
    price: 100000,
  });

  const calculateStats = (player: PlayerData): PlayerData => {
    const calculatedPlayer = { ...player };

    if (player.ballsFaced && player.ballsFaced > 0) {
      calculatedPlayer.battingStrikeRate =
        (player.totalRuns / player.ballsFaced) * 100;
    }

    if (player.inningsPlayed && player.inningsPlayed > 0) {
      calculatedPlayer.battingAverage = player.totalRuns / player.inningsPlayed;
    }

    if (player.oversBowled && player.oversBowled > 0) {
      calculatedPlayer.economyRate = player.runsConceded / player.oversBowled;
    }

    if (player.wickets && player.wickets > 0) {
      calculatedPlayer.bowlingStrikeRate =
        (player.oversBowled * 6) / player.wickets;
    } else {
      calculatedPlayer.bowlingStrikeRate = null;
    }

    const battingPoints =
      calculatedPlayer.totalRuns * 1 +
      (calculatedPlayer.battingStrikeRate || 0) * 0.2;
    const bowlingPoints =
      calculatedPlayer.wickets * 25 + (player.oversBowled || 0) * 2;

    calculatedPlayer.points = Math.round(battingPoints + bowlingPoints);
    calculatedPlayer.value = Math.round(calculatedPlayer.points * 1000);

    return calculatedPlayer;
  };

  const handleAddPlayer = async () => {
    try {
      if (!newPlayer.name || newPlayer.name.trim() === "") {
        toast.error("Player name is required");
        return;
      }

      if (!newPlayer.university || newPlayer.university.trim() === "") {
        toast.error("University is required");
        return;
      }

      const playerWithStats = calculateStats(newPlayer);

      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerWithStats),
      });

      if (!response.ok) {
        throw new Error("Failed to add player");
      }

      toast.success("Player added successfully!");
      setIsAddDialogOpen(false);

      setNewPlayer({
        name: "",
        university: "",
        category: "Batsman",
        totalRuns: 0,
        ballsFaced: 0,
        inningsPlayed: 0,
        wickets: 0,
        oversBowled: 0,
        runsConceded: 0,
        price: 100000,
      });
    } catch (error) {
      console.error("Error adding player:", error);
      toast.error("Failed to add player");
    }
  };

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-slate-800 tracking-tight">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Link
          href="/admin/dashboard/players"
          className="block transition-all duration-300 h-full"
        >
          <Card className="overflow-hidden h-full border-none shadow-lg shadow-blue-100 hover:shadow-blue-200 hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-2 w-full bg-blue-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-blue-100 rounded-full p-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-700">
                  Players Management
                </CardTitle>
              </div>
              <CardDescription>Add, update, or remove players</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-gray-600 mb-3">
                Complete CRUD operations for players in the system.
              </p>
              <div className="flex items-center text-blue-600 font-medium">
                Manage Players <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/admin/dashboard/stats"
          className="block transition-all duration-300 h-full"
        >
          <Card className="overflow-hidden h-full border-none shadow-lg shadow-purple-100 hover:shadow-purple-200 hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-2 w-full bg-purple-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-purple-100 rounded-full p-2">
                  <BarChart2 className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-700">
                  Player Statistics
                </CardTitle>
              </div>
              <CardDescription>View detailed player stats</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-gray-600 mb-3">
                See comprehensive statistics for each player.
              </p>
              <div className="flex items-center text-purple-600 font-medium">
                View Statistics <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link
          href="/admin/dashboard/summary"
          className="block transition-all duration-300 h-full"
        >
          <Card className="overflow-hidden h-full border-none shadow-lg shadow-green-100 hover:shadow-green-200 hover:translate-y-[-4px] transition-all duration-300">
            <div className="h-2 w-full bg-green-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-green-100 rounded-full p-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-700">
                  Tournament Summary
                </CardTitle>
              </div>
              <CardDescription>Overall tournament analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-gray-600 mb-3">
                Get insights on total runs, wickets, and top performers.
              </p>
              <div className="flex items-center text-green-600 font-medium">
                View Summary <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card className="border-none shadow-lg mb-6">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <Card className="border-2 border-slate-100 hover:border-blue-100 transition-all duration-300 shadow-sm hover:shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-800">
                    Add New Player
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create a new player entry in the database.
                  </p>
                </div>
                <div className="bg-blue-50 rounded-full p-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Player
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-100 hover:border-amber-100 transition-all duration-300 shadow-sm hover:shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-800">
                    Reseed Database
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Reinitialize database with original player data.
                  </p>
                </div>
                <div className="bg-amber-50 rounded-full p-2">
                  <RefreshCcw className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/seed");
                    if (!response.ok)
                      throw new Error("Failed to reseed database");
                    toast.success("Database reseeded successfully!");
                  } catch (err) {
                    toast.error("Failed to reseed database");
                    console.error(err);
                  }
                }}
              >
                Reseed Database
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>
              Enter player details to create a new record.
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
                  placeholder="Enter player's university"
                  className="w-full"
                />
              </div>
            </div>
            <div className="col-span-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Player Category *
                </Label>
                <select
                  id="category"
                  value={newPlayer.category}
                  onChange={(e) =>
                    setNewPlayer({ ...newPlayer, category: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                </select>
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <Label htmlFor="total-runs" className="text-sm font-medium">
                  Total Runs *
                </Label>
                <Input
                  id="total-runs"
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
            </div>
            <div>
              <div className="space-y-2">
                <Label htmlFor="balls-faced" className="text-sm font-medium">
                  Balls Faced *
                </Label>
                <Input
                  id="balls-faced"
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
            <div>
              <div className="space-y-2">
                <Label htmlFor="innings-played" className="text-sm font-medium">
                  Innings Played *
                </Label>
                <Input
                  id="innings-played"
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
            </div>
            <div>
              <div className="space-y-2">
                <Label htmlFor="wickets" className="text-sm font-medium">
                  Wickets *
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
            </div>
            <div>
              <div className="space-y-2">
                <Label htmlFor="overs-bowled" className="text-sm font-medium">
                  Overs Bowled *
                </Label>
                <Input
                  id="overs-bowled"
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
                />
              </div>
            </div>
            <div>
              <div className="space-y-2">
                <Label htmlFor="runs-conceded" className="text-sm font-medium">
                  Runs Conceded *
                </Label>
                <Input
                  id="runs-conceded"
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
    </div>
  );
}
