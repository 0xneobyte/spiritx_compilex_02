"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";
import { cn } from "@/app/lib/utils";

interface NavbarProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  username?: string;
  onLogout: () => void;
}

const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  ({ isLoggedIn, isAdmin = false, username, onLogout }, ref) => {
    const pathname = usePathname();

    const userNavLinks = [
      { name: "Players", href: "/user/players" },
      { name: "Team", href: "/user/team" },
      { name: "Budget", href: "/user/budget" },
      { name: "Leaderboard", href: "/user/leaderboard" },
      { name: "Spiriter", href: "/user/spiriter" },
    ];

    const adminNavLinks = [
      { name: "Players", href: "/admin/dashboard/players" },
      { name: "Player Stats", href: "/admin/dashboard/stats" },
      { name: "Tournament Summary", href: "/admin/dashboard/summary" },
    ];

    const navLinks = isAdmin ? adminNavLinks : userNavLinks;

    return (
      <nav className="bg-indigo-700 shadow-md" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-white text-xl font-bold">
                  Spirit11
                </Link>
              </div>
              {isLoggedIn && (
                <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md",
                        pathname === link.href
                          ? "bg-indigo-900 text-white"
                          : "text-white hover:bg-indigo-800"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <span className="text-white text-sm font-medium">
                    {isAdmin ? "Admin: " : ""} {username}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout}
                    className="text-white border-white hover:bg-indigo-800 hover:text-white"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-white hover:bg-indigo-800 hover:text-white"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button variant="secondary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isLoggedIn && (
          <div className="sm:hidden border-t border-indigo-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-md",
                    pathname === link.href
                      ? "bg-indigo-900 text-white"
                      : "text-white hover:bg-indigo-800"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    );
  }
);

Navbar.displayName = "Navbar";

export default Navbar;
