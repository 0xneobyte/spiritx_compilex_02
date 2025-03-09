import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Define a type for ClassValue
type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | Record<string, unknown>
  | ClassValue[];

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency (Rs.)
export function formatCurrency(amount: number): string {
  // Format with commas for thousands in groups of 3 (e.g., 1,000,000)
  const formattedAmount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);

  // Return with "Rs" prefix
  return `Rs ${formattedAmount}`;
}

// Calculate team points based on array of player points
export function calculateTeamPoints(playersPoints: number[]): number {
  return playersPoints.reduce((total, points) => total + points, 0);
}

// Determine if a team is complete (has 11 players)
export function isTeamComplete(team: unknown[]): boolean {
  return team.length === 11;
}
