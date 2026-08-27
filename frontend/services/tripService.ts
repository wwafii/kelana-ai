import { TripFormData, TripResponse, TripGenerateResponse } from "@/types";

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_URL = RAW_API_URL.endsWith("/api/v1")
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/+$/, "")}/api/v1`;

/**
 * Mengambil seluruh daftar riwayat rencana perjalanan dari PostgreSQL via FastAPI.
 */
export async function getTrips(): Promise<TripResponse[]> {
  const res = await fetch(`${API_URL}/trips`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch trips (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Mengambil detail data perjalanan spesifik berdasarkan ID.
 */
export async function getTrip(id: number): Promise<TripResponse> {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Trip with ID #${id} was not found`);
    }
    throw new Error(`Failed to fetch trip #${id} (Status ${res.status})`);
  }

  return res.json();
}

/**
 * Membuat data perjalanan baru di database PostgreSQL.
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = `Failed to create trip (Status ${res.status})`;
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
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Alias generateTrip yang dipelajari pada Slide Sesi 7.
 */
export async function generateTrip(data: TripFormData): Promise<TripResponse> {
  return createTrip(data);
}

/**
 * Menghasilkan rekomendasi AI (Amazon Bedrock) dan menyimpannya ke database.
 */
export async function generateItinerary(tripId: number): Promise<TripGenerateResponse> {
  const res = await fetch(`${API_URL}/trips/${tripId}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    let errorMessage = `Failed to generate AI recommendation (Status ${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

/**
 * Menghapus data perjalanan dari database berdasarkan ID.
 */
export async function deleteTrip(tripId: number): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/trips/${tripId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to delete trip #${tripId}`);
  }

  return res.json();
}
