"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/app/lib/utils";
import { Progress } from "@/components/ui/progress";
import {
  calculatePlayerValue,
  calculateTeamValue,
} from "@/app/lib/utils/playerValue";

interface Player {
  _id: string;
  name: string;
  university: string;
  category: string;
  value: number;
  totalRuns?: number;
  ballsFaced?: number;
  inningsPlayed?: number;
  wickets?: number;
  oversBowled?: number;
  runsConceded?: number;
  battingStrikeRate?: number;
  battingAverage?: number;
  bowlingStrikeRate?: number;
  economyRate?: number;
}

export default function BudgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userTeam, setUserTeam] = useState<Player[]>([]);
  const [initialBudget, setInitialBudget] = useState(9000000); // Default initial budget

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

        // Set fixed initial budget to 9,000,000 as per requirements
        setInitialBudget(9000000);

        // Calculate spent budget for display purposes
        const spentBudget = data.team.reduce(
          (total: number, player: Player) =>
            total + calculatePlayerValue(player),
          0
        );
        console.log("Current budget:", data.budget);
        console.log("Total player value (spent):", spentBudget);
        console.log("Initial budget (fixed):", 9000000);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your budget information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserTeam();
  }, []);

  // Calculate totals for display
  const calculateTotalPlayerValue = () => {
    return calculateTeamValue(userTeam);
  };

  const totalPlayerValue = calculateTotalPlayerValue();

  // Display values
  const spentBudget = totalPlayerValue; // Use calculated total player value
  const remainingBudget = initialBudget - spentBudget;
  const spentPercentage = (spentBudget / initialBudget) * 100;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Batsman":
        return "bg-blue-100 text-blue-800";
      case "Bowler":
        return "bg-green-100 text-green-800";
      case "All-Rounder":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Budget Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Budget Overview Section */}
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>
                Your spending and available budget
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Budget:</span>
                      <span className="font-semibold">
                        {formatCurrency(initialBudget)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Spent:</span>
                      <span className="font-semibold text-red-600">
                        {formatCurrency(spentBudget)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Remaining:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(remainingBudget)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>0%</span>
                      <span>{spentPercentage.toFixed(1)}% spent</span>
                      <span>100%</span>
                    </div>
                    <Progress
                      value={spentPercentage}
                      className="h-2"
                      color={
                        spentPercentage > 90
                          ? "bg-red-500"
                          : spentPercentage > 70
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }
                    />
                  </div>

                  <div className="rounded-lg bg-indigo-50 p-4 border border-indigo-100">
                    <h3 className="font-medium text-indigo-800 mb-2">
                      Budget Management Tips
                    </h3>
                    <ul className="text-sm space-y-1 text-indigo-700">
                      <li>• Build a balanced team across categories</li>
                      <li>• Consider player form and value for money</li>
                      <li>
                        • Reserve budget for key players in critical roles
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Expenditure Breakdown Section */}
        <div className="md:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle>Expenditure Breakdown</CardTitle>
              <CardDescription>
                See how you have allocated your budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : userTeam.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>You haven&apos;t added any players to your team yet.</p>
                  <p className="text-sm mt-2">
                    Visit the team selection page to add players.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">% of Budget</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userTeam.map((player) => {
                      const playerValue = calculatePlayerValue(player);
                      const percentOfBudget = (
                        (playerValue / initialBudget) *
                        100
                      ).toFixed(1);

                      return (
                        <TableRow key={player._id}>
                          <TableCell className="font-medium">
                            {player.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={getCategoryColor(player.category)}
                            >
                              {player.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(playerValue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {percentOfBudget}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2} className="font-semibold">
                        {userTeam.length} players in your team
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Total Spent: {formatCurrency(spentBudget)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {spentBudget > 0
                          ? ((spentBudget / initialBudget) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-muted-foreground">
        Don&apos;t worry about running out! You can always get more.
      </p>
    </div>
  );
}
