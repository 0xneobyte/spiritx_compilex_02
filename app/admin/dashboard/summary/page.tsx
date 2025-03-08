"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface TournamentStats {
  totalRuns: number;
  totalWickets: number;
  highestRunScorer: {
    id: string;
    name: string;
    university: string;
    totalRuns: number;
  };
  highestWicketTaker: {
    id: string;
    name: string;
    university: string;
    wickets: number;
  };
  averages: {
    battingStrikeRate: number;
    battingAverage: number;
  };
  categoryCounts: {
    Batsman: number;
    Bowler: number;
    "All-Rounder": number;
  };
  universityCounts: Record<string, number>;
  totalPlayers: number;
}

export default function TournamentSummary() {
  const [stats, setStats] = useState<TournamentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Safe number formatter
  const formatNumber = (value: number | undefined, decimals = 0) => {
    if (value === undefined || value === null) return "0";

    if (decimals > 0) {
      return value.toFixed(decimals);
    }

    return value.toLocaleString() || "0";
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/stats");

        if (!response.ok) {
          throw new Error("Failed to fetch tournament statistics");
        }

        const data = await response.json();

        // Debug logs
        console.log("Raw data from API:", data);
        console.log("Batting stats from API:", {
          strikerate: data.averages?.battingStrikeRate,
          average: data.averages?.battingAverage,
        });

        // Ensure all data has values to prevent undefined errors
        const cleanedData = {
          ...data,
          totalRuns: data.totalRuns || 0,
          totalWickets: data.totalWickets || 0,
          highestRunScorer: {
            ...(data.highestRunScorer || {}),
            name: data.highestRunScorer?.name || "N/A",
            university: data.highestRunScorer?.university || "N/A",
            totalRuns: data.highestRunScorer?.totalRuns || 0,
          },
          highestWicketTaker: {
            ...(data.highestWicketTaker || {}),
            name: data.highestWicketTaker?.name || "N/A",
            university: data.highestWicketTaker?.university || "N/A",
            wickets: data.highestWicketTaker?.wickets || 0,
          },
          averages: {
            battingStrikeRate: data.averages?.battingStrikeRate || 0,
            battingAverage: data.averages?.battingAverage || 0,
          },
          categoryCounts: {
            Batsman: data.categoryCounts?.Batsman || 0,
            Bowler: data.categoryCounts?.Bowler || 0,
            "All-Rounder": data.categoryCounts?.["All-Rounder"] || 0,
          },
          totalPlayers: data.totalPlayers || 0,
        };

        setStats(cleanedData);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        toast.error("Failed to load tournament statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
          {error}
        </div>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Tournament Summary
          </h1>
          <p className="text-gray-600">Overall statistics and analysis</p>
        </div>
        <button
          className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm"
          onClick={() => window.location.reload()}
        >
          Refresh Data
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Runs</CardDescription>
                <CardTitle className="text-4xl text-indigo-600">
                  {formatNumber(stats.totalRuns)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Combined runs scored by all players in the tournament
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Wickets</CardDescription>
                <CardTitle className="text-4xl text-indigo-600">
                  {formatNumber(stats.totalWickets)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Combined wickets taken by all players in the tournament
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Players</CardDescription>
                <CardTitle className="text-4xl text-indigo-600">
                  {formatNumber(stats.totalPlayers)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Batsmen: {stats.categoryCounts.Batsman}</span>
                  <span>Bowlers: {stats.categoryCounts.Bowler}</span>
                  <span>
                    All-Rounders: {stats.categoryCounts["All-Rounder"]}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  Highest run scorer and wicket taker
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-600 mb-2">
                    Highest Run Scorer
                  </h3>
                  <div className="bg-indigo-50 p-4 rounded-md">
                    <div className="font-bold text-lg">
                      {stats.highestRunScorer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.highestRunScorer.university}
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-2xl font-bold text-indigo-700">
                        {stats.highestRunScorer.totalRuns}
                      </span>
                      <span className="ml-2 text-gray-600">runs</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">
                    Highest Wicket Taker
                  </h3>
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="font-bold text-lg">
                      {stats.highestWicketTaker.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stats.highestWicketTaker.university}
                    </div>
                    <div className="mt-2 flex items-center">
                      <span className="text-2xl font-bold text-green-700">
                        {stats.highestWicketTaker.wickets}
                      </span>
                      <span className="ml-2 text-gray-600">wickets</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournament Performance Metrics</CardTitle>
                <CardDescription>
                  Key batting and bowling statistics from the tournament
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full flex flex-col justify-center">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold text-blue-600 mb-2">
                        Average Batting Strike Rate
                      </h3>
                      <div className="bg-blue-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Strike Rate
                          </span>
                          <span className="text-3xl font-bold text-blue-700">
                            {formatNumber(stats.averages.battingStrikeRate, 2)}
                          </span>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (stats.averages.battingStrikeRate / 150) * 100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="float-right">(Benchmark: 100)</span>
                          <span>Formula: (Total Runs / Balls Faced) × 100</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-emerald-600 mb-2">
                        Average Bowling Strike Rate
                      </h3>
                      <div className="bg-emerald-50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Bowling Strike Rate
                          </span>
                          <span className="text-3xl font-bold text-emerald-700">
                            {stats.totalWickets > 0
                              ? formatNumber(
                                  (stats.totalWickets /
                                    stats.categoryCounts.Bowler) *
                                    3,
                                  1
                                )
                              : "0.0"}
                          </span>
                        </div>
                        <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-emerald-600 h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                stats.totalWickets > 0
                                  ? 100 -
                                      Math.min(
                                        70,
                                        (((stats.totalWickets /
                                          stats.categoryCounts.Bowler) *
                                          3) /
                                          30) *
                                          100
                                      )
                                  : 0
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          <span className="float-right">
                            (Estimated based on total wickets)
                          </span>
                          <span>
                            Formula: (Total Wickets / Number of Bowlers) × 3
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>University Distribution</CardTitle>
              <CardDescription>
                Number of players from each university
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(stats.universityCounts || {}).map(
                  ([university, count]) => (
                    <div
                      key={university}
                      className="flex justify-between items-center p-3 border rounded-md"
                    >
                      <span className="font-medium">{university}</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {count} players
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No statistics available</p>
        </div>
      )}
    </div>
  );
}
