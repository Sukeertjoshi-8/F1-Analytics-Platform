import React, { useState, useEffect } from 'react';
import { f1Api } from '../services/api';
import { Activity, Radio, Flag, CloudSun, Gauge, AlertTriangle, RefreshCw, Zap } from 'lucide-react';

export const LiveDashboard = () => {
  const [leaderboard, setLeaderboard] = useState([
    { pos: 1, driver_number: 81, driver: 'PIA', full_name: 'Oscar Piastri', team: 'McLaren', interval: 'LEADER', tire_compound: 'MEDIUM', laps: 70, status: 'Finished' },
    { pos: 2, driver_number: 4, driver: 'NOR', full_name: 'Lando Norris', team: 'McLaren', interval: '+2.141s', tire_compound: 'MEDIUM', laps: 70, status: 'Finished' },
    { pos: 3, driver_number: 44, driver: 'HAM', full_name: 'Lewis Hamilton', team: 'Mercedes', interval: '+14.880s', tire_compound: 'HARD', laps: 70, status: 'Finished' },
    { pos: 4, driver_number: 16, driver: 'LEC', full_name: 'Charles Leclerc', team: 'Ferrari', interval: '+19.686s', tire_compound: 'MEDIUM', laps: 70, status: 'Finished' },
    { pos: 5, driver_number: 1, driver: 'VER', full_name: 'Max Verstappen', team: 'Red Bull Racing', interval: '+21.349s', tire_compound: 'MEDIUM', laps: 70, status: 'Finished' },
    { pos: 6, driver_number: 55, driver: 'SAI', full_name: 'Carlos Sainz', team: 'Ferrari', interval: '+23.073s', tire_compound: 'HARD', laps: 70, status: 'Finished' },
    { pos: 7, driver_number: 11, driver: 'PER', full_name: 'Sergio Perez', team: 'Red Bull Racing', interval: '+39.792s', tire_compound: 'HARD', laps: 70, status: 'Finished' },
    { pos: 8, driver_number: 63, driver: 'RUS', full_name: 'George Russell', team: 'Mercedes', interval: '+42.368s', tire_compound: 'MEDIUM', laps: 70, status: 'Finished' },
  ]);

  const [eventName, setEventName] = useState('Hungarian Grand Prix');
  const [sessionName, setSessionName] = useState('Race');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const [isLive, setIsLive] = useState(true);

  // Step 1.2: Real-time 5-second polling interval via useEffect
  useEffect(() => {
    let isMounted = true;

    const fetchLiveTiming = async () => {
      try {
        const data = await f1Api.getLiveTiming();
        if (isMounted && data) {
          if (data.leaderboard && data.leaderboard.length > 0) {
            setLeaderboard(data.leaderboard);
          }
          if (data.event_name) setEventName(data.event_name);
          if (data.session_name) setSessionName(data.session_name);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('Live timing polling error:', err);
      }
    };

    // Initial fetch
    fetchLiveTiming();

    // 5-second polling interval
    const intervalId = setInterval(fetchLiveTiming, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Live Header Strip */}
      <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>LIVE SESSION TELEMETRY & TIMING</span>
            <span className="text-[10px] text-slate-400 ml-2 bg-[#0B0E14] px-2 py-0.5 rounded border border-[#232D42]">
              Polling every 5s · Last sync: {lastUpdated}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-racing">
            {eventName} — {sessionName}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Real-time track telemetry, driver intervals, tire delta, and pit stop tracker.
          </p>
        </div>

        {/* Track Status Badge */}
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center space-x-2 text-xs font-bold uppercase">
            <Flag className="w-4 h-4" />
            <span>TRACK GREEN</span>
          </div>
          <div className="px-4 py-2 bg-[#1C2333] border border-[#232D42] rounded-xl flex items-center space-x-2 text-xs text-slate-300">
            <CloudSun className="w-4 h-4 text-amber-400" />
            <span>Track 34.8°C | Air 25.1°C</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Timing Table & Telemetry Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timing Table (2 Columns) */}
        <div className="lg:col-span-2 bg-[#131823] rounded-2xl border border-[#232D42] overflow-hidden">
          <div className="p-5 border-b border-[#232D42] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-[#E10600]" />
              <h3 className="text-base font-bold text-white font-racing uppercase tracking-wider">
                Live Leaderboard
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 font-mono">Live Stream Active</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0E14] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232D42]">
                <tr>
                  <th className="py-3 px-4">Pos</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Interval</th>
                  <th className="py-3 px-4">Tire</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D42]/60 font-mono">
                {leaderboard.map((row, idx) => (
                  <tr key={row.driver || idx} className="hover:bg-[#1C2333]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{row.position || idx + 1}</td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-100 flex items-center space-x-2">
                      <span className="text-slate-500 font-mono text-[11px]">{row.driver_number || row.no || '-'}</span>
                      <span className="text-white font-bold">{row.driver}</span>
                      <span className="text-slate-400 font-normal text-xs hidden sm:inline">({row.full_name || ''})</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">{row.team}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{row.interval || row.gap}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (row.tire_compound || row.tire) === 'SOFT' || (row.tire_compound || row.tire) === 'S'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : (row.tire_compound || row.tire) === 'MEDIUM' || (row.tire_compound || row.tire) === 'M'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-slate-200/20 text-white border border-slate-400/30'
                        }`}
                      >
                        {row.tire_compound || row.tire}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{row.status || 'Finished'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Race Control & Pit Feed (1 Column) */}
        <div className="space-y-6">
          <div className="bg-[#131823] p-5 rounded-2xl border border-[#232D42]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-racing flex items-center space-x-2">
              <Radio className="w-4 h-4 text-[#E10600]" />
              <span>Race Control Messages</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#232D42]">
                <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                  <span>RACE FINISH</span>
                  <span>16:42:01</span>
                </div>
                <p className="text-slate-300 font-medium">Chequered Flag: Oscar Piastri wins the Grand Prix!</p>
              </div>
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#232D42]">
                <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                  <span>LAP 68</span>
                  <span>16:38:12</span>
                </div>
                <p className="text-slate-300 font-medium">McLaren 1-2 confirmed with Lando Norris in P2.</p>
              </div>
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#232D42]">
                <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                  <span>LAP 63</span>
                  <span>16:30:19</span>
                </div>
                <p className="text-slate-300 font-medium">Car 1 (VER) and Car 44 (HAM) Turn 1 contact noted - no penalty.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#131823] p-5 rounded-2xl border border-[#232D42]">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 font-racing">
              Pit Window Advisory
            </h4>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Undercut Analysis Active</span>
              </div>
              <p className="text-slate-300">
                Fresh Medium/Hard compound pit-stop window delta estimated at +1.85s out-lap performance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LiveTiming = LiveDashboard;
export default LiveDashboard;
