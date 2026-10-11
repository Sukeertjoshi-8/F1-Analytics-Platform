from typing import Optional
from datetime import datetime
from fastapi import APIRouter, Query, HTTPException
from models.schemas import CalendarResponse
from services.fastf1_service import fastf1_service

router = APIRouter(prefix="/calendar", tags=["Calendar"])


@router.get("", response_model=CalendarResponse)
@router.get("/", response_model=CalendarResponse)
async def get_race_calendar(year: Optional[int] = Query(default=None, description="Season championship year")):
    """
    Fetch the Formula 1 race calendar and session schedule for the given or current season.
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
        raise HTTPException(status_code=500, detail=f"Failed to retrieve race calendar: {str(e)}")


@router.get("/{year}", response_model=CalendarResponse)
async def get_calendar_by_year(year: int):
    """
    Fetch the Formula 1 race calendar for a specific season year.
    """
    try:
        events = fastf1_service.get_calendar(year)
        return CalendarResponse(
            year=year,
            total_events=len(events),
            events=events
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve race calendar for {year}: {str(e)}")
