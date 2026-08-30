import { TripFormData, TripResponse, TripGenerateResponse } from "@/types";
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
 * Mengambil seluruh daftar riwayat rencana perjalanan MILIK PENGGUNA yang sedang login.
 */
export async function getTrips(): Promise<TripResponse[]> {
  const res = await fetch(`${API_URL}/trips`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in to view your trips.");
    }
    throw new Error(`Failed to fetch trips (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Mengambil detail data perjalanan spesifik berdasarkan ID (dengan pengecekan hak akses).
 */
export async function getTrip(id: number): Promise<TripResponse> {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required. Please log in to view this trip.");
    }
    if (res.status === 403) {
      throw new Error("Forbidden: You do not have permission to access this trip itinerary.");
    }
    if (res.status === 404) {
      throw new Error(`Trip with ID #${id} was not found.`);
    }
    throw new Error(`Failed to fetch trip #${id} (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Membuat data perjalanan baru di database PostgreSQL yang diasosiasikan dengan user_id login.
 */
export async function createTrip(data: TripFormData): Promise<TripResponse> {
  const payload = {
    destination: data.destination.trim(),
    days: Number(data.days),
    budget: Number(data.budget),
    travel_style: data.travelStyle || "Standard",
  };

  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = `Failed to create trip (Status ${res.status})`;
    if (res.status === 401) {
      errorMessage = "Please log in first before creating a travel plan.";
    } else {
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((e: any) => e.msg || "").join(", ");
          }
        }
      } catch {
        // ignore json parse error
      }
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Alias createTrip yang dipelajari pada materi kursus.
 */
export async function generateTrip(data: TripFormData): Promise<TripResponse> {
  return createTrip(data);
}

/**
 * Menghasilkan rekomendasi AI (Amazon Bedrock) dan menyimpannya ke database untuk trip milik user.
 */
export async function generateItinerary(tripId: number): Promise<TripGenerateResponse> {
  const res = await fetch(`${API_URL}/trips/${tripId}/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    let errorMessage = `Failed to generate AI recommendation (Status ${res.status})`;
    if (res.status === 401) {
      errorMessage = "Authentication required. Please log in again.";
    } else if (res.status === 403) {
      errorMessage = "Forbidden: You cannot generate an itinerary for another user's trip.";
    } else {
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        // ignore json parse error
      }
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Menghapus data perjalanan dari database berdasarkan ID jika user memiliki hak kepemilikan.
 */
export async function deleteTrip(tripId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("Forbidden: You do not have permission to delete this trip.");
    }
    if (res.status === 401) {
      throw new Error("Please log in to perform this action.");
    }
    throw new Error(`Failed to delete trip #${tripId}`);
  }

  return res.json();
}
