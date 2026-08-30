"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Compass,
  Sparkles,
  MapPin,
  Menu,
  X,
  BookOpen,
  Layers,
  FolderOpen,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

interface NavbarProps {
  onPlanClick?: () => void;
  onExploreClick?: () => void;
}

export default function Navbar({ onPlanClick, onExploreClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const isHomePage = pathname === "/";
  const isTripsPage = pathname === "/trips";
  const isProfilePage = pathname === "/profile";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Kelana<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                  <Sparkles className="w-3 h-3 text-sky-600" /> Bedrock AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Intelligent Travel Assistant
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isHomePage ? (
              <a
                href="#planner"
                onClick={(e) => {
                  if (onPlanClick) {
                    e.preventDefault();
                    onPlanClick();
                  }
                }}
                className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-sky-500" /> Plan Itinerary
              </a>
            ) : (
              <Link
                href="/#planner"
                className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-sky-500" /> Plan Itinerary
              </Link>
            )}

            {/* Trip History Dashboard Link */}
            <Link
              href="/trips"
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                isTripsPage
                  ? "bg-sky-50 text-sky-700 border border-sky-200/80 font-bold"
                  : "text-slate-700 hover:text-sky-600 hover:bg-slate-50"
              }`}
            >
              <FolderOpen className="w-4 h-4 text-sky-600" /> My Trips
            </Link>

            <Link
              href="/#destinations"
              onClick={(e) => {
                if (isHomePage && onExploreClick) {
                  e.preventDefault();
                  onExploreClick();
                }
              }}
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-teal-500" /> Destinations
            </Link>

            <Link
              href="/#features"
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-emerald-500" /> How It Works
            </Link>

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-slate-400" /> API Docs
            </a>
          </nav>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Personalized Welcome Bonus Message */}
                <div className="text-right hidden lg:block">
                  <div className="text-xs font-bold text-slate-800">
                    Welcome back, <span className="text-sky-600">{user.name}</span> 👋
                  </div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>

                {/* Profile Link with Avatar */}
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-2xl border transition-all ${
                    isProfilePage
                      ? "bg-sky-50 border-sky-300 text-sky-700"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                  title="View Profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm uppercase">
                    {user.name ? user.name.charAt(0) : "U"}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline">Profile</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl text-slate-700 hover:text-sky-600 hover:bg-slate-100 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-sm shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 px-4 pt-3 pb-5 space-y-3">
          {isAuthenticated && user && (
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center text-white font-bold uppercase shadow-sm">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{user.name}</div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-sky-700 px-2.5 py-1 rounded-lg bg-sky-100"
              >
                Profile
              </Link>
            </div>
          )}

          <Link
            href="/#planner"
            onClick={() => {
              setMobileMenuOpen(false);
              onPlanClick?.();
            }}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
          >
            ✦ Plan Itinerary
          </Link>
          <Link
            href="/trips"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700 font-semibold"
          >
            ✦ My Trips Dashboard
          </Link>
          {isAuthenticated && (
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
            >
              ✦ My Profile
            </Link>
          )}
          <Link
            href="/#destinations"
            onClick={() => {
              setMobileMenuOpen(false);
              onExploreClick?.();
            }}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
          >
            ✦ Popular Destinations
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
          >
            ✦ FastAPI Swagger Docs
          </a>

          <div className="pt-2 border-t border-slate-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 text-center font-bold text-xs rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-4 text-center font-bold text-xs rounded-xl text-white bg-gradient-to-r from-sky-600 to-teal-600 shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
