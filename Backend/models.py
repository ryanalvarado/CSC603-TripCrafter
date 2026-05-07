from pydantic import BaseModel, Field


class TravelQuery(BaseModel):
    currentLocation: str = "San Francisco, CA"
    startDate: str = ""
    destination: str
    tripType: list[str]
    budget: int
    duration: int
    travelers: int
    accommodation: str
    activities: list[str]
    travelStyle: str


class Activity(BaseModel):
    time: str
    activity: str
    description: str
    cost_per_person: int = 0
    meal: str
    meal_description: str
    meal_cost_per_person: int = 0


class ItineraryDay(BaseModel):
    day: int
    date: str = ""
    weather: str = ""
    weather_note: str = ""
    title: str
    activities: list[Activity]


class Phrase(BaseModel):
    phrase: str
    meaning: str
    context: str


class CulturalTips(BaseModel):
    phrases: list[Phrase]
    etiquette: list[str]


class Insights(BaseModel):
    why_perfect: str
    recommendations: list[str]


class FlightRecommendation(BaseModel):
    airline: str
    trip_type: str = "Round trip"
    flight_number: str = ""
    return_flight_number: str = ""
    origin_airport: str = ""
    destination_airport: str = ""
    route: str
    return_route: str = ""
    outbound_date: str = ""
    return_date: str = ""
    departure_time: str = ""
    arrival_time: str = ""
    return_departure_time: str = ""
    return_arrival_time: str = ""
    estimated_cost: int
    price_note: str = ""
    duration: str
    stops: str
    why_recommended: str


class AccommodationOption(BaseModel):
    name: str
    type: str
    neighborhood: str
    estimated_nightly_cost: int
    estimated_total_cost: int
    highlights: list[str]
    why_recommended: str


class SouvenirRecommendation(BaseModel):
    item: str
    where_to_buy: str
    estimated_cost_per_person: int
    why_recommended: str


class BudgetBreakdown(BaseModel):
    flights: int
    accommodation: int
    activities: int
    souvenirs: int = 0
    food: int
    local_transport: int = 0
    total: int
    total_all_travelers: int = 0
    remaining_amount: int = 0
    currency: str = "USD"
    cost_basis: str = ""


class ItineraryResponse(BaseModel):
    destination_name: str
    summary: str
    insights: Insights
    flight: FlightRecommendation
    accommodations: list[AccommodationOption]
    souvenirs: list[SouvenirRecommendation] = Field(default_factory=list)
    cultural_tips: CulturalTips
    itinerary: list[ItineraryDay]
    budget_breakdown: BudgetBreakdown
