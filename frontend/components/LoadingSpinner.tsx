"use client";

import React from "react";
import { Sparkles, Bot, Compass, BrainCircuit } from "lucide-react";

interface LoadingSpinnerProps {
  destination?: string;
}

export default function LoadingSpinner({ destination }: LoadingSpinnerProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-teal-950 text-white rounded-3xl p-8 sm:p-12 text-center shadow-2xl border border-sky-500/20 relative overflow-hidden">
        {/* Background glow animations */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Center Spinner Animation */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-20 h-20 rounded-full border-4 border-sky-500/20 border-t-sky-400 border-r-teal-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-sky-300 animate-pulse" />
          </div>
        </div>

        {/* Status text matching Slide 13 */}
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          Generating itinerary...
        </h3>
        <p className="text-sky-300 font-semibold text-base sm:text-lg mb-4 flex items-center justify-center gap-2">
          <Bot className="w-5 h-5 text-teal-300 animate-bounce" />
          Amazon Bedrock is thinking.
        </p>

        {destination && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs sm:text-sm text-slate-200 backdrop-blur-md mb-6">
            <span>Crafting personalized travel plan for:</span>
            <span className="font-bold text-white">{destination}</span>
          </div>
        )}

        {/* Progress steps animation */}
        <div className="max-w-md mx-auto grid grid-cols-3 gap-3 text-xs text-slate-400 border-t border-white/10 pt-6">
          <div className="flex flex-col items-center gap-1.5 text-sky-300">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Analyzing Budget</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-teal-300">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping delay-150" />
            <span>Structuring Days</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping delay-300" />
            <span>Local Curations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
