export interface User {
  id: number;
  name: string;
  email: string;
  total_trips?: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TripFormData {
  destination: string;
  days: number;
  budget: number;
  travelStyle: string;
}

export interface TripResponse {
  id: number;
  user_id?: number;
  destination: string;
  days: number;
  budget: number;
  category: "Backpacker" | "Standard" | "Luxury" | string;
  daily_budget: number;
  travel_style?: string | null;
  ai_recommendation?: string | null;
}

export interface TripGenerateResponse {
  trip_id: number;
  destination: string;
  recommendation: string;
}

export interface DailyPlan {
  dayNumber: number;
  title: string;
  morning: string[];
  afternoon: string[];
  evening: string[];
}

export interface ParsedItinerary {
  destination: string;
  daysCount: number;
  budget: number;
  dailyBudget: number;
  category: string;
  travelStyle?: string;
  dailyPlans: DailyPlan[];
  travelTips: string[];
  foodRecommendations: string[];
  rawText: string;
}

export interface DestinationCard {
  name: string;
  country: string;
  image: string;
  description: string;
  suggestedDays: number;
  estimatedBudget: number;
  category: string;
  tag: string;
}

export type TripSortOption =
  | "latest"
  | "oldest"
  | "budget-desc"
  | "budget-asc"
  | "duration-desc"
  | "duration-asc";

export type CategoryFilter = "ALL" | "Backpacker" | "Standard" | "Luxury";
export type TravelStyleFilter = "ALL" | "Family" | "Solo" | "Couple";
