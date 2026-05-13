"""
TripCrafter API — FastAPI application.

Orchestrates the agent pipeline:
  1. Retrieve destination knowledge via RAG
  2. Call external tools (weather API)
  3. Generate itinerary with enriched context

Author: Ryan Alvarado
"""

import logging
import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
from mangum import Mangum

from llm_service import generate_itinerary
from models import TravelQuery, ItineraryResponse
from tools import call_tools

load_dotenv()

log = logging.getLogger("tripcrafter")

app = FastAPI(title="TripCrafter API", version="1.0.0")

_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = InferenceClient(
    base_url="https://router.huggingface.co/v1",
    token=os.getenv("HF_API_TOKEN"),
)

# RAG is optional — sentence-transformers + faiss are heavy dependencies
# that may not be available in all deployment environments (e.g. Lambda).
try:
    from rag_service import RAGService

    rag = RAGService()
    log.info("RAG service loaded with %d chunks", len(rag.chunks))
except ImportError:
    rag = None
    log.warning("RAG dependencies not available — running without RAG")


@app.get("/api/health")
def health():
    return {"status": "ok", "rag_enabled": rag is not None}


@app.post("/api/generate-itinerary", response_model=ItineraryResponse)
def create_itinerary(query: TravelQuery):
    try:
        # ── Agent step 1: Retrieve destination knowledge (RAG) ──
        rag_context = ""
        if rag:
            search_query = (
                f"{query.destination} {' '.join(query.activities)} "
                f"{query.accommodation} {query.travelStyle}"
            )
            rag_context = rag.retrieve(search_query, top_k=4)

        # ── Agent step 2: Call external tools (weather API) ──
        tool_results = call_tools(query.destination, query.duration)

        # ── Agent step 3: Generate itinerary with enriched context ──
        return generate_itinerary(query, client, rag_context, tool_results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Lambda entry point
handler = Mangum(app, lifespan="off")
