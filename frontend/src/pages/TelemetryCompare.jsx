import React, { useState, useEffect } from 'react';
import { f1Api } from '../services/api';
import { TelemetryChart } from '../components/TelemetryChart';
import { Gauge, GitCompare, RefreshCw, Zap, Users, MapPin, Flag } from 'lucide-react';

// Complete list of 20 active Formula 1 drivers (Step 2)
export const ACTIVE_F1_DRIVERS = [
  { code: 'VER', name: 'Max Verstappen', team: 'Red Bull Racing', number: 1, color: '#3671C6' },
  { code: 'PER', name: 'Sergio Perez', team: 'Red Bull Racing', number: 11, color: '#3671C6' },
  { code: 'NOR', name: 'Lando Norris', team: 'McLaren', number: 4, color: '#FF8000' },
  { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', number: 81, color: '#FF8000' },
  { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', number: 16, color: '#E80020' },
  { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', number: 55, color: '#E80020' },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', number: 44, color: '#27F4D2' },
  { code: 'RUS', name: 'George Russell', team: 'Mercedes', number: 63, color: '#27F4D2' },
  { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', number: 14, color: '#229971' },
  { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin', number: 18, color: '#229971' },
  { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine', number: 10, color: '#FF87BC' },
  { code: 'OCO', name: 'Esteban Ocon', team: 'Alpine', number: 31, color: '#FF87BC' },
  { code: 'ALB', name: 'Alexander Albon', team: 'Williams', number: 23, color: '#64C4FF' },
  { code: 'COL', name: 'Franco Colapinto', team: 'Williams', number: 43, color: '#64C4FF' },
  { code: 'TSU', name: 'Yuki Tsunoda', team: 'RB', number: 22, color: '#6692FF' },
  { code: 'LAW', name: 'Liam Lawson', team: 'RB', number: 30, color: '#6692FF' },
  { code: 'BOT', name: 'Valtteri Bottas', team: 'Kick Sauber', number: 77, color: '#52E252' },
  { code: 'ZHO', name: 'Zhou Guanyu', team: 'Kick Sauber', number: 24, color: '#52E252' },
  { code: 'HUL', name: 'Nico Hülkenberg', team: 'Haas', number: 27, color: '#B6BABD' },
  { code: 'MAG', name: 'Kevin Magnussen', team: 'Haas', number: 20, color: '#B6BABD' },
];

// Mock corner data for the current placeholder circuit (Bahrain International Circuit - 5,412m) (Step 3)
export const MOCK_CIRCUIT_CORNERS = [
  { name: 'Turn 1', distance: 600, description: 'Heavy braking zone from 325 km/h to 65 km/h' },
  { name: 'Turn 4', distance: 1560, description: 'Downhill right-hander, prime overtaking zone' },
  { name: 'Turn 8', distance: 2640, description: 'Technical hairpin apex' },
  { name: 'Turn 10', distance: 3240, description: 'Off-camber downhill braking & lockup trap' },
  { name: 'Turn 11', distance: 3840, description: 'Fast uphill left sweeper' },
  { name: 'Turn 13', distance: 4400, description: 'Speed exit onto back straight' },
  { name: 'Turn 14', distance: 4960, description: 'Final braking zone onto main straight' },
];

export const TelemetryCompare = () => {
  const [driver1, setDriver1] = useState('VER');
  const [driver2, setDriver2] = useState('NOR');
  const [year, setYear] = useState(2024);
  const [session, setSession] = useState('Q');
  const [metric, setMetric] = useState('speed');
  const [loading, setLoading] = useState(true);
  const [telemetryData, setTelemetryData] = useState([]);
  const [lapTimes, setLapTimes] = useState({ d1: '1:28.450', d2: '1:28.612' });

  // Get details for currently selected drivers
  const d1Info = ACTIVE_F1_DRIVERS.find((d) => d.code === driver1) || ACTIVE_F1_DRIVERS[0];
  const d2Info = ACTIVE_F1_DRIVERS.find((d) => d.code === driver2) || ACTIVE_F1_DRIVERS[2];

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const data = await f1Api.getTelemetryComparison({
        year,
        round_number: 1,
        session_type: session,
        driver_1: driver1,
        driver_2: driver2,
      });

      // Merge driver 1 and driver 2 telemetry streams on synchronized distance
      const merged = (data.telemetry_1 || []).map((pt, idx) => {
        const pt2 = (data.telemetry_2 || [])[idx] || {};
        return {
          distance: pt.distance,
          driver1_value: metric === 'speed' ? pt.speed : pt.throttle,
          driver2_value: metric === 'speed' ? pt2.speed : pt2.throttle,
          brake1: pt.brake,
          brake2: pt2.brake,
        };
      });

      setTelemetryData(merged);
      setLapTimes({
        d1: data.driver_1_lap_time || '1:28.450',
        d2: data.driver_2_lap_time || '1:28.612',
      });
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [driver1, driver2, metric, session, year]);

  const swapDrivers = () => {
    const temp = driver1;
    setDriver1(driver2);
    setDriver2(temp);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42]">
        <div className="flex items-center space-x-2 text-[#E10600] text-xs font-bold tracking-widest uppercase mb-1.5">
          <GitCompare className="w-4 h-4" />
          <span>TELEMETRY OVERLAY & ANALYSIS</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-white font-racing">
              Driver Head-to-Head Telemetry
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              High-frequency GPS distance-synchronized velocity, throttle position, braking zones, and track corner markers.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-[#0B0E14] px-3 py-1.5 rounded-xl border border-[#232D42] text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-red-500" />
            <span className="font-semibold text-white">Bahrain International Circuit</span>
            <span className="text-slate-500 font-mono">(5.412 km · 15 Turns)</span>
          </div>
        </div>

        {/* Lap Time Badges with Driver Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-[#0B0E14] rounded-xl border border-sky-500/40 flex justify-between items-center shadow-lg shadow-sky-950/20">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  #{d1Info.number} {driver1}
                </span>
                <span className="text-xs font-bold text-white">{d1Info.name}</span>
              </div>
              <div className="text-[11px] text-slate-400">{d1Info.team}</div>
              <div className="text-2xl font-mono font-black text-white">{lapTimes.d1}</div>
            </div>
            <div className="h-12 w-2 rounded-full bg-sky-500" />
          </div>

          <div className="p-4 bg-[#0B0E14] rounded-xl border border-orange-500/40 flex justify-between items-center shadow-lg shadow-orange-950/20">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  #{d2Info.number} {driver2}
                </span>
                <span className="text-xs font-bold text-white">{d2Info.name}</span>
              </div>
              <div className="text-[11px] text-slate-400">{d2Info.team}</div>
              <div className="text-2xl font-mono font-black text-white">{lapTimes.d2}</div>
            </div>
            <div className="h-12 w-2 rounded-full bg-orange-500" />
          </div>
        </div>
      </div>

      {/* Control Filters & Full 20-Driver Selection Grid */}
      <div className="bg-[#131823] p-5 rounded-2xl border border-[#232D42] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Driver 1 Dropdown (20 Drivers) */}
            <div className="space-y-1">
              <label className="text-[10px] text-sky-400 uppercase font-bold flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Driver 1 (Reference)</span>
              </label>
              <select
                value={driver1}
                onChange={(e) => setDriver1(e.target.value)}
                className="bg-[#0B0E14] border border-[#232D42] rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#E10600] transition-colors cursor-pointer"
              >
                {ACTIVE_F1_DRIVERS.map((d) => (
                  <option key={`d1-${d.code}`} value={d.code}>
                    {d.code} — {d.name} ({d.team})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Swap Button */}
            <div className="pt-4">
              <button
                type="button"
                onClick={swapDrivers}
                title="Swap Drivers"
                className="p-2 bg-[#0B0E14] border border-[#232D42] rounded-lg text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
              >
                <GitCompare className="w-4 h-4" />
              </button>
            </div>

            {/* Driver 2 Dropdown (20 Drivers) */}
            <div className="space-y-1">
              <label className="text-[10px] text-orange-400 uppercase font-bold flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>Driver 2 (Compare)</span>
              </label>
              <select
                value={driver2}
                onChange={(e) => setDriver2(e.target.value)}
                className="bg-[#0B0E14] border border-[#232D42] rounded-xl px-3.5 py-2 text-xs text-white font-medium focus:outline-none focus:border-[#E10600] transition-colors cursor-pointer"
              >
                {ACTIVE_F1_DRIVERS.map((d) => (
                  <option key={`d2-${d.code}`} value={d.code}>
                    {d.code} — {d.name} ({d.team})
                  </option>
                ))}
              </select>
            </div>

            {/* Session Type */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value)}
                className="bg-[#0B0E14] border border-[#232D42] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E10600]"
              >
                <option value="Q">Qualifying (Q)</option>
                <option value="R">Race (R)</option>
                <option value="FP3">Practice 3 (FP3)</option>
                <option value="FP2">Practice 2 (FP2)</option>
              </select>
            </div>

            {/* Season Year */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">
                Season
              </label>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="bg-[#0B0E14] border border-[#232D42] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E10600]"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
          </div>

          {/* Metric Selector Buttons */}
          <div className="flex items-center space-x-2 bg-[#0B0E14] p-1 rounded-xl border border-[#232D42]">
            <button
              onClick={() => setMetric('speed')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                metric === 'speed'
                  ? 'bg-[#E10600] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Speed (km/h)
            </button>
            <button
              onClick={() => setMetric('throttle')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                metric === 'throttle'
                  ? 'bg-[#E10600] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Throttle (%)
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Visualization with Corner Reference Lines */}
      {loading ? (
        <div className="h-80 bg-[#131823] rounded-2xl border border-[#232D42] p-8 flex flex-col items-center justify-center space-y-3 animate-pulse text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-[#E10600]" />
          <p className="text-xs font-semibold">Extracting high-frequency GPS telemetry traces...</p>
        </div>
      ) : (
        <TelemetryChart
          data={telemetryData}
          driver1={driver1}
          driver2={driver2}
          metric={metric}
          corners={MOCK_CIRCUIT_CORNERS}
        />
      )}
    </div>
  );
};

export default TelemetryCompare;
