"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/dashboard/players">
          <Card className="transition-all hover:shadow-lg cursor-pointer h-full">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-blue-700">
                Players Management
              </CardTitle>
              <CardDescription>Add, update, or remove players</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600">
                Complete CRUD operations for players in the system.
              </p>
              <div className="mt-4 text-blue-600 font-medium">
                Manage Players →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dashboard/stats">
          <Card className="transition-all hover:shadow-lg cursor-pointer h-full">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-700">
                Player Statistics
              </CardTitle>
              <CardDescription>View detailed player stats</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600">
                See comprehensive statistics for each player.
              </p>
              <div className="mt-4 text-purple-600 font-medium">
                View Statistics →
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/dashboard/summary">
          <Card className="transition-all hover:shadow-lg cursor-pointer h-full">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-700">
                Tournament Summary
              </CardTitle>
              <CardDescription>Overall tournament analysis</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600">
                Get insights on total runs, wickets, and top performers.
              </p>
              <div className="mt-4 text-green-600 font-medium">
                View Summary →
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border border-dashed">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Add New Player</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create a new player entry in the database.
                </p>
                <Link href="/admin/dashboard/players/create">
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">
                    Add Player
                  </button>
                </Link>
              </CardContent>
            </Card>
            <Card className="border border-dashed">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Reseed Database</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Reinitialize database with original player data.
                </p>
                <button
                  className="px-3 py-1 bg-amber-600 text-white rounded-md text-sm"
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
                </button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
