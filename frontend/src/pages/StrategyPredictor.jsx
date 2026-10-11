import React, { useState, useEffect } from 'react';
import { f1Api } from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BrainCircuit, AlertCircle, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

export const StrategyPredictor = () => {
  const [compound, setCompound] = useState('SOFT');
  const [stintLength, setStintLength] = useState(25);
  const [trackTemp, setTrackTemp] = useState(38);
  const [currentLap, setCurrentLap] = useState(16);
  const [totalLaps, setTotalLaps] = useState(57);
  const [tireAge, setTireAge] = useState(16);

  const [degData, setDegData] = useState([]);
  const [cliffLap, setCliffLap] = useState(18);
  const [pitPrediction, setPitPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStrategyPredictions = async () => {
    setLoading(true);
    try {
      const [degRes, pitRes] = await Promise.all([
        f1Api.predictTireDegradation({
          compound,
          stint_length: Number(stintLength),
          track_temp: Number(trackTemp),
          fuel_load: 100.0,
        }),
        f1Api.predictPitProbability({
          current_lap: Number(currentLap),
          total_laps: Number(totalLaps),
          tire_age: Number(tireAge),
          tire_compound: compound,
          gap_ahead: 1.8,
          gap_behind: 2.4,
          safety_car_probability: 0.15,
        }),
      ]);

      setDegData(degRes.degradation_curve || []);
      setCliffLap(degRes.cliff_lap || 18);
      setPitPrediction(pitRes);
    } catch (err) {
      console.error('Error in strategy predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategyPredictions();
  }, [compound, stintLength, trackTemp, currentLap, tireAge]);

  const compoundColors = {
    SOFT: '#E10600',
    MEDIUM: '#FFD200',
    HARD: '#F8FAFC',
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42]">
        <div className="flex items-center space-x-2 text-[#E10600] text-xs font-bold tracking-widest uppercase mb-1.5">
          <BrainCircuit className="w-4 h-4" />
          <span>PREDICTIVE RACE STRATEGY & DEGRADATION MODEL</span>
        </div>
        <h2 className="text-3xl font-extrabold text-white font-racing">
          Tire Degradation Curve & Pit Stop Window
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Machine learning simulation of non-linear grip decay, thermal graining cliff, and optimal undercut pit windows.
        </p>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Compound Selector */}
        <div className="bg-[#131823] p-5 rounded-2xl border border-[#232D42] space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Tire Compound
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['SOFT', 'MEDIUM', 'HARD'].map((c) => (
              <button
                key={c}
                onClick={() => setCompound(c)}
                className={`py-2.5 rounded-xl font-racing font-bold text-xs uppercase transition-all duration-200 border ${
                  compound === c
                    ? 'border-white bg-[#1C2333] shadow-lg text-white'
                    : 'border-[#232D42] bg-[#0B0E14] text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: compoundColors[c] }}
                  />
                  <span>{c}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-400">
            Theoretical cliff at <span className="text-white font-bold">Lap {cliffLap}</span>
          </div>
        </div>

        {/* Stint Length Slider */}
        <div className="bg-[#131823] p-5 rounded-2xl border border-[#232D42] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300">Stint Duration</span>
            <span className="font-mono text-white font-bold bg-[#0B0E14] px-2 py-0.5 rounded border border-[#232D42]">
              {stintLength} Laps
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="50"
            value={stintLength}
            onChange={(e) => setStintLength(e.target.value)}
            className="w-full accent-[#E10600] bg-[#0B0E14] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>10 laps</span>
            <span>30 laps</span>
            <span>50 laps</span>
          </div>
        </div>

        {/* Track Temperature Slider */}
        <div className="bg-[#131823] p-5 rounded-2xl border border-[#232D42] space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300">Track Temperature</span>
            <span className="font-mono text-amber-400 font-bold bg-[#0B0E14] px-2 py-0.5 rounded border border-[#232D42]">
              {trackTemp}°C
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="55"
            value={trackTemp}
            onChange={(e) => setTrackTemp(e.target.value)}
            className="w-full accent-amber-500 bg-[#0B0E14] rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20°C (Cold)</span>
            <span>35°C (Optimum)</span>
            <span>55°C (High Deg)</span>
          </div>
        </div>
      </div>

      {/* Degradation Chart */}
      <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-racing">
              Pace Delta & Grip Degradation Model
            </h3>
            <p className="text-xs text-slate-400">
              Net lap time penalty (seconds) accounting for rubber wear and fuel burn compensation.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={degData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="degGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={compoundColors[compound]} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={compoundColors[compound]} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="lap" stroke="#64748B" fontSize={11} unit="L" />
              <YAxis stroke="#64748B" fontSize={11} unit="s" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#131823] p-3 rounded-lg border border-[#232D42] text-xs space-y-1">
                        <p className="font-bold text-white">Lap {label}</p>
                        <p className="text-[#E10600]">Delta: +{data.predicted_lap_time_delta}s</p>
                        <p className="text-emerald-400">Grip Remaining: {data.grip_percentage}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="predicted_lap_time_delta"
                name="Lap Delta (s)"
                stroke={compoundColors[compound]}
                fillOpacity={1}
                fill="url(#degGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pit Stop Recommendation Callout */}
      {pitPrediction && (
        <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42] grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Strategy Recommendation</span>
            </div>
            <h4 className="text-xl font-bold text-white font-racing">
              {pitPrediction.explanation}
            </h4>
            <p className="text-xs text-slate-400">
              Optimal window: Laps {pitPrediction.optimal_window_start}–{pitPrediction.optimal_window_end}. Undercut analysis: {pitPrediction.undercut_potential}.
            </p>
          </div>

          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#232D42] text-center space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Pit Now Probability</span>
            <div className="text-3xl font-black text-[#E10600] font-racing">
              {(pitPrediction.pit_now_probability * 100).toFixed(1)}%
            </div>
            <span className="text-[11px] text-slate-400">
              Next Compound: <strong className="text-white">{pitPrediction.recommended_compound}</strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyPredictor;
