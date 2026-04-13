import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient

from models import TravelQuery, ItineraryResponse
from llm_service import generate_itinerary

load_dotenv()

app = FastAPI(title="TripCrafter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
