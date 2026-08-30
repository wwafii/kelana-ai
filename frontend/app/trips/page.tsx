"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TripCard from "@/components/TripCard";
import Pagination from "@/components/Pagination";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { TripResponse, TripSortOption, CategoryFilter, TravelStyleFilter } from "@/types";
import { getTrips, deleteTrip } from "@/services/tripService";
import {
  Compass,
  Sparkles,
  Search,
  ArrowUpDown,
  Filter,
  PlusCircle,
  FolderOpen,
  Calendar,
  Wallet,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  X,
  User,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

function TripsDashboardContent() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, filter and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [styleFilter, setStyleFilter] = useState<TravelStyleFilter>("ALL");
  const [sortBy, setSortBy] = useState<TripSortOption>("latest");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTripList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrips();
      setTrips(data || []);
    } catch (err: any) {
      console.error("Error loading trips:", err);
      setError(
        err?.message ||
          "Could not load your trips from PostgreSQL database. Make sure FastAPI backend is running on http://localhost:8000."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripList();
  }, []);

  const handleDeleteTrip = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this trip itinerary?")) {
      return;
    }

    try {
      await deleteTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err?.message || "Failed to delete trip");
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, styleFilter, sortBy]);

  // Compute filtered and sorted trips (only user's own trips from backend)
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // 1. Text Search (Destination or Travel Style)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          (t.travel_style && t.travel_style.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (categoryFilter !== "ALL") {
      result = result.filter(
        (t) => t.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // 3. Travel Style Filter
    if (styleFilter !== "ALL") {
      result = result.filter((t) => {
        const style = (t.travel_style || "").toLowerCase();
        return style === styleFilter.toLowerCase();
      });
    }

    // 4. Sort logic
    result.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return b.id - a.id;
        case "oldest":
          return a.id - b.id;
        case "budget-desc":
          return Number(b.budget) - Number(a.budget);
        case "budget-asc":
          return Number(a.budget) - Number(b.budget);
        case "duration-desc":
          return b.days - a.days;
        case "duration-asc":
          return a.days - b.days;
        default:
          return b.id - a.id;
      }
    });

    return result;
  }, [trips, searchQuery, categoryFilter, styleFilter, sortBy]);

  // Pagination calculation
  const totalItems = filteredAndSortedTrips.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTrips.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTrips, currentPage]);

  // Aggregate Stats
  const totalBudgetPlanned = trips.reduce((acc, t) => acc + (Number(t.budget) || 0), 0);
  const uniqueDestinations = new Set(trips.map((t) => t.destination.toLowerCase())).size;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Dashboard Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/80 border border-slate-800 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-3">
                <FolderOpen className="w-3.5 h-3.5" /> Private Workspace ({user?.name || "My Account"})
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                <span>My Trip Itineraries</span>
              </h1>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl">
                Revisit, compare, and explore your personal travel itineraries generated by Amazon Bedrock AI and securely saved to PostgreSQL.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTripList}
                disabled={isLoading}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition-all cursor-pointer"
                title="Refresh trips"
                aria-label="Refresh trips"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Plan New Trip</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-sky-400" /> My Saved Trips
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {trips.length} Itineraries
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Destinations
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                {uniqueDestinations} Places
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Total Planned
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
                USD {totalBudgetPlanned.toLocaleString()}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Engine
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">
                Bedrock AI
              </div>
            </div>
          </div>
        </div>

        {/* Filter, Search & Sort Control Panel */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input Box */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search your trips by destination or travel style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 whitespace-nowrap">
                <ArrowUpDown className="w-4 h-4 text-sky-600" />
                <span>Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as TripSortOption)}
                className="py-2 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="latest">Latest (Newest First)</option>
                <option value="oldest">Oldest (First Trip First)</option>
                <option value="budget-desc">Highest Budget (High to Low)</option>
                <option value="budget-asc">Lowest Budget (Low to High)</option>
                <option value="duration-desc">Duration (Longest First)</option>
                <option value="duration-asc">Duration (Shortest First)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills (Category & Travel Style) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Category:
              </span>
              {(
                [
                  { id: "ALL", label: "All Categories" },
                  { id: "Backpacker", label: "🎒 Backpacker" },
                  { id: "Standard", label: "✨ Standard" },
                  { id: "Luxury", label: "💎 Luxury" },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-sky-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Travel Style Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Style:
              </span>
              {(
                [
                  { id: "ALL", label: "All Styles" },
                  { id: "Family", label: "👨‍👩‍👧 Family" },
                  { id: "Solo", label: "🎒 Solo" },
                  { id: "Couple", label: "💑 Couple" },
                ] as const
              ).map((style) => (
                <button
                  key={style.id}
                  onClick={() => setStyleFilter(style.id as TravelStyleFilter)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    styleFilter === style.id
                      ? "bg-teal-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 h-72 space-y-4">
                <div className="h-4 bg-slate-200 rounded-md w-1/3" />
                <div className="h-6 bg-slate-200 rounded-md w-3/4" />
                <div className="h-4 bg-slate-200 rounded-md w-1/2" />
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 sm:p-8 text-center max-w-xl mx-auto my-12">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
              !
            </div>
            <h3 className="text-lg font-bold text-rose-900 mb-2">Unable to Load Trips</h3>
            <p className="text-xs sm:text-sm text-rose-700 mb-5 leading-relaxed">{error}</p>
            <button
              onClick={fetchTripList}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Retry Loading
            </button>
          </div>
        )}

        {/* Empty State (Only Own Trips) */}
        {!isLoading && !error && trips.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-sm my-8">
            <div className="w-20 h-20 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner select-none">
              ✈️
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No trips generated yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              You haven&apos;t generated any travel itineraries yet. Start planning your first personalized adventure with Amazon Bedrock AI.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:via-teal-700 hover:to-emerald-700 shadow-lg shadow-sky-600/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Your First Trip →</span>
            </Link>
          </div>
        )}

        {/* Search / Filter Zero Results State */}
        {!isLoading && !error && trips.length > 0 && filteredAndSortedTrips.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-lg mx-auto my-8">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No matching itineraries</h3>
            <p className="text-xs text-slate-500 mb-4">
              No trips match &quot;{searchQuery || categoryFilter || styleFilter}&quot;. Try adjusting your search query or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("ALL");
                setStyleFilter("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Trips Grid View */}
        {!isLoading && !error && paginatedTrips.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500">
                Found <span className="text-slate-900 font-bold">{filteredAndSortedTrips.length}</span> of your saved itineraries
              </div>
              <span className="text-xs text-slate-400">
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>
            </div>

            {/* Grid of Trip Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
              ))}
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function TripsDashboardPage() {
  return (
    <ProtectedRoute>
      <TripsDashboardContent />
    </ProtectedRoute>
  );
}
