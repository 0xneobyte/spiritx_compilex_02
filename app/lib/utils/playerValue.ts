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

export const calculatePlayerValue = (player: Player): number => {
  if (player.value > 0) return player.value;

  const predefinedValues: Record<string, number> = {
    "Danushka Kumara": 800000,
    "Jeewan Thirimanne": 800000,
    "Lakshan Vandersay": 850000,
    "Sammu Sandakan": 850000,
    "Danushka Jayawickrama": 900000,
    "Charith Shanaka": 800000,
    "Pathum Dhananjaya": 750000,
    "Minod Rathnayake": 850000,
    "Sadeera Rajapaksa": 850000,
    "Lakshan Gunathilaka": 800000,
    "Suranga Bandara": 750000,
  };

  if (predefinedValues[player.name]) {
    return predefinedValues[player.name];
  }

  const battingStrikeRate =
    player.battingStrikeRate ||
    (player.ballsFaced && player.ballsFaced > 0
      ? ((player.totalRuns || 0) / player.ballsFaced) * 100
      : 0);

  const battingAverage =
    player.battingAverage ||
    (player.inningsPlayed && player.inningsPlayed > 0
      ? (player.totalRuns || 0) / player.inningsPlayed
      : 0);

  const bowlingStrikeRate =
    player.bowlingStrikeRate ||
    (player.wickets &&
    player.wickets > 0 &&
    player.oversBowled &&
    player.oversBowled > 0
      ? Math.floor(player.oversBowled * 6) / player.wickets
      : 0);

  const economyRate =
    player.economyRate ||
    (player.oversBowled &&
    player.oversBowled > 0 &&
    player.runsConceded !== undefined
      ? player.runsConceded / player.oversBowled
      : 0);

  // Calculate points
  let points = 0;
  if (battingStrikeRate > 0) {
    points += battingStrikeRate / 5 + battingAverage * 0.8;
  }
  if (bowlingStrikeRate > 0 && bowlingStrikeRate < 999) {
    points += 500 / bowlingStrikeRate;
  }
  if (economyRate > 0) {
    points += 140 / economyRate;
  }

  return Math.round(((9 * points + 100) * 1000) / 50000) * 50000;
};


export const calculateTeamValue = (team: Player[]): number => {
  return team.reduce(
    (total, player) => total + calculatePlayerValue(player),
    0
  );
};
