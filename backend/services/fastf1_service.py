import os
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
import pandas as pd

logger = logging.getLogger("f1_platform.fastf1_service")

# Setup FastF1 caching with prioritized f1_cache directory
FASTF1_AVAILABLE = False
try:
    import fastf1
    # Check current directory and root workspace directory for f1_cache
    cache_dir = "f1_cache"
    if not os.path.exists(cache_dir):
        parent_cache = os.path.join(os.path.dirname(os.path.dirname(__file__)), "f1_cache")
        root_cache = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "f1_cache")
        if os.path.exists(parent_cache):
            cache_dir = parent_cache
        elif os.path.exists(root_cache):
            cache_dir = root_cache
        else:
            os.makedirs(cache_dir, exist_ok=True)
    fastf1.Cache.enable_cache(cache_dir)
    FASTF1_AVAILABLE = True
    logger.info(f"FastF1 cache enabled at: {cache_dir}")
except Exception as e:
    logger.warning(f"FastF1 cache initialization notice: {e}")
    FASTF1_AVAILABLE = True if "fastf1" in locals() else False


class FastF1Service:
    """Service to interface with FastF1 library for timing, sessions, and calendars."""

    def __init__(self):
        self.current_year = datetime.now().year

    def get_calendar(self, year: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Fetch the Formula 1 event schedule for the requested year.
        Returns a sanitized list of race event dictionaries.
        """
        if year is None:
            year = self.current_year

        events = []
        try:
            import fastf1
            schedule = fastf1.get_event_schedule(year, include_testing=False)
            
            for _, row in schedule.iterrows():
                def clean_val(val, default=None):
                    if pd.isna(val):
                        return default
                    if isinstance(val, (pd.Timestamp, datetime)):
                        return val.strftime("%Y-%m-%d")
                    return str(val)

                round_number = int(row.get("RoundNumber", 0)) if not pd.isna(row.get("RoundNumber")) else 0
                if round_number == 0:
                    continue  # skip testing sessions if present

                event_dict = {
                    "id": str(round_number),
                    "round_number": round_number,
                    "country": clean_val(row.get("Country"), "Unknown"),
                    "location": clean_val(row.get("Location"), "Unknown"),
                    "official_event_name": clean_val(row.get("OfficialEventName"), clean_val(row.get("EventName"))),
                    "event_name": clean_val(row.get("EventName"), "Grand Prix"),
                    "event_date": clean_val(row.get("EventDate"), ""),
                    "event_format": clean_val(row.get("EventFormat"), "conventional"),
                    "session1": clean_val(row.get("Session1")),
                    "session1_date": clean_val(row.get("Session1DateUtc")),
                    "session2": clean_val(row.get("Session2")),
                    "session2_date": clean_val(row.get("Session2DateUtc")),
                    "session3": clean_val(row.get("Session3")),
                    "session3_date": clean_val(row.get("Session3DateUtc")),
                    "session4": clean_val(row.get("Session4")),
                    "session4_date": clean_val(row.get("Session4DateUtc")),
                    "session5": clean_val(row.get("Session5")),
                    "session5_date": clean_val(row.get("Session5DateUtc")),
                    "f1_api_support": bool(row.get("F1ApiSupport", True)),
                }
                events.append(event_dict)

            logger.info(f"Successfully retrieved {len(events)} events for season {year} via FastF1.")
            return events

        except Exception as e:
            logger.error(f"Error fetching calendar for year {year} from FastF1: {e}. Falling back to default calendar.")
            return self._fallback_calendar(year)

    def get_latest_session_data(self, year: int = 2024) -> Dict[str, Any]:
        """
        Loads the most recent completed race session using FastF1 (e.g., Hungarian Grand Prix or latest round).
        Extracts driver abbreviation, position, interval, and current tire compound.
        Returns a JSON-ready dictionary.
        """
        try:
            import fastf1
            logger.info(f"Fetching latest session data for season {year} via FastF1...")
            session = fastf1.get_session(year, 'latest', 'R')
            session.load(telemetry=False, weather=False, messages=False)

            leaderboard: List[Dict[str, Any]] = []
            if session.results is not None and not session.results.empty:
                for _, row in session.results.iterrows():
                    abbr = str(row.get('Abbreviation', ''))
                    pos = int(row.get('Position')) if not pd.isna(row.get('Position')) else None
                    status = str(row.get('Status', '')) if not pd.isna(row.get('Status')) else ''
                    time_val = row.get('Time')

                    # Compute interval
                    if pos == 1:
                        interval = "LEADER"
                    elif pd.notna(time_val) and hasattr(time_val, "total_seconds"):
                        secs = time_val.total_seconds()
                        interval = f"+{secs:.3f}s"
                    elif status:
                        interval = status
                    else:
                        interval = "-"

                    # Extract current / final tire compound for this driver from laps
                    compound = "MEDIUM"
                    if session.laps is not None and not session.laps.empty:
                        driver_laps = session.laps[session.laps['Driver'] == abbr]
                        if not driver_laps.empty:
                            compounds = driver_laps['Compound'].dropna()
                            if not compounds.empty:
                                compound = str(compounds.iloc[-1])

                    leaderboard.append({
                        "driver": abbr,
                        "position": pos,
                        "interval": interval,
                        "tire_compound": compound,
                        "team": str(row.get('TeamName', '')),
                        "driver_number": str(row.get('DriverNumber', '')),
                        "full_name": str(row.get('FullName', abbr)),
                        "points": float(row.get('Points', 0.0)) if not pd.isna(row.get('Points')) else 0.0,
                        "status": status,
                    })

            event_name = str(session.event.get("EventName", "Grand Prix"))
            round_number = int(session.event.get("RoundNumber", 1)) if not pd.isna(session.event.get("RoundNumber")) else 1

            return {
                "session_name": session.name,
                "event_name": event_name,
                "official_name": str(session.event.get("OfficialEventName", event_name)),
                "location": str(session.event.get("Location", "")),
                "country": str(session.event.get("Country", "")),
                "year": int(session.event.get("Year", year)),
                "round_number": round_number,
                "total_drivers": len(leaderboard),
                "leaderboard": leaderboard,
                "timestamp": datetime.utcnow().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error fetching latest session via FastF1: {e}. Returning fallback session data.")
            return self._fallback_latest_session()

    def get_session_data(self, year: int, round_num: int, session_type: str = "R") -> Dict[str, Any]:
        """
        Load session information and summary lap metrics.
        session_type: 'FP1', 'FP2', 'FP3', 'Q', 'SQ', 'S', 'R'
        """
        try:
            import fastf1
            session = fastf1.get_session(year, round_num, session_type)
            session.load(telemetry=False, weather=True)
            
            results = []
            if session.results is not None:
                for _, driver in session.results.iterrows():
                    results.append({
                        "driver_number": str(driver.get("DriverNumber", "")),
                        "broadcast_name": str(driver.get("BroadcastName", "")),
                        "abbreviation": str(driver.get("Abbreviation", "")),
                        "team_name": str(driver.get("TeamName", "")),
                        "position": int(driver.get("Position", 0)) if not pd.isna(driver.get("Position")) else None,
                        "status": str(driver.get("Status", "")),
                        "points": float(driver.get("Points", 0.0)) if not pd.isna(driver.get("Points")) else 0.0,
                    })

            return {
                "year": year,
                "round_number": round_num,
                "session_name": session.name,
                "results": results,
                "air_temp": session.weather_data["AirTemp"].mean() if not session.weather_data.empty else None,
                "track_temp": session.weather_data["TrackTemp"].mean() if not session.weather_data.empty else None,
            }
        except Exception as e:
            logger.warning(f"Unable to load session data for {year} R{round_num}: {e}")
            return {
                "year": year,
                "round_number": round_num,
                "session_name": session_type,
                "status": "unavailable",
                "message": str(e)
            }

    def get_driver_telemetry(
        self,
        year: int,
        round_num: int,
        session_type: str,
        driver_1: str,
        driver_2: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract fast lap telemetry points for one or two drivers to compare speed, throttle, brake, gear, and DRS.
        """
        try:
            import fastf1
            session = fastf1.get_session(year, round_num, session_type)
            session.load(telemetry=True, laps=True)

            d1_laps = session.laps.pick_drivers(driver_1)
            d1_fastest = d1_laps.pick_fastest()
            d1_tel = d1_fastest.get_telemetry()

            step = max(1, len(d1_tel) // 150)
            d1_points = []
            for _, row in d1_tel.iloc[::step].iterrows():
                d1_points.append({
                    "distance": round(float(row["Distance"]), 1),
                    "speed": round(float(row["Speed"]), 1),
                    "throttle": round(float(row["Throttle"]), 1),
                    "brake": round(float(row["Brake"]), 1),
                    "gear": int(row["nGear"]),
                    "rpm": round(float(row.get("RPM", 0)), 1),
                    "drs": int(row.get("DRS", 0)),
                })

            d2_points = []
            d2_lap_time = None
            if driver_2:
                d2_laps = session.laps.pick_drivers(driver_2)
                d2_fastest = d2_laps.pick_fastest()
                d2_lap_time = str(d2_fastest["LapTime"])
                d2_tel = d2_fastest.get_telemetry()
                step_2 = max(1, len(d2_tel) // 150)
                for _, row in d2_tel.iloc[::step_2].iterrows():
                    d2_points.append({
                        "distance": round(float(row["Distance"]), 1),
                        "speed": round(float(row["Speed"]), 1),
                        "throttle": round(float(row["Throttle"]), 1),
                        "brake": round(float(row["Brake"]), 1),
                        "gear": int(row["nGear"]),
                        "rpm": round(float(row.get("RPM", 0)), 1),
                        "drs": int(row.get("DRS", 0)),
                    })

            return {
                "year": year,
                "round_number": round_num,
                "session_name": session.name,
                "driver_1": driver_1,
                "driver_2": driver_2 or "",
                "driver_1_lap_time": str(d1_fastest["LapTime"]),
                "driver_2_lap_time": d2_lap_time,
                "telemetry_1": d1_points,
                "telemetry_2": d2_points,
            }
        except Exception as e:
            logger.error(f"Error fetching telemetry: {e}")
            return self._synthetic_telemetry(year, round_num, driver_1, driver_2)

    def get_live_timing(self) -> Dict[str, Any]:
        """
        Returns live timing stream data backed by the latest session.
        """
        return self.get_latest_session_data(year=self.current_year)

    def _fallback_latest_session(self) -> Dict[str, Any]:
        """Fallback latest session leaderboard if FastF1 is offline."""
        return {
            "session_name": "Race",
            "event_name": "Hungarian Grand Prix",
            "official_name": "FORMULA 1 HUNGARIAN GRAND PRIX 2024",
            "location": "Budapest",
            "country": "Hungary",
            "year": 2024,
            "round_number": 13,
            "total_drivers": 20,
            "leaderboard": [
                {"driver": "PIA", "position": 1, "interval": "LEADER", "tire_compound": "MEDIUM", "team": "McLaren", "driver_number": "81", "full_name": "Oscar Piastri"},
                {"driver": "NOR", "position": 2, "interval": "+2.141s", "tire_compound": "MEDIUM", "team": "McLaren", "driver_number": "4", "full_name": "Lando Norris"},
                {"driver": "HAM", "position": 3, "interval": "+14.880s", "tire_compound": "HARD", "team": "Mercedes", "driver_number": "44", "full_name": "Lewis Hamilton"},
                {"driver": "LEC", "position": 4, "interval": "+19.686s", "tire_compound": "MEDIUM", "team": "Ferrari", "driver_number": "16", "full_name": "Charles Leclerc"},
                {"driver": "VER", "position": 5, "interval": "+21.349s", "tire_compound": "MEDIUM", "team": "Red Bull Racing", "driver_number": "1", "full_name": "Max Verstappen"},
                {"driver": "SAI", "position": 6, "interval": "+23.073s", "tire_compound": "HARD", "team": "Ferrari", "driver_number": "55", "full_name": "Carlos Sainz"},
                {"driver": "PER", "position": 7, "interval": "+39.792s", "tire_compound": "HARD", "team": "Red Bull Racing", "driver_number": "11", "full_name": "Sergio Perez"},
                {"driver": "RUS", "position": 8, "interval": "+42.368s", "tire_compound": "MEDIUM", "team": "Mercedes", "driver_number": "63", "full_name": "George Russell"},
                {"driver": "TSU", "position": 9, "interval": "+77.259s", "tire_compound": "HARD", "team": "RB", "driver_number": "22", "full_name": "Yuki Tsunoda"},
                {"driver": "STR", "position": 10, "interval": "+77.976s", "tire_compound": "HARD", "team": "Aston Martin", "driver_number": "18", "full_name": "Lance Stroll"},
                {"driver": "ALO", "position": 11, "interval": "+82.460s", "tire_compound": "HARD", "team": "Aston Martin", "driver_number": "14", "full_name": "Fernando Alonso"},
                {"driver": "RIC", "position": 12, "interval": "+1 Lap", "tire_compound": "HARD", "team": "RB", "driver_number": "3", "full_name": "Daniel Ricciardo"},
                {"driver": "HUL", "position": 13, "interval": "+1 Lap", "tire_compound": "HARD", "team": "Haas", "driver_number": "27", "full_name": "Nico Hulkenberg"},
                {"driver": "ALB", "position": 14, "interval": "+1 Lap", "tire_compound": "HARD", "team": "Williams", "driver_number": "23", "full_name": "Alexander Albon"},
                {"driver": "MAG", "position": 15, "interval": "+1 Lap", "tire_compound": "HARD", "team": "Haas", "driver_number": "20", "full_name": "Kevin Magnussen"},
                {"driver": "BOT", "position": 16, "interval": "+1 Lap", "tire_compound": "HARD", "team": "Kick Sauber", "driver_number": "77", "full_name": "Valtteri Bottas"},
                {"driver": "SAR", "position": 17, "interval": "+1 Lap", "tire_compound": "HARD", "team": "Williams", "driver_number": "2", "full_name": "Logan Sargeant"},
                {"driver": "OCO", "position": 18, "interval": "+1 Lap", "tire_compound": "HARD", "team": "Alpine", "driver_number": "31", "full_name": "Esteban Ocon"},
                {"driver": "ZHO", "position": 19, "interval": "+1 Lap", "tire_compound": "HARD", "team": "Kick Sauber", "driver_number": "24", "full_name": "Zhou Guanyu"},
                {"driver": "GAS", "position": 20, "interval": "DNF", "tire_compound": "MEDIUM", "team": "Alpine", "driver_number": "10", "full_name": "Pierre Gasly"},
            ],
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _fallback_calendar(self, year: int) -> List[Dict[str, Any]]:
        """Fallback calendar data if network is limited or API is updating."""
        circuits = [
            ("Bahrain Grand Prix", "Bahrain International Circuit", "Sakhir", "Bahrain", f"{year}-03-02"),
            ("Saudi Arabian Grand Prix", "Jeddah Corniche Circuit", "Jeddah", "Saudi Arabia", f"{year}-03-09"),
            ("Australian Grand Prix", "Albert Park Circuit", "Melbourne", "Australia", f"{year}-03-24"),
            ("Japanese Grand Prix", "Suzuka International Racing Course", "Suzuka", "Japan", f"{year}-04-07"),
            ("Chinese Grand Prix", "Shanghai International Circuit", "Shanghai", "China", f"{year}-04-21"),
            ("Miami Grand Prix", "Miami International Autodrome", "Miami", "USA", f"{year}-05-05"),
            ("Emilia Romagna Grand Prix", "Autodromo Enzo e Dino Ferrari", "Imola", "Italy", f"{year}-05-19"),
            ("Monaco Grand Prix", "Circuit de Monaco", "Monte Carlo", "Monaco", f"{year}-05-26"),
            ("Canadian Grand Prix", "Circuit Gilles-Villeneuve", "Montreal", "Canada", f"{year}-06-09"),
            ("Spanish Grand Prix", "Circuit de Barcelona-Catalunya", "Barcelona", "Spain", f"{year}-06-23"),
            ("Austrian Grand Prix", "Red Bull Ring", "Spielberg", "Austria", f"{year}-06-30"),
            ("British Grand Prix", "Silverstone Circuit", "Silverstone", "Great Britain", f"{year}-07-07"),
            ("Hungarian Grand Prix", "Hungaroring", "Budapest", "Hungary", f"{year}-07-21"),
            ("Belgian Grand Prix", "Circuit de Spa-Francorchamps", "Spa", "Belgium", f"{year}-07-28"),
            ("Dutch Grand Prix", "Circuit Zandvoort", "Zandvoort", "Netherlands", f"{year}-08-25"),
            ("Italian Grand Prix", "Autodromo Nazionale Monza", "Monza", "Italy", f"{year}-09-01"),
            ("Azerbaijan Grand Prix", "Baku City Circuit", "Baku", "Azerbaijan", f"{year}-09-15"),
            ("Singapore Grand Prix", "Marina Bay Street Circuit", "Singapore", "Singapore", f"{year}-09-22"),
            ("United States Grand Prix", "Circuit of the Americas", "Austin", "USA", f"{year}-10-20"),
            ("Mexico City Grand Prix", "Autódromo Hermanos Rodríguez", "Mexico City", "Mexico", f"{year}-10-27"),
            ("São Paulo Grand Prix", "Autódromo José Carlos Pace", "São Paulo", "Brazil", f"{year}-11-03"),
            ("Las Vegas Grand Prix", "Las Vegas Strip Circuit", "Las Vegas", "USA", f"{year}-11-23"),
            ("Qatar Grand Prix", "Losail International Circuit", "Lusail", "Qatar", f"{year}-12-01"),
            ("Abu Dhabi Grand Prix", "Yas Marina Circuit", "Abu Dhabi", "UAE", f"{year}-12-08"),
        ]

        events = []
        for idx, (name, loc, city, country, date_str) in enumerate(circuits, start=1):
            events.append({
                "id": str(idx),
                "round_number": idx,
                "country": country,
                "location": f"{city}, {loc}",
                "official_event_name": f"FORMULA 1 {name.upper()} {year}",
                "event_name": name,
                "event_date": date_str,
                "event_format": "sprint" if idx in [5, 6, 11, 19, 21, 23] else "conventional",
                "session1": "Practice 1",
                "session1_date": f"{date_str} 10:30:00",
                "session2": "Practice 2",
                "session2_date": f"{date_str} 14:00:00",
                "session3": "Practice 3",
                "session3_date": f"{date_str} 11:30:00",
                "session4": "Qualifying",
                "session4_date": f"{date_str} 15:00:00",
                "session5": "Race",
                "session5_date": f"{date_str} 14:00:00",
                "f1_api_support": True,
            })
        return events

    def _synthetic_telemetry(self, year: int, round_num: int, d1: str, d2: Optional[str]) -> Dict[str, Any]:
        """Provides realistic synthetic telemetry for visualization demo."""
        import math
        t1, t2 = [], []
        track_len = 5400  # meters
        step = 40
        for dist in range(0, track_len, step):
            theta = (dist / track_len) * 6 * math.pi
            base_speed = 220 + 85 * math.sin(theta)
            throttle = 100 if base_speed > 210 else 20 + 75 * math.sin(theta)
            brake = 0 if throttle > 50 else 100 - throttle
            gear = min(8, max(2, int((base_speed / 340) * 8) + 1))

            t1.append({
                "distance": dist,
                "speed": round(base_speed, 1),
                "throttle": round(max(0, min(100, throttle)), 1),
                "brake": round(max(0, min(100, brake)), 1),
                "gear": gear,
                "rpm": round(11000 + gear * 400, 0),
                "drs": 1 if base_speed > 280 else 0
            })

            if d2:
                speed_delta = 4 * math.cos(theta * 1.5)
                t2.append({
                    "distance": dist,
                    "speed": round(base_speed + speed_delta, 1),
                    "throttle": round(max(0, min(100, throttle + speed_delta * 1.2)), 1),
                    "brake": round(max(0, min(100, brake - speed_delta)), 1),
                    "gear": gear,
                    "rpm": round(11000 + gear * 400 + speed_delta * 30, 0),
                    "drs": 1 if (base_speed + speed_delta) > 280 else 0
                })

        return {
            "year": year,
            "round_number": round_num,
            "session_name": "Qualifying",
            "driver_1": d1,
            "driver_2": d2 or "",
            "driver_1_lap_time": "1:28.450",
            "driver_2_lap_time": "1:28.612" if d2 else None,
            "telemetry_1": t1,
            "telemetry_2": t2,
        }


fastf1_service = FastF1Service()


def get_latest_session_data(year: int = 2024) -> Dict[str, Any]:
    """Module-level function to retrieve the most recent completed race session data."""
    return fastf1_service.get_latest_session_data(year=year)
