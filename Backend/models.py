from pydantic import BaseModel


class TravelQuery(BaseModel):
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


class ItineraryDay(BaseModel):
    day: int
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


class BudgetBreakdown(BaseModel):
    flights: int
    accommodation: int
    activities: int
    food: int
    total: int


class ItineraryResponse(BaseModel):
    destination_name: str
    summary: str
    insights: Insights
    cultural_tips: CulturalTips
    itinerary: list[ItineraryDay]
    budget_breakdown: BudgetBreakdown
