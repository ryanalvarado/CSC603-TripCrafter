import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
from mangum import Mangum

from models import TravelQuery, ItineraryResponse
from llm_service import generate_itinerary

load_dotenv()

app = FastAPI(title="TripCrafter API", version="1.0.0")

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = InferenceClient(token=os.getenv("HF_API_TOKEN"))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/generate-itinerary", response_model=ItineraryResponse)
def create_itinerary(query: TravelQuery):
    try:
        return generate_itinerary(query, client)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Lambda entry point
handler = Mangum(app, lifespan="off")
