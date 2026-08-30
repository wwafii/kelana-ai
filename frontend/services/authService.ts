import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = RAW_API_URL.endsWith("/api/v1")
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, "")}/api/v1`;

const TOKEN_KEY = "kelana_auth_token";
const USER_KEY = "kelana_auth_user";

/**
 * Mendapatkan token autentikasi JWT yang tersimpan di localStorage browser.
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Menyimpan JWT token ke localStorage browser.
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

/**
 * Menghapus token dari localStorage saat logout.
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore
  }
}

/**
 * Mengambil data user yang di-cache di localStorage browser.
 */
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Menyimpan data user ke localStorage browser.
 */
export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

/**
 * Mendaftarkan akun baru ke backend REST API.
 */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: credentials.name.trim(),
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  if (!res.ok) {
    let errorMsg = `Registration failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data.detail) {
        errorMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const result: AuthResponse = await res.json();
  setAuthToken(result.access_token);
  setStoredUser(result.user);
  return result;
}

/**
 * Melakukan proses login user ke REST API dan menyimpan token JWT.
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  if (!res.ok) {
    let errorMsg = "Invalid email or password";
    try {
      const data = await res.json();
      if (data.detail) {
        errorMsg = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  const result: AuthResponse = await res.json();
  setAuthToken(result.access_token);
  setStoredUser(result.user);
  return result;
}

/**
 * Mengambil informasi user profile saat ini berdasarkan token JWT.
 */
export async function getCurrentUser(tokenOverride?: string): Promise<User> {
  const token = tokenOverride || getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      removeAuthToken();
      throw new Error("Session expired. Please log in again.");
    }
    throw new Error(`Failed to fetch user profile (Status ${res.status})`);
  }

  const user: User = await res.json();
  setStoredUser(user);
  return user;
}

/**
 * Menghapus token dan sesi login pengguna.
 */
export function logout(): void {
  removeAuthToken();
}
