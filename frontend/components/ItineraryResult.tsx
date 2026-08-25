"use client";

import React, { useState } from "react";
import { ParsedItinerary } from "@/types";
import FormattedText from "@/components/FormattedText";
import {
  MapPin,
  Calendar,
  DollarSign,
  Sunrise,
  Sun,
  Moon,
  Utensils,
  Lightbulb,
  Wallet,
  CheckCircle2,
  Copy,
  Printer,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Bookmark,
} from "lucide-react";

interface ItineraryResultProps {
  itinerary: ParsedItinerary;
  onReset: () => void;
}

export default function ItineraryResult({ itinerary, onReset }: ItineraryResultProps) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(itinerary.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard error
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 animate-fade-in">
      {/* Result Card Wrapper */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/90 overflow-hidden">
        {/* Header Summary Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" /> AI-Generated Master Plan
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-sky-400 shrink-0" />
                <span>{itinerary.destination}</span>
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Customized {itinerary.daysCount}-day itinerary curated by Amazon Bedrock AI
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-[10px] sm:text-xs text-slate-300 block uppercase font-bold tracking-wider">
                  Duration
                </span>
                <span className="text-sm sm:text-lg font-black text-white">
                  {itinerary.daysCount} Days
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-[10px] sm:text-xs text-slate-300 block uppercase font-bold tracking-wider">
                  Total Budget
                </span>
                <span className="text-sm sm:text-lg font-black text-emerald-400">
                  ${itinerary.budget.toLocaleString()}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center">
                <span className="text-[10px] sm:text-xs text-slate-300 block uppercase font-bold tracking-wider">
                  Style Tier
                </span>
                <span className="text-sm sm:text-lg font-black text-sky-300">
                  {itinerary.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Daily Allocation:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
              ${itinerary.dailyBudget.toFixed(2)} / day
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Plan</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-all shadow-sm"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{showRaw ? "Formatted View" : "Raw AI Text"}</span>
            </button>
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Plan Another</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {showRaw ? (
            /* Raw AI text view */
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap overflow-x-auto">
              {itinerary.rawText}
            </div>
          ) : (
            /* Rich Formatted Breakdown matching Slide 16 Core Challenge */
            <>
              {/* Section 1: Daily Itinerary Cards */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-sky-600" />
                      <span>Day-by-Day Schedule</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Structured activities thoughtfully divided across morning, afternoon, and evening.
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                    {itinerary.dailyPlans.length} Days Planned
                  </span>
                </div>

                <div className="space-y-4">
                  {itinerary.dailyPlans.map((day) => {
                    const isExpanded = activeDay === null || activeDay === day.dayNumber;
                    return (
                      <div
                        key={day.dayNumber}
                        className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all bg-white"
                      >
                        {/* Day Card Header */}
                        <div
                          onClick={() =>
                            setActiveDay(activeDay === day.dayNumber ? null : day.dayNumber)
                          }
                          className="bg-slate-50 hover:bg-sky-50/50 px-5 py-4 flex items-center justify-between cursor-pointer transition-colors border-b border-slate-100"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                              D{day.dayNumber}
                            </span>
                            <FormattedText
                              text={day.title}
                              badgeStyle={false}
                              className="font-bold text-slate-900 text-base"
                            />
                          </div>
                          <button
                            type="button"
                            className="text-slate-400 hover:text-slate-700 p-1"
                            aria-label="Toggle day"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>

                        {/* Day Time Slots */}
                        {isExpanded && (
                          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Morning Slot */}
                            <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2.5">
                                <Sunrise className="w-4 h-4 text-amber-600" />
                                <span>Morning</span>
                              </div>
                              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                {day.morning.map((act, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <FormattedText text={act} />
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Afternoon Slot */}
                            <div className="bg-sky-50/60 border border-sky-200/70 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-sky-900 font-bold text-xs uppercase tracking-wider mb-2.5">
                                <Sun className="w-4 h-4 text-sky-600" />
                                <span>Afternoon</span>
                              </div>
                              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                {day.afternoon.map((act, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-sky-500 font-bold">•</span>
                                    <FormattedText text={act} />
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Evening Slot */}
                            <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-4">
                              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider mb-2.5">
                                <Moon className="w-4 h-4 text-indigo-600" />
                                <span>Evening</span>
                              </div>
                              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                                {day.evening.map((act, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-indigo-500 font-bold">•</span>
                                    <FormattedText text={act} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grid 2 Columns for Food & Travel Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Section 2: Local Food & Culinary */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-orange-950 font-bold text-base mb-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <h4>Local Food & Dining Highlights</h4>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800">
                    {itinerary.foodRecommendations.map((food, i) => (
                      <li key={i} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-orange-100">
                        <span className="text-orange-500 font-bold">🍴</span>
                        <FormattedText text={food} />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Section 3: Smart Travel Tips */}
                <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-teal-950 font-bold text-base mb-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <h4>Smart Travel Tips & Guidance</h4>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-800">
                    {itinerary.travelTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-xl border border-teal-100">
                        <span className="text-teal-600 font-bold">✓</span>
                        <FormattedText text={tip} badgeStyle={false} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Section 4: Budget Breakdown Summary */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-400/30">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg">Estimated Budget Breakdown</h4>
                      <p className="text-xs text-slate-400">
                        Optimized for {itinerary.category} travel tier (${itinerary.dailyBudget.toFixed(0)}/day)
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block">Total Est. Budget</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      ${itinerary.budget.toLocaleString()} USD
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-slate-400 block mb-1">🏨 Accommodation (40%)</span>
                    <span className="text-base font-bold text-white">
                      ${(itinerary.budget * 0.4).toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-slate-400 block mb-1">🍜 Dining & Food (25%)</span>
                    <span className="text-base font-bold text-white">
                      ${(itinerary.budget * 0.25).toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-slate-400 block mb-1">🎟️ Attractions & Tours (20%)</span>
                    <span className="text-base font-bold text-white">
                      ${(itinerary.budget * 0.2).toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                    <span className="text-slate-400 block mb-1">🚇 Local Transit (15%)</span>
                    <span className="text-base font-bold text-white">
                      ${(itinerary.budget * 0.15).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
