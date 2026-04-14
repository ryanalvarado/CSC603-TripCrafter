# TripCrafter

An AI-powered travel planning web app that generates personalized itineraries with cultural tips, budget breakdowns, and day-by-day plans. Built as a capstone project for CSC 603 — GenAI: Fundamentals & Apps (Spring 2026).

**Repository:** https://github.com/ryanalvarado/CSC603-TripCrafter

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic |
| LLM | Qwen2.5-72B-Instruct (open-source, via HuggingFace Inference API) |

## Prerequisites

- **Node.js** v18+ — [Download](https://nodejs.org/)
- **Python** 3.10+ — [Download](https://www.python.org/downloads/)
- **HuggingFace API Token** (free) — [Get one here](https://huggingface.co/settings/tokens)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ryanalvarado/CSC603-TripCrafter.git
cd CSC603-TripCrafter
```

### 2. Start the Backend

```bash
cd Backend
pip install -r requirements.txt
```

Create a `.env` file in the `Backend/` folder with your HuggingFace token:

```
HF_API_TOKEN=hf_your-token-here
```

To get a free token:
1. Create a free account at [huggingface.co](https://huggingface.co)
2. Go to **Settings > Access Tokens**
3. Click **Create new token**, select **Read** access, and copy it

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be running at `http://localhost:8000`. You can verify by visiting `http://localhost:8000/api/health`.

### 3. Start the Frontend

Open a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

The app will be running at `http://localhost:5173`. Open this URL in your browser.

## How It Works

1. **Select a destination** from 12 popular travel locations
2. **Choose your trip preferences** — trip type, travel pace
3. **Set your budget** using the slider ($500–$10,000)
4. **Pick travel details** — duration, number of travelers, accommodation type
5. **Select activities** you want to experience
6. **Click "Generate My Trip"** — the backend sends your preferences to the Qwen2.5-72B-Instruct LLM, which returns a personalized itinerary with cultural tips and budget breakdown

## Project Structure

```
CSC603-TripCrafter/
├── Frontend/          # React + Vite app
│   └── src/
│       └── app/
│           └── components/
│               ├── TravelPlannerInterface.tsx   # Main 5-step wizard
│               ├── DestinationSelector.tsx
│               ├── PreferencesSelector.tsx
│               ├── BudgetSelector.tsx
│               ├── TravelDetailsSelector.tsx
│               ├── ActivitySelector.tsx
│               └── LLMResponse.tsx              # Results display
├── Backend/           # FastAPI server
│   ├── main.py        # API endpoints + CORS config
│   ├── models.py      # Pydantic request/response schemas
│   ├── llm_service.py # HuggingFace LLM integration + prompt engineering
│   └── requirements.txt
└── README.md
```

## Team

- **Ryan Alvarado** — Backend, LLM integration, prompt engineering
- **Josh Gonzo** — Frontend UI/UX, React components
- **Yuya** — Design feedback, project direction
