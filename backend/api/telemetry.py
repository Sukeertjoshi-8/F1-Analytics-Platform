from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from models.schemas import TelemetryComparisonResponse
from services.fastf1_service import fastf1_service

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])


@router.get("/compare", response_model=TelemetryComparisonResponse)
async def compare_telemetry(
    year: int = Query(default=2024, description="Season year"),
    round_number: int = Query(default=1, description="Round number"),
    session_type: str = Query(default="Q", description="Session type: FP1, FP2, FP3, Q, SQ, R"),
    driver_1: str = Query(default="VER", description="First driver code (e.g. VER, HAM, LEC)"),
    driver_2: Optional[str] = Query(default="NOR", description="Second driver code (e.g. NOR, PIA)"),
):
    """
    Compare speed, throttle, braking, and gear telemetry for two drivers over their fastest lap.
    """
    try:
        data = fastf1_service.get_driver_telemetry(
            year=year,
            round_num=round_number,
            session_type=session_type,
            driver_1=driver_1,
            driver_2=driver_2,
        )
        return TelemetryComparisonResponse(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch telemetry comparison: {str(e)}")


@router.get("/live")
async def get_live_timing():
    """
    Get live timing stream status or session telemetry.
    """
    return fastf1_service.get_live_timing()
