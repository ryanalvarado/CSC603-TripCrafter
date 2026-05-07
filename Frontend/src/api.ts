export interface TravelQuery {
  currentLocation: string;
  startDate: string;
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
  cost_per_person: number;
  meal: string;
  meal_description: string;
  meal_cost_per_person: number;
}

export interface ItineraryDay {
  day: number;
  date: string;
  weather: string;
  weather_note: string;
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

export interface FlightRecommendation {
  airline: string;
  trip_type: string;
  flight_number: string;
  return_flight_number: string;
  origin_airport: string;
  destination_airport: string;
  route: string;
  return_route: string;
  outbound_date: string;
  return_date: string;
  departure_time: string;
  arrival_time: string;
  return_departure_time: string;
  return_arrival_time: string;
  estimated_cost: number;
  price_note: string;
  duration: string;
  stops: string;
  why_recommended: string;
}

export interface AccommodationOption {
  name: string;
  type: string;
  neighborhood: string;
  estimated_nightly_cost: number;
  estimated_total_cost: number;
  highlights: string[];
  why_recommended: string;
}

export interface SouvenirRecommendation {
  item: string;
  where_to_buy: string;
  estimated_cost_per_person: number;
  why_recommended: string;
}

export interface BudgetBreakdown {
  flights: number;
  accommodation: number;
  activities: number;
  souvenirs: number;
  food: number;
  local_transport: number;
  total: number;
  total_all_travelers: number;
  remaining_amount: number;
  currency: string;
  cost_basis: string;
}

export interface ItineraryResponse {
  destination_name: string;
  summary: string;
  insights: Insights;
  flight: FlightRecommendation;
  accommodations: AccommodationOption[];
  souvenirs: SouvenirRecommendation[];
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
