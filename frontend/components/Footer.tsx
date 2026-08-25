"use client";

import React from "react";
import { Compass, Sparkles, Heart, ExternalLink, GitBranch } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white font-bold shadow-md shadow-sky-500/20">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Kelana<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              Your personalized AI travel companion. Building smarter itineraries with Next.js, Python FastAPI, PostgreSQL, and Amazon Bedrock.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Sparkles className="w-3 h-3 text-sky-400" /> Next.js 15
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                FastAPI
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Amazon Bedrock
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#planner" className="hover:text-sky-400 transition-colors">
                  Plan Itinerary
                </a>
              </li>
              <li>
                <a href="#destinations" className="hover:text-sky-400 transition-colors">
                  Explore Destinations
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-sky-400 transition-colors">
                  How KelanaAI Works
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors inline-flex items-center gap-1"
                >
                  Swagger API <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Project */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              About & Legal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-sky-400 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/wwafii/kelana-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-400 transition-colors inline-flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KelanaAI. All rights reserved. Built with Python, Next.js & Amazon Bedrock.</p>
          <p className="flex items-center gap-1">
            Giving KelanaAI a Face · Session 6
          </p>
        </div>
      </div>
    </footer>
  );
}
