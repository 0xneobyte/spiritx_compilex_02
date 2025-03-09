"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import Button from "./ui/Button";
import { formatCurrency } from "@/app/lib/utils";

interface PlayerCardProps {
  player: {
    id: string;
    name: string;
    university: string;
    category: string;
    totalRuns?: number;
    battingStrikeRate?: number;
    battingAverage?: number;
    wickets?: number;
    economyRate?: number;
    bowlingStrikeRate?: number;
    value: number;
  };
  showStats?: boolean;
  showActions?: boolean;
  inTeam?: boolean;
  onAddToTeam?: () => void;
  onRemoveFromTeam?: () => void;
  isTeamSelectionDisabled?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  showStats = false,
  showActions = false,
  inTeam = false,
  onAddToTeam,
  onRemoveFromTeam,
  isTeamSelectionDisabled = false,
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="bg-indigo-50">
        <CardTitle>{player.name}</CardTitle>
        <div className="text-sm text-gray-600">{player.university}</div>
        <div className="mt-1 inline-block bg-indigo-100 px-2 py-0.5 rounded-full text-xs font-semibold text-indigo-800">
          {player.category}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        {showStats && (
          <div className="mt-3 space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Stats:</h4>

            {player.category !== "Bowler" && (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Total Runs:</span>
                  <span className="text-xs font-medium">
                    {player.totalRuns}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    Batting Strike Rate:
                  </span>
                  <span className="text-xs font-medium">
                    {player.battingStrikeRate?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    Batting Average:
                  </span>
                  <span className="text-xs font-medium">
                    {player.battingAverage?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {player.category !== "Batsman" && (
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Wickets:</span>
                  <span className="text-xs font-medium">{player.wickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">Economy Rate:</span>
                  <span className="text-xs font-medium">
                    {player.economyRate?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    Bowling Strike Rate:
                  </span>
                  <span className="text-xs font-medium">
                    {player.bowlingStrikeRate?.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm font-medium text-gray-900">
            Value: {formatCurrency(player.value)}
          </div>

          {showActions && (
            <div>
              {inTeam ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onRemoveFromTeam}
                >
                  Remove
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  onClick={onAddToTeam}
                  disabled={isTeamSelectionDisabled}
                >
                  Add to Team
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
