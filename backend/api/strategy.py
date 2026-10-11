from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from models.schemas import (
    TireDegradationRequest,
    TireDegradationResponse,
    PitStopProbabilityRequest,
    PitStopProbabilityResponse,
)
from services.strategy_engine import (
    strategy_engine,
    calculate_tire_degradation,
    get_pit_window,
)

router = APIRouter(prefix="/strategy", tags=["Strategy & Predictions"])


@router.get("/degradation")
async def get_degradation(
    compound: str = Query(default="MEDIUM", description="Tire compound: SOFT, MEDIUM, HARD, INTERMEDIATE, WET"),
    laps: int = Query(default=20, ge=1, le=80, description="Lap count"),
    track_temp: Optional[float] = Query(default=35.0, description="Track temperature in Celsius"),
):
    """
    Calculate simulated pace delta (time penalty in seconds) based on lap count and compound.
    """
    return calculate_tire_degradation(compound=compound, current_laps=laps, track_temp=track_temp or 35.0)


@router.get("/undercut")
async def get_undercut(
    driver: str = Query(default="NOR", description="Driver abbreviation (e.g. NOR, VER, LEC)"),
):
    """
    Analyze gaps from session data to determine undercut viability.
    """
    return get_pit_window(driver_abbreviation=driver)


@router.post("/tire-degradation", response_model=TireDegradationResponse)
async def predict_tire_degradation(request: TireDegradationRequest):
    """
    Simulate and predict tire degradation, grip decline, and pace delta over a stint.
    """
    result = strategy_engine.predict_tire_degradation(
        compound=request.compound,
        stint_length=request.stint_length,
        track_temp=request.track_temp or 35.0,
        fuel_load=request.fuel_load or 100.0,
    )
    return TireDegradationResponse(**result)


@router.post("/pit-probability", response_model=PitStopProbabilityResponse)
async def predict_pit_probability(request: PitStopProbabilityRequest):
    """
    Calculate the likelihood of a pit stop, undercut advantage, and optimal tire change.
    """
    result = strategy_engine.predict_pit_stop_probability(
        current_lap=request.current_lap,
        total_laps=request.total_laps,
        tire_age=request.tire_age,
        tire_compound=request.tire_compound,
        gap_ahead=request.gap_ahead,
        gap_behind=request.gap_behind,
        safety_car_probability=request.safety_car_probability,
    )
    return PitStopProbabilityResponse(**result)


@router.get("/model-status")
async def get_model_status():
    """
    Return strategy model readiness and configuration.
    """
    return strategy_engine.train_predictive_model()
