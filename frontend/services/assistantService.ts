import {
  AssistantQuestionRequest,
  AssistantQuestionResponse,
  AssistantCompareResponse,
  KnowledgeDocumentListResponse,
} from "@/types";
import { getAuthToken } from "@/services/authService";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = RAW_API_URL.endsWith("/api/v1")
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, "")}/api/v1`;

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
  * Mengajukan pertanyaan ke KelanaAI Travel Assistant (RAG Grounded / Base Model).
  */
export async function askAssistant(
  data: AssistantQuestionRequest
): Promise<AssistantQuestionResponse> {
  const res = await fetch(`${API_URL}/assistant`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to query AI Assistant (Status ${res.status})`
    );
  }

  return res.json();
}

/**
  * Membandingkan jawaban Base Model vs RAG (Side-by-Side Comparison).
  */
export async function compareAssistant(
  question: string
): Promise<AssistantCompareResponse> {
  const res = await fetch(`${API_URL}/assistant/compare`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to compare AI responses (Status ${res.status})`
    );
  }

  return res.json();
}

/**
  * Mengambil daftar seluruh dokumen yang tersinkronisasi di Knowledge Base.
  */
export async function getKnowledgeDocuments(): Promise<KnowledgeDocumentListResponse> {
  const res = await fetch(`${API_URL}/assistant/documents`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch documents (Status ${res.status})`);
  }

  return res.json();
}
