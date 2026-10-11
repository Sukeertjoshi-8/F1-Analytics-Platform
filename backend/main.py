import os
import logging
from datetime import datetime
from typing import Optional, Dict, Any
import fastf1
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api import calendar_router, telemetry_router, strategy_router
from models.schemas import CalendarResponse
from services.fastf1_service import fastf1_service, get_latest_session_data
from services.strategy_engine import (
    strategy_engine,
    calculate_tire_degradation,
    get_pit_window,
)

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("f1_platform.main")

# Step 1: Configure FastF1 caching globally
cache_dir = "f1_cache"
if not os.path.exists(cache_dir):
    parent_cache = os.path.join(os.path.dirname(os.path.dirname(__file__)), "f1_cache")
    if os.path.exists(parent_cache):
        cache_dir = parent_cache
    else:
        os.makedirs(cache_dir, exist_ok=True)
try:
    fastf1.Cache.enable_cache(cache_dir)
    logger.info(f"FastF1 cache enabled globally at: {cache_dir}")
except Exception as e:
    logger.warning(f"FastF1 cache configuration notice: {e}")

app = FastAPI(
    title="F1 Analytics & Prediction API",
    description="High-performance async API for Formula 1 real-time telemetry, race calendar, and predictive strategy modeling.",
    version="1.0.0",
)

# Step 4.4: CORS Configuration for React Frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register modular sub-routers
app.include_router(calendar_router, prefix="/api")
app.include_router(telemetry_router, prefix="/api")
app.include_router(strategy_router, prefix="/api")


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": "Formula 1 Analytics & Prediction Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "endpoints": {
            "calendar": "/api/calendar",
            "live_timing": "/api/live-timing",
            "strategy_degradation": "/api/strategy/degradation?compound=SOFT&laps=15",
            "telemetry": "/api/telemetry/compare",
            "docs": "/docs",
        }
    }


# Direct calendar endpoint in main.py
@app.get("/api/calendar", response_model=CalendarResponse, tags=["Calendar"])
async def get_f1_calendar(year: Optional[int] = Query(default=None, description="Season championship year")):
    """
    Direct endpoint to fetch the F1 race calendar using fastf1.
    """
    target_year = year or datetime.now().year
    try:
        events = fastf1_service.get_calendar(target_year)
        return CalendarResponse(
            year=target_year,
            total_events=len(events),
            events=events
        )
    except Exception as e:
        logger.error(f"Error fetching calendar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Step 4.2: Direct endpoint GET /api/live-timing
@app.get("/api/live-timing", tags=["Live Timing"])
async def get_live_timing_endpoint(year: Optional[int] = Query(default=2024, description="Championship season year")):
    """
    Fetches the most recent completed race session leaderboard and timing data using FastF1.
    """
    try:
        data = get_latest_session_data(year=year or 2024)
        return data
    except Exception as e:
        logger.error(f"Error in live-timing endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch live timing: {str(e)}")


# Step 4.3: Direct endpoint GET /api/strategy/degradation
@app.get("/api/strategy/degradation", tags=["Strategy"])
async def get_strategy_degradation_endpoint(
    compound: str = Query(default="MEDIUM", description="Tire compound: SOFT, MEDIUM, HARD, INTERMEDIATE, WET"),
    laps: int = Query(default=20, ge=1, le=80, description="Stint lap age"),
    track_temp: Optional[float] = Query(default=35.0, description="Track surface temperature in Celsius"),
):
    """
    Calculates simulated tire degradation pace delta (time penalty in seconds) based on lap age and compound.
    """
    try:
        result = calculate_tire_degradation(
            compound=compound,
            current_laps=laps,
            track_temp=track_temp or 35.0,
        )
        return result
    except Exception as e:
        logger.error(f"Error calculating tire degradation: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Bonus Undercut Pit Window Endpoint
@app.get("/api/strategy/undercut", tags=["Strategy"])
async def get_undercut_endpoint(
    driver: str = Query(default="NOR", description="3-letter driver code (e.g., NOR, VER, LEC)"),
):
    """
    Analyzes gaps in the latest session to determine undercut viability and percentage.
    """
    try:
        result = get_pit_window(driver_abbreviation=driver)
        return result
    except Exception as e:
        logger.error(f"Error analyzing undercut: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
