"use client";

import React from "react";
import { Sparkles, BrainCircuit, Database, Layers, ShieldCheck, MapPin } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/70 mb-3">
          <Layers className="w-3.5 h-3.5 text-sky-600" /> Architecture & Capabilities
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          How KelanaAI Creates Your Journey
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          End-to-end synergy between Next.js React frontend, Python FastAPI backend, and Amazon Bedrock Generative AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Step 1 */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 hover:bg-white hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-5 font-black text-lg">
            1
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            1. User Preference & Budget
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Provide your destination, length of stay, and total budget. The system normalizes currency and calculates daily allowances in real-time.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 hover:bg-white hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center mb-5 font-black text-lg">
            2
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            2. Amazon Bedrock AI Reasoning
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            FastAPI prompts Amazon Bedrock using AWS Converse API to engineer personalized morning, afternoon, and evening daily itineraries.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-8 hover:bg-white hover:shadow-lg transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 font-black text-lg">
            3
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            3. Structured Visual Presentation
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            The AI recommendation is saved to PostgreSQL and formatted into an elegant, responsive web UI with food spots and travel tips.
          </p>
        </div>
      </div>
    </section>
  );
}
