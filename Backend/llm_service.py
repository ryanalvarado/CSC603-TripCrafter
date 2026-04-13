import json

from huggingface_hub import InferenceClient

from models import TravelQuery, ItineraryResponse


# Open-source model hosted free on HuggingFace Inference API
MODEL_ID = "Qwen/Qwen2.5-72B-Instruct"

DESTINATION_NAMES: dict[str, str] = {
    "paris": "Paris, France",
    "tokyo": "Tokyo, Japan",
    "bali": "Bali, Indonesia",
    "nyc": "New York City, USA",
    "rome": "Rome, Italy",
    "dubai": "Dubai, UAE",
    "barcelona": "Barcelona, Spain",
    "maldives": "Maldives",
    "london": "London, England",
    "santorini": "Santorini, Greece",
    "iceland": "Iceland",
    "sydney": "Sydney, Australia",
}


def build_prompt(query: TravelQuery) -> str:
    dest = DESTINATION_NAMES.get(query.destination, query.destination)
    num_days = min(query.duration, 7)
    return f"""You are TripCrafter, an expert AI travel planner. Generate a detailed, personalized travel itinerary.

Trip Details:
- Destination: {dest}
- Duration: {query.duration} days
- Travelers: {query.travelers} {"person" if query.travelers == 1 else "people"}
- Budget: ${query.budget:,} per person
- Accommodation: {query.accommodation}
- Travel style/pace: {query.travelStyle}
- Trip types: {", ".join(query.tripType)}
- Preferred activities: {", ".join(query.activities)}

Instructions:
1. Generate a day-by-day itinerary for {num_days} days.
2. Each day must have exactly 3 activities: Morning, Afternoon, and Evening.
3. Make activities specific to {dest} with real place names, neighborhoods, and landmarks.
4. Tailor the pace to "{query.travelStyle}" (relaxed = leisurely, action-packed = intense).
5. Include cultural tips: 4-5 essential local phrases with pronunciation context and 3-4 etiquette tips.
6. Provide a realistic budget breakdown where flights + accommodation + activities + food = {query.budget}.
7. Write an insights section explaining why this destination is perfect for these preferences.

Respond with ONLY valid JSON (no markdown, no explanation) matching this schema:
{{
  "destination_name": "{dest}",
  "summary": "A 2-3 sentence overview of the trip",
  "insights": {{
    "why_perfect": "2-3 sentences on why this destination matches the traveler's preferences",
    "recommendations": ["tip 1", "tip 2", "tip 3"]
  }},
  "cultural_tips": {{
    "phrases": [
      {{"phrase": "local phrase", "meaning": "English meaning", "context": "when/how to use it"}}
    ],
    "etiquette": ["tip 1", "tip 2", "tip 3"]
  }},
  "itinerary": [
    {{
      "day": 1,
      "title": "Day theme title",
      "activities": [
        {{"time": "Morning", "activity": "Activity name", "description": "1-2 sentence description"}},
        {{"time": "Afternoon", "activity": "Activity name", "description": "1-2 sentence description"}},
        {{"time": "Evening", "activity": "Activity name", "description": "1-2 sentence description"}}
      ]
    }}
  ],
  "budget_breakdown": {{
    "flights": 0,
    "accommodation": 0,
    "activities": 0,
    "food": 0,
    "total": {query.budget}
  }}
}}"""


def generate_itinerary(query: TravelQuery, client: InferenceClient) -> ItineraryResponse:
    prompt = build_prompt(query)

    response = client.chat_completion(
        model=MODEL_ID,
        messages=[
            {
                "role": "system",
                "content": "You are a travel planning assistant. Respond with valid JSON only. No markdown fences, no extra text.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=4000,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown fences if the model wraps them
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()

    data = json.loads(raw)
    return ItineraryResponse(**data)
