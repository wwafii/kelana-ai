"use client";

import React, { useState, useEffect } from "react";
import { TripFormData } from "@/types";
import {
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Compass,
  Wallet,
  TrendingUp,
  Tag,
  Info,
} from "lucide-react";

interface TravelFormProps {
  initialValues: TripFormData;
  onSubmit: (formData: TripFormData) => void;
  isLoading: boolean;
}

export default function TravelForm({ initialValues, onSubmit, isLoading }: TravelFormProps) {
  const [destination, setDestination] = useState(initialValues.destination);
  const [days, setDays] = useState<number | string>(initialValues.days);
  const [budget, setBudget] = useState<number | string>(initialValues.budget);
  const [travelStyle, setTravelStyle] = useState(initialValues.travelStyle || "Standard");

  // Keep state synced when initialValues change from external triggers (e.g. quick destination click)
  useEffect(() => {
    setDestination(initialValues.destination);
    setDays(initialValues.days);
    setBudget(initialValues.budget);
    setTravelStyle(initialValues.travelStyle || "Standard");
  }, [initialValues]);

  const numDays = Math.max(1, Number(days) || 1);
  const numBudget = Math.max(0, Number(budget) || 0);
  const dailyBudget = numBudget / numDays;

  // Derive category following backend rules
  const derivedCategory =
    numBudget < 1000 ? "Backpacker" : numBudget <= 3000 ? "Standard" : "Luxury";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    onSubmit({
      destination: destination.trim(),
      days: numDays,
      budget: numBudget,
      travelStyle,
    });
  };

  return (
    <div id="planner" className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden transition-all">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  AI Travel Itinerary Generator
                </h2>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Customize your trip preferences and let Amazon Bedrock create your daily schedule.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-sky-300">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Instant AI Analysis</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Main Input Grid: Responsive (Mobile: Stacked 1 col, Desktop: 3 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {/* Field 1: Destination */}
            <div className="space-y-2 md:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Destination <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="h-5 w-5 text-sky-600" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tokyo, Japan"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">City, region, or country</p>
            </div>

            {/* Field 2: Total Budget */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Total Budget (USD) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <input
                  type="number"
                  required
                  min={50}
                  max={100000}
                  step={50}
                  placeholder="2000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">Estimated total expenses</p>
            </div>

            {/* Field 3: Duration (Days) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Duration (Days) <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <input
                  type="number"
                  required
                  min={1}
                  max={30}
                  placeholder="5"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="block w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm font-medium transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500">Recommended 3 to 14 days</p>
            </div>
          </div>

          {/* Travel Style Selector */}
          <div className="space-y-2.5 pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Travel Preference / Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: "Standard", desc: "Balanced comfort & culture", icon: "✨" },
                { label: "Backpacker", desc: "Budget & local gems", icon: "🎒" },
                { label: "Luxury", desc: "Premium stays & fine dining", icon: "💎" },
                { label: "Family", desc: "Kid-friendly & relaxed", icon: "👨‍👩‍👧" },
              ].map((style) => (
                <button
                  type="button"
                  key={style.label}
                  onClick={() => setTravelStyle(style.label)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    travelStyle === style.label
                      ? "border-sky-500 bg-sky-50/80 text-sky-900 ring-2 ring-sky-500/20 font-semibold"
                      : "border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="text-base mb-1">{style.icon}</div>
                  <div className="text-xs font-bold">{style.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Calculation & Category Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-sm shrink-0">
                <Wallet className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Calculated Daily Budget:
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black text-slate-900">
                    ${dailyBudget.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ day per person</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs text-slate-500 font-medium">Category tier:</span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  derivedCategory === "Luxury"
                    ? "bg-purple-100 text-purple-800 border border-purple-200"
                    : derivedCategory === "Standard"
                    ? "bg-sky-100 text-sky-800 border border-sky-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                <Tag className="w-3 h-3" />
                {derivedCategory}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !destination.trim()}
              className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:via-teal-700 hover:to-emerald-700 shadow-lg shadow-sky-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 text-base sm:text-lg cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting to Amazon Bedrock...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate AI Trip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
