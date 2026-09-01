"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  askAssistant,
  compareAssistant,
  getKnowledgeDocuments,
} from "@/services/assistantService";
import {
  AssistantQuestionResponse,
  AssistantCompareResponse,
  KnowledgeDocumentInfo,
} from "@/types";
import {
  Sparkles,
  BookOpen,
  Send,
  HelpCircle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw,
} from "lucide-react";

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [activeTab, setActiveTab] = useState<"rag" | "compare">("rag");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ragResult, setRagResult] = useState<AssistantQuestionResponse | null>(null);
  const [compareResult, setCompareResult] = useState<AssistantCompareResponse | null>(null);
  const [documents, setDocuments] = useState<KnowledgeDocumentInfo[]>([]);

  // 5 Preset Questions dari tugas Sesi 9
  const presetQuestions = [
    "Do Indonesian passport holders need a visa to visit Japan?",
    "What are the rules and limits for bringing medication into Japan (Yakkan Shoumei)?",
    "Is chewing gum allowed in Singapore and what is the penalty fine?",
    "What is the instant tax refund minimum purchase threshold in South Korea?",
    "What are the oversized luggage dimensions and reservation rules for Shinkansen trains in Japan?",
  ];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await getKnowledgeDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      console.error("Failed to load knowledge documents:", err);
    }
  };

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    if (queryText) {
      setQuestion(queryText);
    }

    setLoading(true);
    setError(null);

    try {
      if (activeTab === "rag") {
        const res = await askAssistant({ question: q, mode: "rag" });
        setRagResult(res);
      } else {
        const res = await compareAssistant(q);
        setCompareResult(res);
      }
    } catch (err: any) {
      setError(err.message || "Failed to get an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-vh-100 flex flex-col bg-slate-50 text-slate-800 antialiased min-h-screen">
        <Navbar />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-100/80 text-sky-800 border border-sky-200 mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Session 09 · RAG with Amazon Bedrock Knowledge Base</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              KelanaAI <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">Travel Assistant</span>
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              Ask travel questions and get accurate answers grounded in verified knowledge documents with source citations.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-2 shadow-inner border border-slate-300/60 max-w-md w-full">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("rag");
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "rag"
                    ? "bg-white text-sky-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Grounded RAG
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("compare");
                  setError(null);
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === "compare"
                    ? "bg-white text-sky-700 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Layers className="w-4 h-4 text-sky-600" />
                Compare (RAG vs Base)
              </button>
            </div>
          </div>

          {/* Question Input Box */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 mb-8">
            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              Ask a Travel Question (Visas, Customs, Baggage, Transit & Policies)
            </label>

            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="Type your travel question here... (e.g., Do I need a visa to visit Japan?)"
                rows={3}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-slate-800 placeholder-slate-400 text-sm sm:text-base transition-all resize-none shadow-sm"
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3 px-5 py-2.5 bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-700 hover:to-teal-600 text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching Docs...</span>
                  </>
                ) : (
                  <>
                    <span>Ask KelanaAI</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Preset Question Pills */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Test Questions (Session 9):
              </p>
              <div className="flex flex-wrap gap-2">
                {presetQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAsk(q)}
                    className="text-left text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-slate-700 font-medium px-3 py-1.5 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 opacity-60 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <p>{error}</p>
            </div>
          )}

          {/* RESULTS DISPLAY */}
          {activeTab === "rag" && ragResult && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 mb-10 transition-all">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Grounded AI Answer</h3>
                    <p className="text-xs text-slate-500">Verified with Amazon Bedrock Knowledge Base</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  RAG Grounded
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Question</p>
                <p className="text-sm sm:text-base font-semibold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {ragResult.question}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Answer</p>
                <div className="text-sm sm:text-base text-slate-700 leading-relaxed bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 whitespace-pre-line">
                  {ragResult.answer}
                </div>
              </div>

              {/* Source Citations */}
              {ragResult.sources && ragResult.sources.length > 0 && (
                <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-100">
                  <p className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-sky-600" /> Source Citations (Trusted Documents):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ragResult.sources.map((src, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-sky-800 text-xs font-medium rounded-lg border border-sky-200 shadow-sm"
                      >
                        <FileText className="w-3.5 h-3.5 text-sky-500" />
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SIDE BY SIDE COMPARISON DISPLAY */}
          {activeTab === "compare" && compareResult && (
            <div className="space-y-6 mb-10">
              <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-200/80">
                <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-600" /> Side-by-Side Comparison Analysis
                </h3>
                <p className="text-xs text-slate-500 mb-4">Question: &ldquo;{compareResult.question}&rdquo;</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Base Model (No KB) */}
                  <div className="bg-rose-50/40 rounded-2xl p-5 border border-rose-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200">
                          Base Model (LLM Only)
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">Without Knowledge Base</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-white/80 p-4 rounded-xl border border-rose-100">
                        {compareResult.base_model.answer}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-rose-200/60 text-xs text-rose-600 font-medium">
                      ⚠️ No source documents cited • Potential cutoff / outdated info
                    </div>
                  </div>

                  {/* Grounded RAG (With KB) */}
                  <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                          Grounded RAG (With KB)
                        </span>
                        <span className="text-[11px] text-emerald-700 font-medium">Amazon Bedrock KB</span>
                      </div>
                      <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-4 rounded-xl border border-emerald-100">
                        {compareResult.rag.answer}
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-emerald-200/60">
                      <p className="text-[11px] font-bold text-emerald-800 mb-1">Sources Cited:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {compareResult.rag.sources.map((s, i) => (
                          <span key={i} className="text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-semibold">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 leading-relaxed">
                  <span className="font-bold">Evaluation Summary: </span>
                  {compareResult.comparison_summary}
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE KNOWLEDGE BASE DOCUMENTS OVERVIEW */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Active Knowledge Documents in KB
                  </h2>
                  <p className="text-xs text-slate-500">
                    {documents.length} verified travel guides indexed for RAG retrieval
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                S3 Synced
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-sky-600 flex-shrink-0" />
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                        {doc.filename}
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {(doc.size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                    {doc.title}
                  </p>
                  {doc.topics && doc.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {doc.topics.slice(0, 3).map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                      {doc.topics.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{doc.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
