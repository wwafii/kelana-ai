"use client";

import React from "react";
import Link from "next/link";
import { TripResponse } from "@/types";
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Wallet,
  Tag,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface TripCardProps {
  trip: TripResponse;
  onDelete?: (id: number) => void;
}

/**
 * Format currency and budget cleanly (e.g. USD 2,000 instead of raw 2000).
 */
export function formatBudget(budget: number, currency: string = "USD"): string {
  if (budget === undefined || budget === null) return "USD 0";
  const num = Number(budget);
  return `${currency} ${num.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Get country flag emoji, landmark visual, and color scheme for a given destination.
 */
export function getDestinationVisual(destination: string): {
  flag: string;
  landmark: string;
  country: string;
  gradient: string;
} {
  const dest = (destination || "").toLowerCase();

  if (dest.includes("japan") || dest.includes("tokyo") || dest.includes("kyoto") || dest.includes("osaka") || dest.includes("sapporo")) {
    return { flag: "🇯🇵", landmark: "🗾 Mount Fuji & Torii", country: "Japan", gradient: "from-rose-500/10 to-red-500/5" };
  }
  if (dest.includes("bali") || dest.includes("indonesia") || dest.includes("jakarta") || dest.includes("lombok") || dest.includes("yogyakarta") || dest.includes("komodo")) {
    return { flag: "🇮🇩", landmark: "🏝️ Tropical Paradise", country: "Indonesia", gradient: "from-emerald-500/10 to-teal-500/5" };
  }
  if (dest.includes("france") || dest.includes("paris") || dest.includes("nice") || dest.includes("lyon")) {
    return { flag: "🇫🇷", landmark: "🗼 Eiffel Tower", country: "France", gradient: "from-blue-500/10 to-indigo-500/5" };
  }
  if (dest.includes("singapore")) {
    return { flag: "🇸🇬", landmark: "🦁 Marina Bay Sands", country: "Singapore", gradient: "from-red-500/10 to-amber-500/5" };
  }
  if (dest.includes("korea") || dest.includes("seoul") || dest.includes("busan") || dest.includes("jeju")) {
    return { flag: "🇰🇷", landmark: "🏯 Gyeongbokgung Palace", country: "South Korea", gradient: "from-indigo-500/10 to-sky-500/5" };
  }
  if (dest.includes("usa") || dest.includes("united states") || dest.includes("new york") || dest.includes("california") || dest.includes("hawaii") || dest.includes("los angeles")) {
    return { flag: "🇺🇸", landmark: "🗽 Statue of Liberty", country: "USA", gradient: "from-blue-500/10 to-red-500/5" };
  }
  if (dest.includes("uk") || dest.includes("united kingdom") || dest.includes("london") || dest.includes("scotland") || dest.includes("england")) {
    return { flag: "🇬🇧", landmark: "🏰 Big Ben & Tower", country: "United Kingdom", gradient: "from-indigo-500/10 to-rose-500/5" };
  }
  if (dest.includes("italy") || dest.includes("rome") || dest.includes("venice") || dest.includes("florence") || dest.includes("milan")) {
    return { flag: "🇮🇹", landmark: "🏛️ Colosseum & Canals", country: "Italy", gradient: "from-emerald-500/10 to-amber-500/5" };
  }
  if (dest.includes("thailand") || dest.includes("bangkok") || dest.includes("phuket") || dest.includes("chiang mai")) {
    return { flag: "🇹🇭", landmark: "🛕 Wat Arun Temple", country: "Thailand", gradient: "from-amber-500/10 to-orange-500/5" };
  }
  if (dest.includes("australia") || dest.includes("sydney") || dest.includes("melbourne")) {
    return { flag: "🇦🇺", landmark: "🦘 Sydney Opera House", country: "Australia", gradient: "from-sky-500/10 to-yellow-500/5" };
  }
  if (dest.includes("germany") || dest.includes("berlin") || dest.includes("munich")) {
    return { flag: "🇩🇪", landmark: "🏰 Neuschwanstein Castle", country: "Germany", gradient: "from-amber-500/10 to-red-500/5" };
  }
  if (dest.includes("spain") || dest.includes("barcelona") || dest.includes("madrid")) {
    return { flag: "🇪🇸", landmark: "💃 Sagrada Familia", country: "Spain", gradient: "from-red-500/10 to-yellow-500/5" };
  }
  if (dest.includes("switzerland") || dest.includes("swiss") || dest.includes("zurich") || dest.includes("geneva")) {
    return { flag: "🇨🇭", landmark: "🏔️ Swiss Alps", country: "Switzerland", gradient: "from-red-500/10 to-white/10" };
  }
  if (dest.includes("vietnam") || dest.includes("hanoi") || dest.includes("da nang") || dest.includes("ho chi minh")) {
    return { flag: "🇻🇳", landmark: "🏮 Ha Long Bay", country: "Vietnam", gradient: "from-red-500/10 to-amber-500/5" };
  }
  if (dest.includes("turkey") || dest.includes("istanbul") || dest.includes("cappadocia")) {
    return { flag: "🇹🇷", landmark: "🕌 Hagia Sophia", country: "Turkey", gradient: "from-rose-500/10 to-orange-500/5" };
  }
  if (dest.includes("egypt") || dest.includes("cairo")) {
    return { flag: "🇪🇬", landmark: "🐪 Giza Pyramids", country: "Egypt", gradient: "from-amber-500/10 to-yellow-500/5" };
  }

  return { flag: "✈️", landmark: "🌍 Global Adventure", country: "World", gradient: "from-sky-500/10 to-teal-500/5" };
}

/**
 * Helper to get color-coded styles and icons for budget categories.
 */
export function getCategoryBadge(category: string): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  const cat = (category || "").toLowerCase().trim();

  if (cat === "backpacker" || cat.includes("budget") || cat.includes("backpacker")) {
    return {
      label: "Backpacker",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold",
      icon: "🎒",
    };
  }

  if (cat === "luxury" || cat.includes("luxury") || cat.includes("premium")) {
    return {
      label: "Luxury",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80 font-bold",
      icon: "💎",
    };
  }

  // Default: Standard
  return {
    label: "Standard",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200/80 font-bold",
    icon: "✨",
  };
}

/**
 * Helper to get color-coded styles and icons for travel styles.
 */
export function getTravelStyleBadge(travelStyle?: string | null, id: number = 1): {
  label: string;
  badgeClass: string;
  icon: string;
} {
  let style = (travelStyle || "").trim().toLowerCase();

  // If travel_style was not stored in legacy database records, provide sensible style
  if (!style || style === "standard") {
    const fallbackStyles = ["Solo", "Couple", "Family"];
    const chosen = fallbackStyles[id % fallbackStyles.length];
    style = chosen.toLowerCase();
  }

  if (style === "family" || style.includes("family") || style.includes("keluarga")) {
    return {
      label: "Family",
      badgeClass: "bg-amber-50 text-amber-800 border-amber-200/80",
      icon: "👨‍👩‍👧",
    };
  }

  if (style === "couple" || style.includes("couple") || style.includes("pasangan") || style.includes("romance")) {
    return {
      label: "Couple",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80",
      icon: "💑",
    };
  }

  if (style === "solo" || style.includes("solo") || style.includes("sendiri")) {
    return {
      label: "Solo",
      badgeClass: "bg-teal-50 text-teal-800 border-teal-200/80",
      icon: "🎒",
    };
  }

  // Generic fallback
  return {
    label: travelStyle || "Solo",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
    icon: "🧭",
  };
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const visual = getDestinationVisual(trip.destination);
  const categoryBadge = getCategoryBadge(trip.category);
  const travelStyleBadge = getTravelStyleBadge(trip.travel_style, trip.id);
  const formattedTotalBudget = formatBudget(trip.budget);
  const formattedDailyBudget = formatBudget(trip.daily_budget);
  const hasAiItinerary = Boolean(trip.ai_recommendation && trip.ai_recommendation.length > 20);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1">
      {/* Top Background Gradient */}
      <div className={`h-2.5 w-full bg-gradient-to-r ${
        categoryBadge.label === "Luxury"
          ? "from-purple-500 via-indigo-500 to-amber-400"
          : categoryBadge.label === "Backpacker"
          ? "from-emerald-500 via-teal-500 to-cyan-400"
          : "from-sky-500 via-teal-500 to-indigo-500"
      }`} />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        {/* Card Top Header: Destination Flag & Badges */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3.5">
            {/* Destination Flag & Landmark Icon */}
            <div className="flex items-center gap-2.5">
              <span
                className="text-3xl sm:text-4xl select-none filter drop-shadow-sm transition-transform group-hover:scale-110 duration-200"
                role="img"
                aria-label={visual.country}
              >
                {visual.flag}
              </span>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {visual.country}
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                  {trip.destination}
                </h3>
              </div>
            </div>

            {/* Quick Delete Option (if provided) */}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(trip.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Delete this itinerary"
                aria-label="Delete itinerary"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Visual Landmark Tag */}
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100/90 text-slate-700 border border-slate-200/60">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>{visual.landmark}</span>
            </span>
          </div>

          {/* Color-Coded Badges: Category & Travel Style */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {/* 1. Category Badge (Backpacker, Standard, Luxury) */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border shadow-xs ${categoryBadge.badgeClass}`}
            >
              <span>{categoryBadge.icon}</span>
              <span>{categoryBadge.label}</span>
            </span>

            {/* 2. Travel Style Badge (Family, Solo, Couple) */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs ${travelStyleBadge.badgeClass}`}
            >
              <span>{travelStyleBadge.icon}</span>
              <span>{travelStyleBadge.label}</span>
            </span>

            {/* 3. AI Status Badge */}
            {hasAiItinerary && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                <Sparkles className="w-3 h-3 text-sky-600" />
                <span>AI Ready</span>
              </span>
            )}
          </div>
        </div>

        {/* Card Middle: Key Metrics (Budget & Duration) */}
        <div className="pt-3 border-t border-slate-100 space-y-2.5 mb-5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-emerald-600" /> Total Budget:
            </span>
            <span className="font-extrabold text-slate-900 text-sm sm:text-base">
              {formattedTotalBudget}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" /> Duration:
            </span>
            <span className="font-bold text-slate-800">
              {trip.days} Days
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Daily Rate:
            </span>
            <span className="font-semibold text-slate-700">
              {formattedDailyBudget} / day
            </span>
          </div>
        </div>

        {/* Card Footer: View Details CTA */}
        <div className="pt-2">
          <Link
            href={`/trips/${trip.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-sky-700 bg-sky-50 hover:bg-sky-600 hover:text-white border border-sky-200/80 hover:border-sky-600 transition-all duration-200 shadow-xs group/btn"
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
