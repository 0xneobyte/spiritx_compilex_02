// Server-side version of player value calculation
// This is needed because the server deals with Mongoose models that have slightly different properties

/**
 * Calculates the value of a player based on their statistics
 * This function is for server-side use with Mongoose models
 */
export const calculatePlayerValueServer = (player: any): number => {
  // If player already has a value, use it
  if (player.value > 0) return player.value;

  // Predefined values for special players
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

  // For predefined players, return the fixed value
  if (predefinedValues[player.name]) {
    return predefinedValues[player.name];
  }

  // Calculate stats - handling both direct properties and mongoose model properties
  const getBattingStrikeRate = () => {
    if (player.battingStrikeRate && player.battingStrikeRate > 0)
      return player.battingStrikeRate;
    if (
      player.ballsFaced &&
      player.ballsFaced > 0 &&
      player.totalRuns !== undefined
    ) {
      return (player.totalRuns / player.ballsFaced) * 100;
    }
    return 0;
  };

  const getBattingAverage = () => {
    if (player.battingAverage && player.battingAverage > 0)
      return player.battingAverage;
    if (
      player.inningsPlayed &&
      player.inningsPlayed > 0 &&
      player.totalRuns !== undefined
    ) {
      return player.totalRuns / player.inningsPlayed;
    }
    return 0;
  };

  const getBowlingStrikeRate = () => {
    if (player.bowlingStrikeRate && player.bowlingStrikeRate > 0)
      return player.bowlingStrikeRate;
    if (
      player.wickets &&
      player.wickets > 0 &&
      player.oversBowled &&
      player.oversBowled > 0
    ) {
      return Math.floor(player.oversBowled * 6) / player.wickets;
    }
    return 0;
  };

  const getEconomyRate = () => {
    if (player.economyRate && player.economyRate > 0) return player.economyRate;
    if (
      player.oversBowled &&
      player.oversBowled > 0 &&
      player.runsConceded !== undefined
    ) {
      return player.runsConceded / player.oversBowled;
    }
    return 0;
  };

  const battingStrikeRate = getBattingStrikeRate();
  const battingAverage = getBattingAverage();
  const bowlingStrikeRate = getBowlingStrikeRate();
  const economyRate = getEconomyRate();

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

  // Calculate value using the original formula from the team selection page
  return Math.round(((9 * points + 100) * 1000) / 50000) * 50000;
};
