"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, MapPin, ArrowRight, ShieldCheck, Zap, Bot } from "lucide-react";

interface HeroProps {
  onSelectQuickDestination: (dest: string, days: number, budget: number, style: string) => void;
  onScrollToForm: () => void;
}

const QUICK_DESTINATIONS = [
  { name: "Tokyo, Japan", days: 5, budget: 2000, style: "Standard", flag: "🇯🇵" },
  { name: "Bali, Indonesia", days: 4, budget: 800, style: "Backpacker", flag: "🇮🇩" },
  { name: "Paris, France", days: 6, budget: 3200, style: "Luxury", flag: "🇫🇷" },
  { name: "Seoul, South Korea", days: 5, budget: 1800, style: "Standard", flag: "🇰🇷" },
  { name: "Kyoto, Japan", days: 4, budget: 1500, style: "Standard", flag: "🇯🇵" },
  { name: "Swiss Alps, Switzerland", days: 7, budget: 4500, style: "Luxury", flag: "🇨🇭" },
];

export default function Hero({ onSelectQuickDestination, onScrollToForm }: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 mb-8 bg-slate-900 text-white shadow-2xl">
      {/* Background Hero Image with Gradients */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop"
          alt="Majestic Travel Destination - Mount Fuji & Pagoda, Japan"
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Multi-layered Vignette Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16 sm:py-20 lg:py-24 text-left">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Powered by Amazon Bedrock
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-emerald-400" /> Instant Structured Itineraries
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-4">
          Discover the World with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-300">
            Intelligent AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed mb-8">
          Enter your dream destination, budget, and trip duration. KelanaAI crafts a personalized,
          day-by-day travel itinerary with morning, afternoon, and evening recommendations in seconds.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
          <button
            onClick={onScrollToForm}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-sky-300 via-teal-200 to-emerald-300 hover:brightness-110 shadow-lg shadow-sky-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Bot className="w-5 h-5 text-slate-900" /> Plan Your Next Trip
            <ArrowRight className="w-4 h-4 text-slate-900" />
          </button>
          <a
            href="#destinations"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md transition-all"
          >
            <MapPin className="w-4 h-4 text-teal-400" /> Explore Destinations
          </a>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <span>Popular Suggestions:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_DESTINATIONS.map((item) => (
              <button
                key={item.name}
                onClick={() =>
                  onSelectQuickDestination(item.name, item.days, item.budget, item.style)
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-sky-500/30 border border-white/10 hover:border-sky-400/50 text-slate-200 hover:text-white transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>{item.flag}</span>
                <span>{item.name}</span>
                <span className="text-slate-400">({item.days}d · ${item.budget})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
