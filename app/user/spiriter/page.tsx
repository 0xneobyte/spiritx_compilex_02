"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function SpiriterPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Spiriter, your cricket assistant powered by Google Gemini. Ask me about players, stats, or for team recommendations!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user" as const, content: input };
    setMessages((prev) => [...prev, userMessage]);

    // Clear input
    setInput("");

    try {
      setIsLoading(true);

      // Add typing indicator
      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      // Send request to API
      const response = await fetch("/api/user/spiriter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from Spiriter");
      }

      const data = await response.json();

      // Replace typing indicator with actual response
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove the typing indicator
        { role: "assistant", content: data.message },
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      toast.error("Sorry, I couldn't process your request. Please try again.");

      // Replace typing indicator with error message
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove the typing indicator
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble processing your request right now. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus back on input
      inputRef.current?.focus();
    }
  };

  // Suggestions for users
  const suggestions = [
    "Who are the players from University of Colombo?",
    "Can you suggest the best possible team?",
    "Tell me about Danushka Kumara's statistics",
    "Who has the highest batting average?",
    "Which bowler has taken the most wickets?",
    "Players from Eastern University",
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[80vh] flex flex-col">
        <div className="p-4 bg-indigo-700 text-white">
          <h1 className="text-xl font-bold flex items-center">
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </span>
            Spiriter Chat
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              Powered by Gemini
            </span>
          </h1>
          <p className="text-sm text-indigo-200">
            Ask me about player details, statistics, or for team
            recommendations!
          </p>
        </div>

        <div className="flex-grow overflow-auto p-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="p-4 rounded-lg border bg-white animate-pulse">
              <div className="h-6 bg-gray-200 rounded-md w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-12 bg-gray-200 rounded-md w-full"></div>
                <div className="h-12 bg-gray-200 rounded-md w-full"></div>
                <div className="h-12 bg-gray-200 rounded-md w-full"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    } ${message.content === "..." ? "animate-pulse" : ""}`}
                  >
                    {message.content === "..." ? (
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    ) : message.role === "assistant" ? (
                      <div className="markdown prose-sm max-w-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Suggestions */}
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 mb-2 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-full transition"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about players, statistics, or team recommendations..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center">
                  Send
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 ml-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
