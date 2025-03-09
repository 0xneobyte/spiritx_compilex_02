"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "./Button";
import { cn } from "@/app/lib/utils";
import { Shield, Menu, X, ChevronRight, User, LogOut } from "lucide-react";

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
        className="bg-white sticky top-0 z-50 border-b border-slate-100 shadow-sm"
        ref={ref}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href={isAdmin ? "/admin/dashboard" : "/"}
                className="flex items-center gap-2 group"
              >
                <div className="flex items-center justify-center h-9 w-9 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-lg shadow-md shadow-purple-200 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-purple-300 group-hover:scale-105">
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 group-hover:from-indigo-500 group-hover:to-purple-500">
                  Spirit11
                </span>
              </Link>

              {isLoggedIn && (
                <div className="hidden md:ml-10 md:flex md:space-x-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "inline-flex items-center mx-1 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                        pathname === link.href
                          ? "bg-purple-100 text-purple-700 shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-purple-600"
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
                    <div
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium",
                        isAdmin
                          ? "bg-purple-50 text-purple-700"
                          : "bg-slate-50 text-slate-700"
                      )}
                    >
                      <User className="h-4 w-4" />
                      {isAdmin ? "Admin" : ""} {username}
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onLogout}
                      className="flex items-center gap-1 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </Button>
                  </div>

                  {/* Mobile menu button */}
                  <button
                    className="md:hidden bg-slate-50 rounded-md p-2 text-slate-600 hover:bg-slate-100 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <Menu className="h-5 w-5" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all duration-200"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow"
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
                ? "max-h-screen border-t border-slate-100"
                : "max-h-0"
            )}
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-md mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {isAdmin ? "Admin: " : ""} {username}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                  className="flex items-center gap-1 border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Logout</span>
                </Button>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex justify-between items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                    pathname === link.href
                      ? "bg-purple-50 text-purple-700"
                      : "text-slate-700 hover:bg-slate-50 hover:text-purple-600"
                  )}
                >
                  {link.name}
                  <ChevronRight className="h-4 w-4 opacity-50" />
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
