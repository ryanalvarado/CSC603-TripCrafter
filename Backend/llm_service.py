import json
from datetime import datetime, timedelta

from google.genai import types

from models import TravelQuery, ItineraryResponse


MODEL_ID = "gemini-2.5-flash"

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

FALLBACK_DAILY_COSTS: dict[str, dict[str, int]] = {
    "paris": {"food": 75, "transport": 18, "activity": 35, "souvenir": 55},
    "tokyo": {"food": 55, "transport": 14, "activity": 28, "souvenir": 45},
    "bali": {"food": 32, "transport": 12, "activity": 25, "souvenir": 35},
    "nyc": {"food": 85, "transport": 22, "activity": 38, "souvenir": 50},
    "rome": {"food": 65, "transport": 15, "activity": 32, "souvenir": 45},
    "dubai": {"food": 70, "transport": 20, "activity": 45, "souvenir": 60},
    "barcelona": {"food": 60, "transport": 14, "activity": 30, "souvenir": 45},
    "maldives": {"food": 95, "transport": 35, "activity": 55, "souvenir": 65},
    "london": {"food": 80, "transport": 18, "activity": 35, "souvenir": 50},
    "santorini": {"food": 75, "transport": 18, "activity": 38, "souvenir": 50},
    "iceland": {"food": 90, "transport": 45, "activity": 55, "souvenir": 55},
    "sydney": {"food": 75, "transport": 18, "activity": 35, "souvenir": 50},
}

ACCOMMODATION_MULTIPLIERS: dict[str, float] = {
    "hostel": 0.35,
    "hotel": 1.0,
    "apartment": 0.85,
    "resort": 1.55,
    "villa": 1.9,
}

STYLE_MULTIPLIERS: dict[str, float] = {
    "relaxed": 0.9,
    "balanced": 1.0,
    "action-packed": 1.2,
}


def _round_dollars(value: float) -> int:
    return int(round(value))


def _scale_money(value: float, scale: float) -> int:
    return max(_round_dollars(value * scale), 0)


def _format_trip_date(start_date: str, offset: int) -> str:
    try:
        parsed = datetime.strptime(start_date, "%Y-%m-%d")
    except ValueError:
        return ""
    trip_date = parsed + timedelta(days=offset)
    return f"{trip_date.strftime('%B')} {trip_date.day}, {trip_date.year}"


def _format_iso_trip_date(start_date: str, offset: int) -> str:
    try:
        parsed = datetime.strptime(start_date, "%Y-%m-%d")
    except ValueError:
        return ""
    return (parsed + timedelta(days=offset)).strftime("%Y-%m-%d")


def _profile_for(query: TravelQuery) -> dict[str, int]:
    return FALLBACK_DAILY_COSTS.get(
        query.destination,
        {"food": 65, "transport": 18, "activity": 32, "souvenir": 45},
    )


def _ensure_itinerary_details(query: TravelQuery, data: dict) -> dict:
    for index, day in enumerate(data.get("itinerary", [])):
        if not isinstance(day, dict):
            continue
        day["date"] = day.get("date") or _format_trip_date(query.startDate, index)
        day["weather"] = day.get("weather") or "Check current local forecast"
        day["weather_note"] = day.get("weather_note") or "Plan was selected with current seasonal conditions in mind."
    return data


def _ensure_arrival_day_plan(data: dict) -> dict:
    itinerary = data.get("itinerary")
    if not isinstance(itinerary, list) or not itinerary:
        return data

    first_day = itinerary[0]
    if not isinstance(first_day, dict):
        return data

    activities = first_day.get("activities")
    if not isinstance(activities, list):
        activities = []

    evening_activities = [
        activity
        for activity in activities
        if isinstance(activity, dict) and str(activity.get("time", "")).lower() == "evening"
    ]
    if not evening_activities:
        evening_activities = [
            {
                "time": "Evening",
                "activity": "Arrival and hotel check-in",
                "description": "Keep the first day light because arrival is planned close to dinner time.",
                "cost_per_person": 0,
                "meal": "Welcome dinner near the accommodation",
                "meal_description": "Choose a nearby, well-reviewed local restaurant so the group can settle in without crossing town.",
                "meal_cost_per_person": 45,
            }
        ]

    first_day["title"] = first_day.get("title") or "Arrival and Welcome Dinner"
    first_day["activities"] = evening_activities[:1]
    return data


def _estimate_activity_cost(activity_name: str, default_cost: int) -> int:
    name = activity_name.lower()
    free_keywords = ["park", "garden", "beach", "walk", "square", "neighborhood", "market", "shrine"]
    premium_keywords = ["tour", "cruise", "show", "broadway", "helicopter", "spa", "diving", "workshop"]
    museum_keywords = ["museum", "gallery", "temple", "palace", "castle", "monument"]

    if any(keyword in name for keyword in free_keywords):
        return 0
    if any(keyword in name for keyword in premium_keywords):
        return _round_dollars(default_cost * 2.0)
    if any(keyword in name for keyword in museum_keywords):
        return _round_dollars(default_cost * 0.8)
    return default_cost


def _ensure_souvenir_recommendations(query: TravelQuery, data: dict) -> dict:
    dest = DESTINATION_NAMES.get(query.destination, query.destination)
    profile = _profile_for(query)
    raw_souvenirs = data.get("souvenirs")
    if not isinstance(raw_souvenirs, list):
        raw_souvenirs = []

    fallback_items = [
        {
            "item": f"Locally made keepsake from {dest}",
            "where_to_buy": "A reputable artisan market or independent shop near the main sightseeing area",
            "why_recommended": "It is easy to pack, locally distinctive, and more meaningful than a generic airport purchase.",
        },
        {
            "item": "Regional food gift or specialty snack",
            "where_to_buy": "A well-reviewed specialty grocer, department-store food hall, or local market",
            "why_recommended": "Food gifts are practical, shareable, and tied closely to the destination's everyday culture.",
        },
        {
            "item": "Small handmade accessory or home item",
            "where_to_buy": "A craft cooperative, museum shop, or design-focused local boutique",
            "why_recommended": "This gives the traveler a durable reminder of the trip while supporting local makers.",
        },
    ]

    normalized_souvenirs = []
    for index in range(3):
        raw = raw_souvenirs[index] if index < len(raw_souvenirs) and isinstance(raw_souvenirs[index], dict) else {}
        fallback = fallback_items[index]
        raw_cost = raw.get("estimated_cost_per_person")
        cost = raw_cost if isinstance(raw_cost, (int, float)) and raw_cost > 0 else profile["souvenir"] * [0.8, 1.0, 1.2][index]
        normalized_souvenirs.append(
            {
                "item": str(raw.get("item") or fallback["item"]),
                "where_to_buy": str(raw.get("where_to_buy") or fallback["where_to_buy"]),
                "estimated_cost_per_person": _round_dollars(cost),
                "why_recommended": str(raw.get("why_recommended") or fallback["why_recommended"]),
            }
        )

    data["souvenirs"] = normalized_souvenirs
    return data


def _normalize_activity_meal_sets(query: TravelQuery, data: dict) -> dict:
    profile = _profile_for(query)
    for day in data.get("itinerary", []):
        if not isinstance(day, dict):
            continue
        normalized = []
        for raw in day.get("activities", []):
            if not isinstance(raw, dict):
                continue
            time_label = str(raw.get("time") or "Activity")
            activity_name = str(raw.get("activity") or f"{time_label} activity")
            activity_cost = raw.get("cost_per_person")
            meal_cost = raw.get("meal_cost_per_person")
            normalized.append(
                {
                    "time": time_label,
                    "activity": activity_name,
                    "description": str(raw.get("description") or "Enjoy a destination-specific activity selected for this trip."),
                    "cost_per_person": _round_dollars(activity_cost)
                    if isinstance(activity_cost, (int, float)) and activity_cost >= 0
                    else _estimate_activity_cost(activity_name, profile["activity"]),
                    "meal": str(raw.get("meal") or f"{time_label} meal at a well-reviewed local restaurant"),
                    "meal_description": str(raw.get("meal_description") or "Choose a convenient local restaurant that fits the day's route."),
                    "meal_cost_per_person": _round_dollars(meal_cost)
                    if isinstance(meal_cost, (int, float)) and meal_cost >= 0
                    else profile["food"],
                }
            )
        day["activities"] = normalized
    return data


def _ensure_flight_recommendation(query: TravelQuery, data: dict) -> dict:
    dest = DESTINATION_NAMES.get(query.destination, query.destination)
    flight = data.get("flight")
    if not isinstance(flight, dict):
        flight = {}

    data["flight"] = {
        "airline": str(flight.get("airline") or "Best current option from Gemini Search"),
        "trip_type": "Round trip",
        "flight_number": str(flight.get("flight_number") or "Verify before booking"),
        "return_flight_number": str(flight.get("return_flight_number") or "Verify before booking"),
        "origin_airport": str(flight.get("origin_airport") or f"Major airport near {query.currentLocation}"),
        "destination_airport": str(flight.get("destination_airport") or f"Major airport for {dest}"),
        "route": str(flight.get("route") or f"{query.currentLocation} to {dest}"),
        "return_route": str(flight.get("return_route") or f"{dest} to {query.currentLocation}"),
        "outbound_date": str(flight.get("outbound_date") or query.startDate),
        "return_date": str(flight.get("return_date") or _format_iso_trip_date(query.startDate, max(query.duration - 1, 0))),
        "departure_time": str(flight.get("departure_time") or "Verify current schedule before booking"),
        "arrival_time": str(flight.get("arrival_time") or "Verify current schedule before booking"),
        "return_departure_time": str(flight.get("return_departure_time") or "Verify current schedule before booking"),
        "return_arrival_time": str(flight.get("return_arrival_time") or "Verify current schedule before booking"),
        "estimated_cost": _round_dollars(flight.get("estimated_cost")) if isinstance(flight.get("estimated_cost"), (int, float)) else 0,
        "price_note": str(flight.get("price_note") or "Current web-grounded estimate from Gemini; verify final fare and availability before booking."),
        "duration": str(flight.get("duration") or "Verify current flight duration before booking"),
        "stops": str(flight.get("stops") or "Verify current routing before booking"),
        "why_recommended": str(flight.get("why_recommended") or "Recommended from current route, schedule, and budget context."),
    }
    return data


def _ensure_accommodations(query: TravelQuery, data: dict) -> dict:
    options = data.get("accommodations")
    if not isinstance(options, list):
        options = []

    nights = max(query.duration - 1, 1)
    fallback_nightly = _round_dollars((query.budget / max(query.travelers, 1)) * 0.28 / nights)
    fallback_nightly = max(fallback_nightly * ACCOMMODATION_MULTIPLIERS.get(query.accommodation, 1.0), 35)
    fallback_names = [
        f"Current best-value {query.accommodation.title()} option",
        f"Well-located {query.accommodation.title()} option",
        f"Comfortable {query.accommodation.title()} alternative",
    ]

    normalized = []
    for index in range(3):
        raw = options[index] if index < len(options) and isinstance(options[index], dict) else {}
        nightly = raw.get("estimated_nightly_cost")
        total = raw.get("estimated_total_cost")
        if not isinstance(nightly, (int, float)) or nightly <= 0:
            nightly = fallback_nightly * [0.95, 1.0, 1.05][index]
        if not isinstance(total, (int, float)) or total <= 0:
            total = nightly * nights
        highlights = raw.get("highlights")
        if not isinstance(highlights, list) or not highlights:
            highlights = ["Good location", "Matches selected lodging style", "Verify current availability before booking"]
        normalized.append(
            {
                "name": str(raw.get("name") or fallback_names[index]),
                "type": str(raw.get("type") or query.accommodation.title()),
                "neighborhood": str(raw.get("neighborhood") or "Convenient area for the itinerary"),
                "estimated_nightly_cost": _round_dollars(nightly),
                "estimated_total_cost": _round_dollars(total),
                "highlights": [str(item) for item in highlights[:3]],
                "why_recommended": str(raw.get("why_recommended") or "Recommended because it fits the trip style, location needs, and budget."),
            }
        )

    data["accommodations"] = normalized
    return data


def _calculate_budget(query: TravelQuery, data: dict) -> dict:
    profile = _profile_for(query)
    style_multiplier = STYLE_MULTIPLIERS.get(query.travelStyle, 1.0)
    travelers = max(query.travelers, 1)

    activity_total = 0
    food = 0
    for day in data.get("itinerary", []):
        for item in day.get("activities", []):
            activity_total += item.get("cost_per_person", 0)
            meal_cost = item.get("meal_cost_per_person")
            food += meal_cost if isinstance(meal_cost, (int, float)) and meal_cost >= 0 else profile["food"]

    generated_days = max(len(data.get("itinerary", [])), 1)
    if query.duration > generated_days:
        activity_total += _round_dollars((activity_total / generated_days) * (query.duration - generated_days))
        food += _round_dollars((food / generated_days) * (query.duration - generated_days))
    if food <= 0:
        food = _round_dollars(profile["food"] * query.duration * style_multiplier)

    selected_accommodation = data.get("accommodations", [{}])[0]
    accommodation_total = selected_accommodation.get("estimated_total_cost")
    accommodation = accommodation_total / travelers if isinstance(accommodation_total, (int, float)) and accommodation_total > 0 else 0

    souvenirs = sum(
        souvenir.get("estimated_cost_per_person", 0)
        for souvenir in data.get("souvenirs", [])
        if isinstance(souvenir, dict)
    )
    local_transport = _round_dollars(profile["transport"] * query.duration * style_multiplier)
    flight_cost = data.get("flight", {}).get("estimated_cost")
    flights = flight_cost if isinstance(flight_cost, (int, float)) and flight_cost > 0 else 0

    total = _round_dollars(flights + accommodation + activity_total + souvenirs + food + local_transport)
    total_all_travelers = total * travelers
    budget_note = "Uses Gemini 2.5 Flash with Google Search grounding for current flight, lodging, restaurant, activity, souvenir, and weather context, then normalizes the budget to stay within the selected trip budget. Verify availability and final prices before booking."

    if query.budget > 0:
        target_group_total = query.budget * 0.9
        minimum_group_total = query.budget * 0.8
        maximum_group_total = query.budget * 0.95

        if total_all_travelers > maximum_group_total:
            scale = (maximum_group_total / travelers) / total if total > 0 else 1
            flights = _scale_money(flights, scale)
            accommodation = _scale_money(accommodation, scale)
            activity_total = _scale_money(activity_total, scale)
            souvenirs = _scale_money(souvenirs, scale)
            food = _scale_money(food, scale)
            local_transport = _scale_money(local_transport, scale)

            flight = data.get("flight", {})
            if isinstance(flight, dict) and isinstance(flight.get("estimated_cost"), (int, float)):
                flight["estimated_cost"] = flights
                flight["price_note"] = (
                    f"{flight.get('price_note', 'Current estimate; verify before booking.')} "
                    "Adjusted in the budget plan so the generated trip stays under the selected budget."
                )

            for option in data.get("accommodations", []):
                if not isinstance(option, dict):
                    continue
                option["estimated_total_cost"] = _scale_money(option.get("estimated_total_cost", 0), scale)
                option["estimated_nightly_cost"] = _scale_money(option.get("estimated_nightly_cost", 0), scale)

            for day in data.get("itinerary", []):
                for item in day.get("activities", []):
                    if not isinstance(item, dict):
                        continue
                    item["cost_per_person"] = _scale_money(item.get("cost_per_person", 0), scale)
                    item["meal_cost_per_person"] = _scale_money(item.get("meal_cost_per_person", 0), scale)

            for souvenir in data.get("souvenirs", []):
                if isinstance(souvenir, dict):
                    souvenir["estimated_cost_per_person"] = _scale_money(souvenir.get("estimated_cost_per_person", 0), scale)

            budget_note += " The model's raw estimate exceeded the selected budget, so category estimates were scaled down into a practical budget allocation."

        elif total_all_travelers < minimum_group_total:
            scale = (target_group_total / travelers) / total if total > 0 else 1
            accommodation = _scale_money(accommodation, scale)
            activity_total = _scale_money(activity_total, scale)
            souvenirs = _scale_money(souvenirs, scale)
            food = _scale_money(food, scale)
            local_transport = _scale_money(local_transport, scale)
            budget_note += " The model's raw estimate was below the 80% target, so flexible trip costs were adjusted toward a fuller but still capped budget plan."

        total = _round_dollars(flights + accommodation + activity_total + souvenirs + food + local_transport)
        total_all_travelers = min(total * travelers, query.budget)

    remaining_amount = max(query.budget - total_all_travelers, 0)

    data["budget_breakdown"] = {
        "flights": _round_dollars(flights),
        "accommodation": _round_dollars(accommodation),
        "activities": _round_dollars(activity_total),
        "souvenirs": _round_dollars(souvenirs),
        "food": _round_dollars(food),
        "local_transport": _round_dollars(local_transport),
        "total": total,
        "total_all_travelers": _round_dollars(total_all_travelers),
        "remaining_amount": _round_dollars(remaining_amount),
        "currency": "USD",
        "cost_basis": budget_note,
    }
    return data


def build_prompt(query: TravelQuery) -> str:
    dest = DESTINATION_NAMES.get(query.destination, query.destination)
    num_days = min(query.duration, 7)
    return f"""Generate a detailed, natural, web-grounded TripCrafter itinerary.

Trip Details:
- Current location/origin: {query.currentLocation}
- First day of trip: {query.startDate}
- Destination: {dest}
- Duration: {query.duration} days
- Travelers: {query.travelers} {"person" if query.travelers == 1 else "people"}
- Total budget for all travelers: ${query.budget:,}
- Accommodation: {query.accommodation}
- Travel style/pace: {query.travelStyle}
- Trip types: {", ".join(query.tripType)}
- Preferred activities: {", ".join(query.activities)}

Research requirements:
1. Use Google Search grounding for current flight routes, realistic flight durations, accommodation prices, restaurant/meals, attraction prices, souvenirs, and weather/seasonal conditions.
2. Prefer realistic durations over optimistic defaults. For example, San Francisco to Tokyo should be treated as a long-haul transpacific flight, not a 6-hour flight.
3. Do not invent guaranteed availability. Use current estimates and tell the user to verify before booking.
4. Be concise. Return only the fields in the schema with compact descriptions.

Planning instructions:
0. Use at least 80 % of budget in total for itinerary.
1. Generate a day-by-day itinerary for {num_days} days.
2. Day 1 should assume arrival close to dinner time. Include only one Evening set with light check-in/arrival activity and dinner.
3. Days 2 and later must have Morning, Afternoon, and Evening sets.
4. Every Morning/Afternoon/Evening set must include both a separate activity and a separate meal recommendation.
5. Meal recommendations must name a real restaurant, food hall, market, or specific cuisine option suitable for that time of day.
6. Activity recommendations must be different from meal recommendations and should name real places, neighborhoods, landmarks, tours, museums, shops, or experiences.
7. Include weather and a weather-aware plan for each day.
8. Recommend exactly 3 accommodation options matching the selected accommodation type.
9. Recommend exactly 3 souvenirs with where to buy each item and estimated cost per person.
10. Treat the selected budget as the total budget for all travelers combined. Plan the full group trip to land between 80% and 95% of ${query.budget:,}; never exceed ${query.budget:,}.
11. Include realistic USD estimates for flight, lodging, activities, meals, local transport, and souvenirs. Choose lower-cost alternatives when a category would push the total above budget.
12. Do not repeat the same activity in the trip.


Respond with ONLY valid JSON, no markdown, matching this schema:
{{
  "destination_name": "{dest}",
  "summary": "A 2-3 sentence overview of the trip",
  "insights": {{
    "why_perfect": "2-3 sentences on why this destination matches the traveler's preferences",
    "recommendations": ["tip 1", "tip 2", "tip 3"]
  }},
  "flight": {{
    "airline": "Specific airline name or best current airline option",
    "trip_type": "Round trip",
    "flight_number": "Current/plausible flight number or Verify before booking",
    "return_flight_number": "Current/plausible return flight number or Verify before booking",
    "origin_airport": "Airport code and full name",
    "destination_airport": "Airport code and full name",
    "route": "{query.currentLocation} to {dest}",
    "return_route": "{dest} to {query.currentLocation}",
    "outbound_date": "{query.startDate}",
    "return_date": "{_format_iso_trip_date(query.startDate, max(query.duration - 1, 0))}",
    "departure_time": "Example: 11:30 AM",
    "arrival_time": "Example: 3:05 PM next day",
    "return_departure_time": "Example: 5:45 PM",
    "return_arrival_time": "Example: 10:30 AM same day",
    "estimated_cost": 1100,
    "price_note": "Current estimate; verify final fare and availability before booking.",
    "duration": "Example: 11h 15m",
    "stops": "Nonstop or 1 stop",
    "why_recommended": "Why this is a realistic option for the route and budget"
  }},
  "accommodations": [
    {{
      "name": "Accommodation name",
      "type": "{query.accommodation}",
      "neighborhood": "Area or neighborhood",
      "estimated_nightly_cost": 180,
      "estimated_total_cost": 1080,
      "highlights": ["highlight 1", "highlight 2", "highlight 3"],
      "why_recommended": "Why this option fits the traveler"
    }}
  ],
  "souvenirs": [
    {{
      "item": "Souvenir item",
      "where_to_buy": "Specific market, store, neighborhood, or museum shop",
      "estimated_cost_per_person": 45,
      "why_recommended": "Why this is meaningful and practical for this destination"
    }}
  ],
  "cultural_tips": {{
    "phrases": [
      {{"phrase": "local phrase", "meaning": "English meaning", "context": "when/how to use it"}}
    ],
    "etiquette": ["tip 1", "tip 2", "tip 3"]
  }},
  "itinerary": [
    {{
      "day": 1,
      "date": "Trip date in Month D, YYYY format",
      "weather": "Main expected weather, e.g. Light rain, Sunny, Cloudy",
      "weather_note": "How the itinerary accounts for weather",
      "title": "Day theme title",
      "activities": [
        {{
          "time": "Evening",
          "activity": "Arrival and hotel check-in",
          "description": "Activity description",
          "cost_per_person": 0,
          "meal": "Restaurant or meal recommendation",
          "meal_description": "Meal description and why it fits",
          "meal_cost_per_person": 45
        }}
      ]
    }}
  ],
  "budget_breakdown": {{
    "flights": 0,
    "accommodation": 0,
    "activities": 0,
    "souvenirs": 0,
    "food": 0,
    "local_transport": 0,
    "total": {query.budget // max(query.travelers, 1)},
    "total_all_travelers": {query.budget},
    "remaining_amount": 0,
    "currency": "USD",
    "cost_basis": "Gemini web-grounded estimate"
  }}
}}"""


def _parse_json_response(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0]
    raw = raw.strip()
    if not raw.startswith("{"):
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            raw = raw[start : end + 1]
    return json.loads(raw)


def generate_itinerary(query: TravelQuery, client) -> ItineraryResponse:
    prompt = build_prompt(query)
    grounding_tool = types.Tool(google_search=types.GoogleSearch())
    config = types.GenerateContentConfig(
        system_instruction="You are TripCrafter, a careful travel planner. Return valid JSON only.",
        tools=[grounding_tool],
        temperature=0.35,
        top_p=0.8,
        max_output_tokens=6000,
        thinking_config=types.ThinkingConfig(thinking_budget=0),
    )

    response = client.models.generate_content(
        model=MODEL_ID,
        contents=prompt,
        config=config,
    )

    data = _parse_json_response(response.text or "")
    data = _ensure_itinerary_details(query, data)
    data = _ensure_arrival_day_plan(data)
    data = _normalize_activity_meal_sets(query, data)
    data = _ensure_flight_recommendation(query, data)
    data = _ensure_accommodations(query, data)
    data = _ensure_souvenir_recommendations(query, data)
    data = _calculate_budget(query, data)
    return ItineraryResponse(**data)
