import { TripFormData, TripResponse, TripGenerateResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createTrip(data: TripFormData): Promise<TripResponse> {
  const payload = {
    destination: data.destination.trim(),
    days: Number(data.days),
    budget: Number(data.budget),
  };

  const response = await fetch(`${API_BASE_URL}/api/v1/trips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = `Failed to create trip (Status ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (typeof errorData.detail === "string") {
          errorMessage = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err: { msg?: string }) => err.msg || "").join(", ");
        }
      }
    } catch {
      // JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function generateItinerary(tripId: number): Promise<TripGenerateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `Failed to generate AI recommendation (Status ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // JSON parse error
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getTrip(tripId: number): Promise<TripResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/trips/${tripId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch trip #${tripId}`);
  }
  return response.json();
}

export async function getTrips(): Promise<TripResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/trips`);
  if (!response.ok) {
    throw new Error("Failed to fetch trips list");
  }
  return response.json();
}
