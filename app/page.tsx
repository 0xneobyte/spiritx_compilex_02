"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold">Spirit11</h1>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary" size="sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-extrabold mb-6">
              The Ultimate Inter-University Fantasy Cricket Game
            </h2>
            <p className="text-xl mb-8">
              Build your dream team from real university players, analyze
              statistics, and compete with others for the top spot on the
              leaderboard.
            </p>
            <div className="space-x-4">
              <Button size="lg" onClick={() => router.push("/auth/signup")}>
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push("/auth/login")}
              >
                Login
              </Button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl">
            <h3 className="text-2xl font-bold mb-6">Key Features</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="bg-indigo-500 p-1 rounded-full mr-3 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <h4 className="font-semibold">Build Your Dream Team</h4>
                  <p className="text-indigo-200">
                    Select players from different universities to create your
                    ultimate team.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-500 p-1 rounded-full mr-3 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <h4 className="font-semibold">Manage Your Budget</h4>
                  <p className="text-indigo-200">
                    Start with Rs. 9,000,000 and strategically build your team
                    within budget.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-500 p-1 rounded-full mr-3 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <h4 className="font-semibold">AI-Powered Assistant</h4>
                  <p className="text-indigo-200">
                    Get help from Spiriter, our AI chatbot, to make smart picks
                    and build the best team.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-500 p-1 rounded-full mr-3 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <div>
                  <h4 className="font-semibold">Compete on the Leaderboard</h4>
                  <p className="text-indigo-200">
                    See how your team stacks up against others in real-time.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
