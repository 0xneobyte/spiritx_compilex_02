"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/ui/Navbar";
import { ToastProvider } from "@/app/components/ToastProvider";
import { toast } from "sonner";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Simple check if user is logged in by fetching user info
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }

        const data = await response.json();
        setUsername(data.username || "");
      } catch (error) {
        console.error("Auth check failed:", error);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        isLoggedIn={true}
        isAdmin={false}
        username={username}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Spirit11. All rights reserved.</p>
        </div>
      </footer>
      <ToastProvider />
    </div>
  );
}
