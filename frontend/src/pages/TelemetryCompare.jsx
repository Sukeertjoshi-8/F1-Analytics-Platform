import React, { useState, useEffect } from 'react';
import { f1Api } from '../services/api';
import { TelemetryChart } from '../components/TelemetryChart';
import { Gauge, GitCompare, RefreshCw, Zap } from 'lucide-react';

export const TelemetryCompare = () => {
  const [driver1, setDriver1] = useState('VER');
  const [driver2, setDriver2] = useState('NOR');
  const [year, setYear] = useState(2024);
  const [session, setSession] = useState('Q');
  const [metric, setMetric] = useState('speed');
  const [loading, setLoading] = useState(true);
  const [telemetryData, setTelemetryData] = useState([]);
  const [lapTimes, setLapTimes] = useState({ d1: '1:28.450', d2: '1:28.612' });

  const driversList = [
    { code: 'VER', name: 'Max Verstappen', team: 'Red Bull' },
    { code: 'NOR', name: 'Lando Norris', team: 'McLaren' },
    { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari' },
    { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes' },
    { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren' },
    { code: 'RUS', name: 'George Russell', team: 'Mercedes' },
    { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari' },
    { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin' },
  ];

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

      // Merge d1 and d2 telemetry streams on distance
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
  }, [driver1, driver2, metric, session]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42]">
        <div className="flex items-center space-x-2 text-[#E10600] text-xs font-bold tracking-widest uppercase mb-1.5">
          <GitCompare className="w-4 h-4" />
          <span>TELEMETRY OVERLAY & ANALYSIS</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white font-racing">
          Driver Head-to-Head Telemetry
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          High-frequency GPS distance-synchronized velocity, throttle position, braking zones, and delta analysis.
        </p>

        {/* Lap Time Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-[#0B0E14] rounded-xl border border-sky-500/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-wider">Driver 1 ({driver1})</span>
              <div className="text-xl font-mono font-bold text-white">{lapTimes.d1}</div>
            </div>
            <div className="w-3 h-8 bg-sky-500 rounded-full" />
          </div>

          <div className="p-4 bg-[#0B0E14] rounded-xl border border-orange-500/30 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Driver 2 ({driver2})</span>
              <div className="text-xl font-mono font-bold text-white">{lapTimes.d2}</div>
            </div>
            <div className="w-3 h-8 bg-orange-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Control Filters */}
      <div className="bg-[#131823] p-5 rounded-2xl border border-[#232D42] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Driver 1 */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Driver 1</label>
            <select
              value={driver1}
              onChange={(e) => setDriver1(e.target.value)}
              className="bg-[#0B0E14] border border-[#232D42] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E10600]"
            >
              {driversList.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Driver 2 */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Driver 2</label>
            <select
              value={driver2}
              onChange={(e) => setDriver2(e.target.value)}
              className="bg-[#0B0E14] border border-[#232D42] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E10600]"
            >
              {driversList.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Session */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-semibold">Session</label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="bg-[#0B0E14] border border-[#232D42] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E10600]"
            >
              <option value="Q">Qualifying (Q)</option>
              <option value="R">Race (R)</option>
              <option value="FP3">Practice 3 (FP3)</option>
              <option value="FP2">Practice 2 (FP2)</option>
            </select>
          </div>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex items-center space-x-2 bg-[#0B0E14] p-1 rounded-xl border border-[#232D42]">
          <button
            onClick={() => setMetric('speed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              metric === 'speed' ? 'bg-[#E10600] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Speed (km/h)
          </button>
          <button
            onClick={() => setMetric('throttle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              metric === 'throttle' ? 'bg-[#E10600] text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Throttle (%)
          </button>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <TelemetryChart
        data={telemetryData}
        driver1={driver1}
        driver2={driver2}
        metric={metric}
      />
    </div>
  );
};

export default TelemetryCompare;
