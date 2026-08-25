"use client";

import React, { useState } from "react";
import { Compass, Sparkles, MapPin, Menu, X, BookOpen, Layers } from "lucide-react";

interface NavbarProps {
  onPlanClick?: () => void;
  onExploreClick?: () => void;
}

export default function Navbar({ onPlanClick, onExploreClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-bold">
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
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
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
            <a
              href="#destinations"
              onClick={(e) => {
                if (onExploreClick) {
                  e.preventDefault();
                  onExploreClick();
                }
              }}
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            >
              <MapPin className="w-4 h-4 text-teal-500" /> Popular Destinations
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-emerald-500" /> How It Works
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-700 hover:text-sky-600 transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-slate-400" /> API Docs
            </a>
          </nav>

          {/* Action Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onPlanClick}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 shadow-sm shadow-sky-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" /> Start Planning
            </button>
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
          <a
            href="#planner"
            onClick={() => {
              setMobileMenuOpen(false);
              onPlanClick?.();
            }}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
          >
            ✦ Plan Itinerary
          </a>
          <a
            href="#destinations"
            onClick={() => {
              setMobileMenuOpen(false);
              onExploreClick?.();
            }}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
          >
            ✦ Popular Destinations
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
          >
            ✦ How It Works
          </a>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-800 hover:bg-sky-50 hover:text-sky-700"
          >
            ✦ FastAPI Swagger Docs
          </a>
          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onPlanClick?.();
              }}
              className="w-full py-2.5 px-4 text-center font-semibold rounded-xl text-white bg-gradient-to-r from-sky-600 to-teal-600 shadow-sm"
            >
              Start Planning Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
