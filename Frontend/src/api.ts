export interface TravelQuery {
  destination: string;
  tripType: string[];
  budget: number;
  duration: number;
  travelers: number;
  accommodation: string;
  activities: string[];
  travelStyle: string;
}

export interface Activity {
  time: string;
  activity: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Phrase {
  phrase: string;
  meaning: string;
  context: string;
}

export interface CulturalTips {
  phrases: Phrase[];
  etiquette: string[];
}

export interface Insights {
  why_perfect: string;
  recommendations: string[];
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  activities: number;
  food: number;
  total: number;
}

export interface ItineraryResponse {
  destination_name: string;
  summary: string;
  insights: Insights;
  cultural_tips: CulturalTips;
  itinerary: ItineraryDay[];
  budget_breakdown: BudgetBreakdown;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export async function generateItinerary(query: TravelQuery): Promise<ItineraryResponse> {
  const res = await fetch(`${API_BASE}/api/generate-itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to generate itinerary" }));
    throw new Error(err.detail ?? `Server error ${res.status}`);
  }

  return res.json();
}
