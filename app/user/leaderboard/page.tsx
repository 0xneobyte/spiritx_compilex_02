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
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: string;
  username: string;
  teamSize: number;
  points: number;
  isComplete: boolean;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/leaderboard");

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }

        const data = await response.json();
        setLeaderboard(data.leaderboard);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

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
          <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
          <p className="text-gray-600">
            See how your team ranks against others
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Player Rankings</CardTitle>
          <CardDescription>
            Teams with complete lineups (11 players) are ranked by total points
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
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No teams have been created yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">Rank</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Team Status</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((user, index) => (
                  <TableRow
                    key={user.id}
                    className={
                      user.isCurrentUser
                        ? "bg-indigo-50 hover:bg-indigo-100"
                        : undefined
                    }
                  >
                    <TableCell className="text-center font-bold">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium flex items-center">
                      {user.username}
                      {user.isCurrentUser && (
                        <Badge className="ml-2 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                          You
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isComplete ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Complete ({user.teamSize}/11)
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-gray-500 border-gray-300"
                        >
                          Incomplete ({user.teamSize}/11)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.isComplete ? (
                        <span className="font-bold">
                          {user.points.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Points are only calculated for users with complete teams (11 players).
        </CardFooter>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Points Are Calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Team points are the sum of individual player points. Player points
            are calculated based on:
          </p>

          <div className="bg-gray-50 p-4 rounded-lg text-sm">
            <p className="font-mono text-xs mb-2 text-gray-700">
              Player Points = (Batting Strike Rate / 5 + Batting Average × 0.8)
              + (500 / Bowling Strike Rate + 140 / Economy Rate)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-1">
                  Batting Statistics
                </h4>
                <p className="text-xs text-gray-600">
                  Batting Strike Rate = (Total Runs / Total Balls Faced) × 100
                </p>
                <p className="text-xs text-gray-600">
                  Batting Average = Total Runs / Innings Played
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-1">
                  Bowling Statistics
                </h4>
                <p className="text-xs text-gray-600">
                  Bowling Strike Rate = Total Balls Bowled / Total Wickets Taken
                </p>
                <p className="text-xs text-gray-600">
                  Economy Rate = (Total Runs Conceded / Total Balls Bowled) × 6
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
