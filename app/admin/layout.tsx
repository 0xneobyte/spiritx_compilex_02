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
        console.log("Admin Layout: Checking if user is admin...");
        const response = await fetch("/api/user/me");
        console.log(
          "Admin Layout: User/me API response status:",
          response.status
        );

        if (!response.ok) {
          console.log("Admin Layout: Not authenticated, redirecting to login");
          toast.error("Authentication required");
          router.push("/auth/login");
          return;
        }

        const data = await response.json();
        console.log("Admin Layout: User data received:", {
          username: data.username,
          role: data.role,
          isAdmin: data.role === "admin",
        });

        // Check if the user is an admin
        if (data.role !== "admin") {
          console.log(
            "Admin Layout: User is not admin, redirecting to user page"
          );
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
      <main className="flex-grow container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center h-80">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500 font-medium">
                Verifying admin access...
              </p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Spirit11 Admin Panel. All rights
            reserved.
          </p>
        </div>
      </footer>
      <ToastProvider />
    </div>
  );
}
