import math
import logging
from typing import Dict, Any, List, Optional
import numpy as np

logger = logging.getLogger("f1_platform.strategy_engine")


class StrategyEngine:
    """
    Predictive modeling and race strategy simulation engine.
    Models tire degradation curves, pit-stop windows, and undercut probabilities.
    """

    # Baseline degradation parameters per compound
    COMPOUND_PARAMS = {
        "SOFT": {
            "base_pace_delta": -0.85,    # Seconds faster than medium initially
            "linear_deg_rate": 0.082,    # Base seconds lost per lap
            "cliff_lap": 18,             # Lap where degradation accelerates rapidly
            "exponential_factor": 1.25,
            "optimal_window": (14, 22),
            "color": "#E10600",
        },
        "MEDIUM": {
            "base_pace_delta": 0.0,      # Baseline reference compound
            "linear_deg_rate": 0.048,    # Base seconds lost per lap
            "cliff_lap": 28,
            "exponential_factor": 1.18,
            "optimal_window": (22, 34),
            "color": "#FFD200",
        },
        "HARD": {
            "base_pace_delta": 0.65,     # Slower pace initially
            "linear_deg_rate": 0.025,    # Very durable
            "cliff_lap": 42,
            "exponential_factor": 1.12,
            "optimal_window": (34, 48),
            "color": "#FFFFFF",
        },
        "INTERMEDIATE": {
            "base_pace_delta": 3.5,
            "linear_deg_rate": 0.09,
            "cliff_lap": 25,
            "exponential_factor": 1.2,
            "optimal_window": (15, 30),
            "color": "#00D2BE",
        },
        "WET": {
            "base_pace_delta": 8.0,
            "linear_deg_rate": 0.06,
            "cliff_lap": 30,
            "exponential_factor": 1.15,
            "optimal_window": (20, 40),
            "color": "#005AFF",
        }
    }

    def predict_tire_degradation(
        self,
        compound: str,
        stint_length: int = 30,
        track_temp: float = 35.0,
        fuel_load: float = 100.0,
    ) -> Dict[str, Any]:
        """
        Calculate tire degradation curve and grip depletion over a given stint length.
        Accounts for thermal wear, fuel burn-off correction (-0.03s per lap per kg fuel burned),
        and the exponential tire performance cliff.
        """
        comp_key = compound.upper()
        params = self.COMPOUND_PARAMS.get(comp_key, self.COMPOUND_PARAMS["MEDIUM"])

        temp_penalty_factor = 1.0 + max(0.0, (track_temp - 30.0) * 0.015)
        curve: List[Dict[str, Any]] = []

        cliff_lap = params["cliff_lap"]
        base_delta = params["base_pace_delta"]

        for lap in range(1, stint_length + 1):
            # Fuel burn effect: car gets ~0.035s lighter each lap
            fuel_benefit = -0.033 * (lap - 1)

            # Tire wear model
            if lap <= cliff_lap:
                tire_deg = params["linear_deg_rate"] * lap * temp_penalty_factor
            else:
                over_cliff = lap - cliff_lap
                tire_deg = (
                    (params["linear_deg_rate"] * cliff_lap * temp_penalty_factor)
                    + (params["exponential_factor"] ** (over_cliff * 0.8)) * 0.35
                )

            net_lap_time_delta = round(base_delta + tire_deg + fuel_benefit, 3)
            # Grip percentage drops from 100% down towards ~40% at end of life
            grip = max(35.0, round(100.0 - (tire_deg * 22.0), 1))
            thermal_factor = round(min(1.0, 0.4 + (lap / max(1, stint_length)) * 0.6 * temp_penalty_factor), 2)

            curve.append({
                "lap": lap,
                "predicted_lap_time_delta": net_lap_time_delta,
                "grip_percentage": grip,
                "thermal_wear_factor": thermal_factor
            })

        return {
            "compound": comp_key,
            "stint_length": stint_length,
            "baseline_pace_delta": base_delta,
            "cliff_lap": cliff_lap,
            "color": params["color"],
            "degradation_curve": curve,
        }

    def predict_pit_stop_probability(
        self,
        current_lap: int,
        total_laps: int,
        tire_age: int,
        tire_compound: str,
        gap_ahead: Optional[float] = 1.8,
        gap_behind: Optional[float] = 2.5,
        safety_car_probability: Optional[float] = 0.15
    ) -> Dict[str, Any]:
        """
        Calculates the probability of executing a pit stop on the current lap.
        Considers tire age relative to cliff, undercut/overcut gaps, and race progression.
        """
        comp_key = tire_compound.upper()
        params = self.COMPOUND_PARAMS.get(comp_key, self.COMPOUND_PARAMS["MEDIUM"])
        w_start, w_end = params["optimal_window"]

        # Base probability from window & tire age
        cliff = params["cliff_lap"]
        if tire_age < w_start:
            age_factor = 0.05 + 0.15 * (tire_age / max(1, w_start))
        elif tire_age <= cliff:
            age_factor = 0.50 + 0.35 * ((tire_age - w_start) / max(1, (cliff - w_start)))
        else:
            age_factor = 0.90 + 0.09 * min(1.0, (tire_age - cliff) / 5.0)

        # Gap factor: if car ahead is within undercut range (1.2 - 2.8s), pit incentive rises
        gap_factor = 0.0
        undercut_status = "Neutral"
        if gap_ahead and 1.0 <= gap_ahead <= 3.0 and tire_age >= w_start - 2:
            gap_factor += 0.12
            undercut_status = "High Potential (Within DRS undercut bubble)"
        elif gap_behind and gap_behind < 1.5:
            gap_factor += 0.08
            undercut_status = "Defensive Cover Required"

        # Safety car bonus: cheap pit stop under SC
        sc_bonus = (safety_car_probability or 0.0) * 0.25

        probability = min(0.99, max(0.02, age_factor + gap_factor + sc_bonus))

        # Recommend next compound based on remaining laps
        remaining_laps = max(0, total_laps - current_lap)
        if remaining_laps > 35:
            rec_compound = "HARD"
        elif remaining_laps > 20:
            rec_compound = "MEDIUM"
        else:
            rec_compound = "SOFT"

        return {
            "current_lap": current_lap,
            "total_laps": total_laps,
            "tire_age": tire_age,
            "tire_compound": comp_key,
            "pit_now_probability": round(probability, 3),
            "optimal_window_start": w_start,
            "optimal_window_end": w_end,
            "recommended_compound": rec_compound,
            "undercut_potential": undercut_status,
            "explanation": (
                f"Tire is at {tire_age} laps. Optimal pit window for {comp_key} is L{w_start}-L{w_end}. "
                f"Tire cliff expected around L{cliff}. Recommended next compound: {rec_compound}."
            )
        }

    def train_predictive_model(self, stint_training_data: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Placeholder / pipeline hook for training scikit-learn models (Ridge/GradientBoosting)
        on telemetry and stint history.
        """
        from sklearn.ensemble import GradientBoostingRegressor
        model = GradientBoostingRegressor(n_estimators=50, random_state=42)
        return {
            "status": "ready",
            "model_type": type(model).__name__,
            "message": "Model scaffolded and ready for telemetry feature fitting."
        }


strategy_engine = StrategyEngine()
