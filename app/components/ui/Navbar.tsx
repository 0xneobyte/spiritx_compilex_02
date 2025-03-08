"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";
import { cn } from "@/app/lib/utils";
import { Shield, Menu, X } from "lucide-react";

interface NavbarProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  username?: string;
  onLogout: () => void;
}

const Navbar = React.forwardRef<HTMLDivElement, NavbarProps>(
  ({ isLoggedIn, isAdmin = false, username, onLogout }, ref) => {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const userNavLinks = [
      { name: "Players", href: "/user/players" },
      { name: "Select Your Team", href: "/user/team" },
      { name: "Team", href: "/user/myteam" },
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

    const toggleMobileMenu = () => {
      setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
      <nav
        className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50"
        ref={ref}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href={isAdmin ? "/admin/dashboard" : "/"}
                className="flex items-center gap-2"
              >
                <Shield className="h-8 w-8 text-purple-600" />
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Spirit11
                </span>
              </Link>

              {isLoggedIn && (
                <div className="hidden md:ml-8 md:flex md:space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        pathname === link.href
                          ? "bg-purple-100 text-purple-700"
                          : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
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
                  <div className="hidden md:flex items-center">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        isAdmin
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      {isAdmin ? "Admin" : ""} {username}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLogout}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                    >
                      Logout
                    </Button>
                  </div>

                  {/* Mobile menu button */}
                  <button
                    className="md:hidden bg-purple-50 rounded-lg p-2 text-purple-600"
                    onClick={toggleMobileMenu}
                  >
                    {mobileMenuOpen ? (
                      <X className="h-6 w-6" />
                    ) : (
                      <Menu className="h-6 w-6" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
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
          <div
            className={cn(
              "md:hidden transition-all duration-300 ease-in-out overflow-hidden",
              mobileMenuOpen
                ? "max-h-screen border-t border-gray-100"
                : "max-h-0"
            )}
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <div className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {isAdmin ? "Admin: " : ""} {username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
                >
                  Logout
                </Button>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "block px-3 py-2 text-sm font-medium rounded-lg",
                    pathname === link.href
                      ? "bg-purple-100 text-purple-700"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
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
