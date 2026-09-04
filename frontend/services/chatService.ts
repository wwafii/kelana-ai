import {
  Conversation,
  ChatMessage,
  ConversationDetail,
  CreateConversationRequest,
  SendMessageRequest,
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
 * Mengambil daftar seluruh percakapan milik pengguna yang sedang login.
 */
export async function getConversations(): Promise<Conversation[]> {
  const res = await fetch(`${API_URL}/conversations`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in to view chat history.");
    }
    throw new Error(`Failed to fetch conversations (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Membuat sesi percakapan baru.
 */
export async function createConversation(title?: string): Promise<Conversation> {
  const payload: CreateConversationRequest = { title: title || "New Trip Chat" };
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in to start a conversation.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to create conversation (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Mengambil detail percakapan beserta riwayat lengkap seluruh pesan di dalamnya.
 */
export async function getConversation(id: number): Promise<ConversationDetail> {
  const res = await fetch(`${API_URL}/conversations/${id}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in.");
    }
    if (res.status === 403) {
      throw new Error("Forbidden: You do not have permission to access this conversation.");
    }
    if (res.status === 404) {
      throw new Error(`Conversation #${id} was not found.`);
    }
    throw new Error(`Failed to fetch conversation #${id} (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Mengambil daftar pesan riwayat untuk percakapan tertentu.
 */
export async function getConversationMessages(id: number): Promise<ChatMessage[]> {
  const res = await fetch(`${API_URL}/conversations/${id}/messages`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in.");
    }
    if (res.status === 403) {
      throw new Error("Forbidden: You do not have permission to view these messages.");
    }
    throw new Error(`Failed to fetch messages (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Mengirim pesan baru ke percakapan dan mendapatkan balasan AI context-aware dari Amazon Bedrock.
 */
export async function sendChatMessage(
  conversationId: number,
  content: string
): Promise<ChatMessage> {
  const payload: SendMessageRequest = { content };
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in.");
    }
    if (res.status === 403) {
      throw new Error("Forbidden: You do not have permission to chat in this conversation.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to send message (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Mengubah judul sesi percakapan (Rename).
 */
export async function renameConversation(
  id: number,
  title: string
): Promise<Conversation> {
  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in.");
    }
    if (res.status === 403) {
      throw new Error("Forbidden: You do not have permission to rename this conversation.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Failed to rename conversation (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Menghapus sesi percakapan dan seluruh riwayat pesannya.
 */
export async function deleteConversation(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/conversations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in.");
    }
    if (res.status === 403) {
      throw new Error("Forbidden: You do not have permission to delete this conversation.");
    }
    throw new Error(`Failed to delete conversation #${id} (Status ${res.status})`);
  }
}
