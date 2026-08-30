"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  FolderOpen,
  Sparkles,
  LogOut,
  ShieldCheck,
  Calendar,
  Compass,
  ArrowRight,
  PlusCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
        <Navbar />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 mb-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              {/* User Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-sky-500 via-teal-400 to-emerald-400 flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-lg shadow-sky-500/25 shrink-0 uppercase select-none">
                {user?.name ? user.name.charAt(0) : "U"}
              </div>

              {/* User Details */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated Traveler
                </div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  {user?.name || "Traveler Profile"}
                </h1>
                <p className="text-sm text-slate-300 mt-1 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>{user?.email}</span>
                </p>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/30 text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5 text-sky-400" /> Total Itineraries
                </div>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">
                  {user?.total_trips ?? 0} Trips
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Account Security
                </div>
                <div className="text-xl sm:text-2xl font-black text-teal-400 mt-1">
                  JWT Verified
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Access
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">
                  Amazon Bedrock
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <Link
              href="/trips"
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 hover:border-sky-300 hover:shadow-lg transition-all group flex items-start justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                  My Trip History
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  View and manage your private travel plans stored securely in PostgreSQL.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all mt-2" />
            </Link>

            <Link
              href="/"
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 hover:border-teal-300 hover:shadow-lg transition-all group flex items-start justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                  Generate New Itinerary
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Create a customized daily travel schedule with Amazon Bedrock AI.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all mt-2" />
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
