# Formula 1 Analytics & Prediction Platform

A full-stack, real-time analytics and predictive modeling platform for Formula 1 racing, powered by **FastAPI**, **FastF1**, **Scikit-Learn**, **React (Vite)**, and **Tailwind CSS**.

---

## Overview

This platform provides:
- **Race Calendar & Session Timing:** Real-time and historical race schedule, grand prix locations, session timetables, and circuit details.
- **Telemetry Analysis & Comparison:** Telemetry overlay (speed, throttle, brake, gear, DRS, and lap delta) across drivers and stints.
- **Predictive Strategy Engine:** Machine learning and statistical modeling for tire degradation, pit window optimizations, and pit-stop probability.
- **Live Timing & Performance Dashboard:** Interactive telemetry visualization and driver delta metrics.

---

##  Project Architecture

```
F1_Analytics_and_Prediction/
├── backend/                  # FastAPI Application
│   ├── api/                  # Modular API routers (calendar, telemetry, strategy)
│   ├── services/             # Core logic (FastF1 integration, strategy engine)
│   ├── models/               # Pydantic schemas and data validation
│   ├── main.py               # Application entry point with CORS setup
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React Application (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/       # Reusable UI (Navbar, RaceCard, TelemetryChart, etc.)
│   │   ├── pages/            # Application views (Calendar, LiveDashboard, Telemetry, Strategy)
│   │   ├── services/         # Axios API client
│   │   ├── App.jsx           # Main router & layout
│   │   └── index.css         # Tailwind & custom typography/styles
│   ├── package.json          # Node dependencies
│   ├── tailwind.config.js    # Tailwind configuration
│   └── vite.config.js        # Vite build configuration
├── .gitignore                # Workspace gitignore
└── README.md                 # Project documentation
```

---

##  Getting Started

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   API Docs will be available at `http://localhost:8000/docs`.

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.
