"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/ui/Navbar";
import { ToastProvider } from "@/app/components/ToastProvider";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is an admin
    const checkAdmin = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/me");
        if (!response.ok) {
          toast.error("Authentication required");
          router.push("/auth/login");
          return;
        }

        const data = await response.json();

        // Check if the user is an admin
        if (data.role !== "admin") {
          toast.error("Admin access required");
          router.push("/user/players");
          return;
        }

        setUsername(data.username || "");
      } catch (error) {
        console.error("Admin auth check failed:", error);
        router.push("/auth/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
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
        isAdmin={true}
        username={username}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-2">
              <div className="size-8 text-primary animate-spin border-2 border-primary border-t-transparent rounded-full"></div>
              <p className="text-sm text-muted-foreground">
                Verifying admin access...
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <ToastProvider />
    </div>
  );
}
