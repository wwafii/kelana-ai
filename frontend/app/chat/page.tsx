"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  getConversations,
  createConversation,
  getConversation,
  sendChatMessage,
  renameConversation,
  deleteConversation,
} from "@/services/chatService";
import { Conversation, ChatMessage } from "@/types";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Edit2,
  Sparkles,
  Bot,
  User as UserIcon,
  ChevronRight,
  Menu,
  X,
  Check,
  Clock,
  Compass,
  CornerDownLeft,
  AlertCircle,
} from "lucide-react";

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rename modal / inline edit state
  const [editingConvId, setEditingConvId] = useState<number | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auto-scroll references
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstLoadRef = useRef<boolean>(true);

  // Quick suggestion prompts for empty chat
  const promptSuggestions = [
    {
      title: "Liburan 5 Hari ke Jepang",
      desc: "Rencana perjalanan Tokyo & Kyoto untuk keluarga",
      prompt: "Buatkan rencana perjalanan santai 5 hari ke Tokyo dan Kyoto untuk keluarga dengan anggaran menengah.",
    },
    {
      title: "Kuliner Halal di Singapore",
      desc: "Rekomendasi spot makanan halal & transit",
      prompt: "Rekomendasikan tempat kuliner halal terbaik di Singapore dan tips transportasi menggunakan SimplyGo.",
    },
    {
      title: "Backpacking Hemat ke Vietnam",
      desc: "Hanoi ke Da Nang dengan budget terjangkau",
      prompt: "Bagikan tips backpacking hemat di Vietnam dari Hanoi ke Da Nang, termasuk estimasi budget harian.",
    },
    {
      title: "Regulasi Bagasi & Tax Refund",
      desc: "Aturan Shinkansen & bebas pajak Korea",
      prompt: "Bagaimana regulasi ukuran bagasi besar di Shinkansen Jepang dan batas minimal instant tax refund di Korea Selatan?",
    },
  ];

  // ==========================================
  // Auto-scroll Implementation (UX Win 2)
  // Skenario 1: Scroll ke bawah saat membuka percakapan pertama kali
  // Skenario 2: Scroll ke bawah saat mengirimkan pesan & menerima respons AI
  // ==========================================
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      if (isFirstLoadRef.current) {
        // Skenario 1: Scroll otomatis langsung ke paling bawah saat pertama kali pesan dimuat
        scrollToBottom("auto");
        isFirstLoadRef.current = false;
      } else {
        // Skenario 2: Scroll smooth saat pesan baru ditambahkan atau AI selesai membalas
        scrollToBottom("smooth");
      }
    }
  }, [messages, isSending]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async (autoSelectLatest = true) => {
    try {
      setIsLoadingList(true);
      setError(null);
      const list = await getConversations();
      setConversations(list);

      if (list.length > 0 && autoSelectLatest) {
        // Select the first (latest) conversation
        selectConversation(list[0].id);
      } else if (list.length === 0) {
        // Automatically create a fresh conversation if none exist
        await handleNewChat(false);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat daftar percakapan");
    } finally {
      setIsLoadingList(false);
    }
  };

  const selectConversation = async (convId: number) => {
    setSelectedConvId(convId);
    setMobileSidebarOpen(false);
    isFirstLoadRef.current = true; // Trigger Skenario 1 auto-scroll on conversation change
    try {
      setIsLoadingMessages(true);
      setError(null);
      const detail = await getConversation(convId);
      setMessages(detail.messages || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat riwayat pesan");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewChat = async (shouldSelect = true) => {
    try {
      setError(null);
      const newConv = await createConversation("New Trip Chat");
      setConversations((prev) => [newConv, ...prev]);
      if (shouldSelect) {
        setSelectedConvId(newConv.id);
        setMessages([]);
        isFirstLoadRef.current = true;
        setMobileSidebarOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat sesi percakapan baru");
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || !selectedConvId || isSending) return;

    setInputText("");
    setError(null);

    // Optimistically add user message to UI
    const optimisticUserMsg: ChatMessage = {
      id: Date.now(),
      conversation_id: selectedConvId,
      role: "user",
      content: messageContent,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsSending(true);

    // Skenario 2: Auto-scroll segera setelah user menekan tombol kirim
    setTimeout(() => scrollToBottom("smooth"), 50);

    try {
      const aiReply = await sendChatMessage(selectedConvId, messageContent);
      setMessages((prev) => {
        // Replace optimistic user msg or append AI reply
        return [...prev, aiReply];
      });

      // Update title in sidebar if it was updated automatically
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedConvId && c.title === "New Trip Chat") {
            const shortSnippet =
              messageContent.slice(0, 40) + (messageContent.length > 40 ? "..." : "");
            return { ...c, title: shortSnippet };
          }
          return c;
        })
      );
    } catch (err: any) {
      setError(err.message || "Gagal mendapatkan balasan dari KelanaAI");
    } finally {
      setIsSending(false);
    }
  };

  const handleStartRename = (conv: Conversation, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingConvId(conv.id);
    setEditTitleInput(conv.title);
  };

  const handleSaveRename = async (convId: number) => {
    if (!editTitleInput.trim() || isRenaming) return;
    setIsRenaming(true);
    try {
      const updated = await renameConversation(convId, editTitleInput.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: updated.title } : c))
      );
      setEditingConvId(null);
    } catch (err: any) {
      setError(err.message || "Gagal mengubah nama percakapan");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus percakapan ini?")) return;

    try {
      await deleteConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);

      if (selectedConvId === convId) {
        if (remaining.length > 0) {
          selectConversation(remaining[0].id);
        } else {
          handleNewChat(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghapus percakapan");
    }
  };

  // Helper formatting timestamp (UX Win 4)
  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const activeConversation = conversations.find((c) => c.id === selectedConvId);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />

        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          {/* Main Chat Container Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col md:flex-row overflow-hidden min-h-[620px] max-h-[85vh]">
            
            {/* ==========================================
                LEFT SIDEBAR: Conversation History (Core Challenge)
               ========================================== */}
            <aside
              className={`
                fixed inset-y-0 left-0 z-40 w-72 bg-slate-900 text-slate-100 flex flex-col
                transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              `}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold tracking-tight text-white">KelanaAI Memory</h2>
                    <p className="text-[11px] text-slate-400">Multi-Turn History</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="md:hidden text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* New Chat Button */}
              <div className="p-3">
                <button
                  onClick={() => handleNewChat(true)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  Percakapan Baru
                </button>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
                {isLoadingList ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Memuat riwayat percakapan...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Belum ada percakapan. Mulai obrolan pertama Anda!
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = conv.id === selectedConvId;
                    const isEditing = editingConvId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => selectConversation(conv.id)}
                        className={`
                          group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all
                          ${
                            isSelected
                              ? "bg-slate-800 text-white font-semibold border-l-4 border-sky-400 shadow-sm"
                              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          }
                        `}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                          <MessageSquare
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                            }`}
                          />

                          {isEditing ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleSaveRename(conv.id);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1 w-full"
                            >
                              <input
                                type="text"
                                value={editTitleInput}
                                onChange={(e) => setEditTitleInput(e.target.value)}
                                autoFocus
                                className="w-full bg-slate-950 text-white text-xs px-2 py-1 rounded border border-sky-500 focus:outline-none"
                              />
                              <button
                                type="submit"
                                disabled={isRenaming}
                                className="text-emerald-400 hover:text-emerald-300 p-0.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingConvId(null)}
                                className="text-slate-400 hover:text-slate-300 p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          ) : (
                            <div className="truncate flex-1">
                              <span className="truncate block font-medium">{conv.title}</span>
                              <span className="text-[10px] text-slate-400 block">
                                {new Date(conv.created_at).toLocaleDateString([], {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons (Rename & Delete) */}
                        {!isEditing && (
                          <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => handleStartRename(conv, e)}
                              title="Ganti Nama Percakapan"
                              className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-700/60"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              title="Hapus Percakapan"
                              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/60"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sidebar Footer */}
              <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                Amazon Bedrock • Converse API
              </div>
            </aside>

            {/* Mobile backdrop */}
            {mobileSidebarOpen && (
              <div
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-xs"
              />
            )}

            {/* ==========================================
                MAIN CHAT AREA
               ========================================== */}
            <main className="flex-1 flex flex-col bg-slate-50/50 min-w-0">
              
              {/* HEADER (UX Win 1: Conversation Title) */}
              <header className="px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="md:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                    title="Buka Riwayat Obrolan"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1
                        className="text-base sm:text-lg font-bold text-slate-900 truncate"
                        title={activeConversation?.title || "Percakapan"}
                      >
                        {activeConversation?.title || "Percakapan Baru"}
                      </h1>
                      {activeConversation && (
                        <button
                          onClick={() => handleStartRename(activeConversation)}
                          className="text-slate-400 hover:text-sky-600 p-1 rounded hover:bg-slate-100 transition-colors"
                          title="Ganti Judul Percakapan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
                      <span>Bedrock Generative AI • Sesi 10 Conversational Memory</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                    Context-Aware
                  </span>
                </div>
              </header>

              {/* Error Banner if any */}
              {error && (
                <div className="mx-4 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-semibold underline ml-2"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* MESSAGES LIST AREA */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
                {isLoadingMessages ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                    <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">
                      Memuat riwayat percakapan dari database...
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  /* Empty state with prompt pills */
                  <div className="max-w-xl mx-auto py-8 text-center space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-teal-500 to-emerald-400 mx-auto flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-slate-900">
                        Halo! Ada yang bisa KelanaAI bantu?
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                        KelanaAI kini mengingat seluruh konteks percakapan Anda. Anda dapat mengajukan
                        rencana liburan dan menanyakannya lebih detail (misalnya: <i>&quot;Bagaimana dengan Hari ke-2?&quot;</i>).
                      </p>
                    </div>

                    {/* Suggestion prompt cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                      {promptSuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(item.prompt)}
                          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-md transition-all text-xs group"
                        >
                          <div className="font-bold text-slate-800 group-hover:text-sky-600 flex items-center justify-between">
                            <span>{item.title}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isUser = msg.role === "user";

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {/* Assistant Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                            <Bot className="w-4 h-4" />
                          </div>
                        )}

                        <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                          {/* Role label & Sender Name */}
                          <div className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                            {isUser ? "Anda" : "KelanaAI Assistant"}
                          </div>

                          {/* Message Bubble */}
                          <div
                            className={`
                              p-4 rounded-2xl text-sm leading-relaxed shadow-xs
                              ${
                                isUser
                                  ? "bg-gradient-to-r from-sky-600 to-teal-600 text-white rounded-tr-xs"
                                  : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-slate-100"
                              }
                            `}
                          >
                            <div className="whitespace-pre-wrap break-words font-normal">
                              {msg.content}
                            </div>

                            {/* TIMESTAMP (UX Win 4: Timestamp for each message) */}
                            <div
                              className={`
                                text-[10px] mt-2 flex items-center gap-1 font-medium
                                ${isUser ? "text-sky-100 justify-end" : "text-slate-400 justify-end"}
                              `}
                            >
                              <Clock className="w-2.5 h-2.5 opacity-70" />
                              <span>{formatTimestamp(msg.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* User Avatar */}
                        {isUser && (
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                            <UserIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* ==========================================
                    TYPING INDICATOR (UX Win 3)
                   ========================================== */}
                {isSending && (
                  <div className="flex gap-3 justify-start animate-fade-in">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col items-start max-w-[85%] sm:max-w-[75%]">
                      <div className="text-[11px] font-semibold text-slate-400 mb-1 px-1">
                        KelanaAI Assistant
                      </div>

                      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-700 rounded-tl-xs shadow-xs flex items-center gap-3">
                        {/* Animated Bouncing Dots */}
                        <div className="flex items-center gap-1.5 py-1">
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                        </div>
                        <span className="text-xs text-slate-500 font-medium">
                          KelanaAI sedang berpikir & menyusun rekomendasi...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Target node for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT BAR */}
              <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2 max-w-4xl mx-auto"
                >
                  <div className="flex-1 relative">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Tanyakan rencana trip, rekomendasi kuliner, atau pertanyaan lanjutan (Enter untuk kirim)..."
                      rows={1}
                      disabled={isSending}
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-100 min-h-[44px] max-h-32 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="h-11 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 hover:from-sky-500 hover:to-teal-400 disabled:from-slate-300 disabled:to-slate-300 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 disabled:shadow-none transition-all disabled:cursor-not-allowed shrink-0"
                  >
                    {isSending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="hidden sm:inline">Kirim</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                  <CornerDownLeft className="w-3 h-3" />
                  <span>Tekan Enter untuk kirim pesan, Shift+Enter untuk membuat baris baru.</span>
                </div>
              </div>

            </main>
          </div>
        </div>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
