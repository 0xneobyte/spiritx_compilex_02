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

interface LeaderboardEntry {
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
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);

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

        // Find current user's rank
        const currentUserIndex = data.leaderboard.findIndex(
          (user: LeaderboardEntry) => user.isCurrentUser
        );
        if (currentUserIndex !== -1) {
          setCurrentUserRank(currentUserIndex + 1);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Render rank with medal for top 3
  const renderRank = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-bold">
          🥇
        </div>
      );
    } else if (rank === 2) {
      return (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold">
          🥈
        </div>
      );
    } else if (rank === 3) {
      return (
        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold">
          🥉
        </div>
      );
    }
    return <span className="font-bold">{rank}</span>;
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
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-gray-600">
            See how your team ranks against others
          </p>
        </div>

        {currentUserRank && (
          <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
            <p className="font-medium text-indigo-700">
              Your Rank: <span className="font-bold">{currentUserRank}</span>{" "}
              {currentUserRank === 1
                ? "(1st Place)"
                : currentUserRank === 2
                ? "(2nd Place)"
                : currentUserRank === 3
                ? "(3rd Place)"
                : `(Top ${Math.ceil(
                    (currentUserRank / leaderboard.length) * 100
                  )}%)`}
            </p>
          </div>
        )}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>Player Rankings</CardTitle>
          <CardDescription>
            Teams with complete lineups (11 players) are ranked by total points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
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
                        ? "bg-indigo-50 border-l-4 border-indigo-500"
                        : undefined
                    }
                  >
                    <TableCell className="text-center">
                      {renderRank(index + 1)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {user.username}
                        {user.isCurrentUser && (
                          <Badge className="ml-2 bg-indigo-100 text-indigo-800 border border-indigo-200">
                            You
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.isComplete ? (
                        <Badge className="bg-green-50 text-green-700 border border-green-200">
                          Complete (11/11)
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-gray-500 border-gray-300"
                        >
                          {user.teamSize}/11
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {user.isComplete ? (
                        <span className="font-bold">
                          {user.points.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500 border-t pt-3">
          Points are only calculated for users with complete teams (11 players)
        </CardFooter>
      </Card>

      <Card className="mt-6 border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle>How Points Are Calculated</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            Team points are the sum of individual player points:
          </p>

          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="font-mono text-xs mb-2 text-gray-700">
              Player Points = (Batting Strike Rate / 5 + Batting Average × 0.8)
              + (500 / Bowling Strike Rate + 140 / Economy Rate)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <h4 className="font-medium text-gray-800 mb-1 text-xs">
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
                <h4 className="font-medium text-gray-800 mb-1 text-xs">
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
