import React, { useState } from 'react';
import { Activity, Radio, Flag, CloudSun, Gauge, AlertTriangle, ShieldAlert } from 'lucide-react';

export const LiveDashboard = () => {
  // Sample live leaderboard data
  const [leaderboard] = useState([
    { pos: 1, no: 1, driver: 'M. Verstappen', team: 'Red Bull Racing', gap: 'LEADER', interval: '-', tire: 'M', laps: 18, lastLap: '1:31.428' },
    { pos: 2, no: 4, driver: 'L. Norris', team: 'McLaren', gap: '+1.482', interval: '+1.482', tire: 'M', laps: 18, lastLap: '1:31.390' },
    { pos: 3, no: 16, driver: 'C. Leclerc', team: 'Ferrari', gap: '+3.910', interval: '+2.428', tire: 'M', laps: 18, lastLap: '1:31.650' },
    { pos: 4, no: 81, driver: 'O. Piastri', team: 'McLaren', gap: '+5.120', interval: '+1.210', tire: 'M', laps: 18, lastLap: '1:31.712' },
    { pos: 5, no: 44, driver: 'L. Hamilton', team: 'Mercedes', gap: '+8.450', interval: '+3.330', tire: 'H', laps: 22, lastLap: '1:32.015' },
    { pos: 6, no: 63, driver: 'G. Russell', team: 'Mercedes', gap: '+9.980', interval: '+1.530', tire: 'H', laps: 22, lastLap: '1:32.110' },
    { pos: 7, no: 55, driver: 'C. Sainz', team: 'Ferrari', gap: '+12.300', interval: '+2.320', tire: 'M', laps: 18, lastLap: '1:31.950' },
    { pos: 8, no: 14, driver: 'F. Alonso', team: 'Aston Martin', gap: '+19.820', interval: '+7.520', tire: 'S', laps: 12, lastLap: '1:32.400' },
  ]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Live Header Strip */}
      <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE SESSION TELEMETRY & TIMING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-racing">
            Bahrain Grand Prix — Lap 18 / 57
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
            <span className="text-xs text-slate-400 font-mono">Sector 1 Active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B0E14] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#232D42]">
                <tr>
                  <th className="py-3 px-4">Pos</th>
                  <th className="py-3 px-4">Driver</th>
                  <th className="py-3 px-4">Team</th>
                  <th className="py-3 px-4">Interval</th>
                  <th className="py-3 px-4">Gap</th>
                  <th className="py-3 px-4">Tire</th>
                  <th className="py-3 px-4">Laps</th>
                  <th className="py-3 px-4">Last Lap</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232D42]/60 font-mono">
                {leaderboard.map((row) => (
                  <tr key={row.no} className="hover:bg-[#1C2333]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{row.pos}</td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-100 flex items-center space-x-2">
                      <span className="text-slate-500 font-mono text-[11px]">{row.no}</span>
                      <span>{row.driver}</span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">{row.team}</td>
                    <td className="py-3 px-4 text-slate-300">{row.interval}</td>
                    <td className="py-3 px-4 font-semibold text-slate-200">{row.gap}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.tire === 'S'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : row.tire === 'M'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                            : 'bg-slate-200/20 text-white border border-slate-400/30'
                        }`}
                      >
                        {row.tire}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{row.laps}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{row.lastLap}</td>
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
                  <span>LAP 17</span>
                  <span>14:38:12</span>
                </div>
                <p className="text-slate-300 font-medium">DRS Enabled in Zones 1 and 2.</p>
              </div>
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#232D42]">
                <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                  <span>LAP 14</span>
                  <span>14:32:05</span>
                </div>
                <p className="text-slate-300 font-medium">Car 14 (ALO) Pit Stop: 2.3s stationary (Soft to Medium).</p>
              </div>
              <div className="p-3 bg-[#0B0E14] rounded-xl border border-[#232D42]">
                <div className="flex justify-between text-slate-500 text-[10px] mb-1">
                  <span>LAP 01</span>
                  <span>14:03:19</span>
                </div>
                <p className="text-slate-300 font-medium">Clean start into Turn 1, no incidents noted.</p>
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
                <span>Medium Stint 1 Approaching Window</span>
              </div>
              <p className="text-slate-300">
                Frontrunners VER and NOR are expected into pit lane between Laps 20 and 24 for Hard compound switches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
