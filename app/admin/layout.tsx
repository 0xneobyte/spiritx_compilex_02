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

  useEffect(() => {
    // Check if user is an admin
    const checkAdmin = async () => {
      try {
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
      <main className="flex-grow">{children}</main>
      <ToastProvider />
    </div>
  );
}
