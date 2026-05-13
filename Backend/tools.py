"""
External tool integrations for the TripCrafter agent.

Provides real-time data (weather forecasts) via public APIs to ground
LLM-generated itineraries in factual, up-to-date information.

Author: Ryan Alvarado
"""

import requests

DESTINATION_COORDS: dict[str, tuple[float, float]] = {
    "paris": (48.8566, 2.3522),
    "tokyo": (35.6762, 139.6503),
    "bali": (-8.3405, 115.0920),
    "nyc": (40.7128, -74.0060),
    "rome": (41.9028, 12.4964),
    "dubai": (25.2048, 55.2708),
    "barcelona": (41.3874, 2.1686),
    "maldives": (3.2028, 73.2207),
    "london": (51.5074, -0.1278),
    "santorini": (36.3932, 25.4615),
    "iceland": (64.1466, -21.9426),
    "sydney": (-33.8688, 151.2093),
}


def get_weather_forecast(destination: str, days: int = 7) -> str | None:
    coords = DESTINATION_COORDS.get(destination)
    if not coords:
        return None

    lat, lon = coords
    try:
        resp = requests.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
                "timezone": "auto",
                "forecast_days": min(days, 7),
            },
            timeout=5,
        )
        resp.raise_for_status()
    except requests.RequestException:
        return None

    daily = resp.json().get("daily", {})
    dates = daily.get("time", [])
    highs = daily.get("temperature_2m_max", [])
    lows = daily.get("temperature_2m_min", [])
    rain = daily.get("precipitation_probability_max", [])

    lines = ["Real-time weather forecast (from Open-Meteo API):"]
    for i, date in enumerate(dates):
        lines.append(
            f"  {date}: {lows[i]:.0f}°C – {highs[i]:.0f}°C, "
            f"{rain[i]}% precipitation chance"
        )
    return "\n".join(lines)


def call_tools(destination: str, days: int = 7) -> str:
    results: list[str] = []

    weather = get_weather_forecast(destination, days)
    if weather:
        results.append(weather)

    return "\n\n".join(results)
