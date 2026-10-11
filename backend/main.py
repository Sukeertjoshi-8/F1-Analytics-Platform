import logging
from datetime import datetime
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from api import calendar_router, telemetry_router, strategy_router
from models.schemas import CalendarResponse
from services.fastf1_service import fastf1_service

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("f1_platform.main")

app = FastAPI(
    title="F1 Analytics & Prediction API",
    description="High-performance async API for Formula 1 real-time telemetry, race calendar, and predictive strategy modeling.",
    version="1.0.0",
)

# CORS Configuration for React Frontend
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
            "telemetry": "/api/telemetry/compare",
            "strategy_tire": "/api/strategy/tire-degradation",
            "strategy_pit": "/api/strategy/pit-probability",
            "docs": "/docs",
        }
    }


# Direct calendar endpoint in main.py fulfilling Step 4.1
@app.get("/api/calendar", response_model=CalendarResponse, tags=["Calendar"])
async def get_f1_calendar(year: Optional[int] = Query(default=None, description="Season championship year")):
    """
    Direct endpoint in main.py to fetch the current year's F1 race calendar using fastf1.
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
