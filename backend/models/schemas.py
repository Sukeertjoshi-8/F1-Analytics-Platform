from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class RaceEvent(BaseModel):
    round_number: int = Field(..., description="Round number of the championship")
    country: str = Field(..., description="Country where the race is hosted")
    location: str = Field(..., description="City / Circuit location")
    official_event_name: str = Field(..., description="Full official title of the Grand Prix")
    event_name: str = Field(..., description="Common Grand Prix name")
    event_date: str = Field(..., description="Date of the race Sunday (YYYY-MM-DD)")
    event_format: str = Field(default="conventional", description="Format (conventional, sprint, testing)")
    session1: Optional[str] = None
    session1_date: Optional[str] = None
    session2: Optional[str] = None
    session2_date: Optional[str] = None
    session3: Optional[str] = None
    session3_date: Optional[str] = None
    session4: Optional[str] = None
    session4_date: Optional[str] = None
    session5: Optional[str] = None
    session5_date: Optional[str] = None
    f1_api_support: bool = True


class CalendarResponse(BaseModel):
    year: int
    total_events: int
    events: List[RaceEvent]


# Telemetry Schemas
class TelemetryPoint(BaseModel):
    distance: float
    speed: float
    throttle: float
    brake: float
    gear: int
    rpm: Optional[float] = None
    drs: Optional[int] = None


class TelemetryComparisonResponse(BaseModel):
    year: int
    round_number: int
    session_name: str
    driver_1: str
    driver_2: str
    driver_1_lap_time: Optional[str] = None
    driver_2_lap_time: Optional[str] = None
    telemetry_1: List[TelemetryPoint] = []
    telemetry_2: List[TelemetryPoint] = []


# Strategy & Prediction Schemas
class TireDegradationRequest(BaseModel):
    compound: str = Field(..., description="Tire compound: SOFT, MEDIUM, HARD")
    stint_length: int = Field(..., description="Number of laps in stint", ge=1, le=70)
    track_temp: Optional[float] = Field(default=35.0, description="Track temperature in Celsius")
    fuel_load: Optional[float] = Field(default=100.0, description="Fuel load in kg")


class TireDegradationPoint(BaseModel):
    lap: int
    predicted_lap_time_delta: float
    grip_percentage: float
    thermal_wear_factor: float


class TireDegradationResponse(BaseModel):
    compound: str
    stint_length: int
    baseline_pace_delta: float
    cliff_lap: int
    degradation_curve: List[TireDegradationPoint]


class PitStopProbabilityRequest(BaseModel):
    current_lap: int
    total_laps: int
    tire_age: int
    tire_compound: str
    gap_ahead: Optional[float] = 1.5
    gap_behind: Optional[float] = 2.0
    safety_car_probability: Optional[float] = 0.15


class PitStopProbabilityResponse(BaseModel):
    current_lap: int
    total_laps: int
    pit_now_probability: float
    optimal_window_start: int
    optimal_window_end: int
    recommended_compound: str
    undercut_potential: str
    explanation: str
