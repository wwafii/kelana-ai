"use client";

import React from "react";
import { AlertCircle, RefreshCw, ServerOff, ArrowLeft } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const isServerDown =
    message.toLowerCase().includes("failed to fetch") ||
    message.toLowerCase().includes("networkerror") ||
    message.toLowerCase().includes("connection");

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 my-8 animate-fade-in">
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 sm:p-8 text-center shadow-md">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          {isServerDown ? (
            <ServerOff className="w-7 h-7" />
          ) : (
            <AlertCircle className="w-7 h-7" />
          )}
        </div>

        <h3 className="text-xl font-bold text-rose-900 mb-2">
          Unable to generate itinerary
        </h3>

        <p className="text-sm text-rose-700 max-w-md mx-auto mb-6">
          {message || "An unexpected error occurred while communicating with the server. Please try again."}
        </p>

        {isServerDown && (
          <div className="bg-white/80 border border-rose-200 rounded-xl p-3.5 mb-6 text-xs text-rose-800 text-left max-w-md mx-auto">
            <p className="font-semibold mb-1">💡 Troubleshooting tip:</p>
            <p>Ensure the FastAPI backend server is running on <code className="bg-rose-100 px-1 py-0.5 rounded font-mono">http://localhost:8000</code>.</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Please try again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
