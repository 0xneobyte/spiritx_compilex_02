import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency (Rs.)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Calculate team points based on array of player points
export function calculateTeamPoints(playersPoints: number[]): number {
  return playersPoints.reduce((total, points) => total + points, 0);
}

// Determine if a team is complete (has 11 players)
export function isTeamComplete(team: any[]): boolean {
  return team.length === 11;
}
