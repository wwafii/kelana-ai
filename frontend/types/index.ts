export interface TripFormData {
  destination: string;
  days: number;
  budget: number;
  travelStyle: string;
}

export interface TripResponse {
  id: number;
  destination: string;
  days: number;
  budget: floatNumber;
  category: "Backpacker" | "Standard" | "Luxury" | string;
  daily_budget: number;
  ai_recommendation?: string | null;
}

type floatNumber = number;

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
