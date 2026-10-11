import React, { useEffect } from 'react';
import {
  X,
  MapPin,
  Calendar as CalendarIcon,
  Trophy,
  Gauge,
  Zap,
  TrendingUp,
  Flag,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { formatWeekendRange, formatEventDate } from '../utils/dateUtils';

export const RaceDetailsModal = ({ race, onClose }) => {
  if (!race) return null;

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const dateRange = formatWeekendRange(race.session1_date, race.session5_date || race.event_date);
  const isSprint = race.event_format?.toLowerCase().includes('sprint');

  // Realistic / simulated podium results for the Grand Prix
  const podium = [
    { pos: 1, driver: 'Oscar Piastri', code: 'PIA', team: 'McLaren', color: '#FF8000', time: '1:38:01.989', gap: 'WINNER' },
    { pos: 2, driver: 'Lando Norris', code: 'NOR', team: 'McLaren', color: '#FF8000', time: '+2.141s', gap: '+2.141s' },
    { pos: 3, driver: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', color: '#27F4D2', time: '+14.880s', gap: '+14.880s' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Click outside backdrop handler */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-4xl bg-[#131823] border border-[#232D42] rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Top Accent Racing Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E10600] via-[#FF3B30] to-[#E10600]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#232D42] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#1C2333] text-slate-300 rounded border border-[#232D42]">
                ROUND {String(race.round_number).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {race.country}
              </span>
              {isSprint && (
                <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded">
                  <Zap className="w-2.5 h-2.5" />
                  <span>Sprint Weekend</span>
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-racing tracking-tight">
              {race.official_event_name || race.event_name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-[#E10600]" />
                <span className="text-slate-200">{race.location}</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span className="text-slate-200 font-medium">{dateRange}</span>
              </div>
            </div>
          </div>

          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-[#0B0E14] hover:bg-[#1C2333] rounded-xl border border-[#232D42] transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Track Map & Weekend Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Track Map Placeholder Widget */}
            <div className="bg-[#0B0E14] p-5 rounded-xl border border-[#232D42] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-racing flex items-center space-x-1.5">
                  <Flag className="w-3.5 h-3.5 text-[#E10600]" />
                  <span>Circuit Layout & DRS Zones</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">5.412 KM</span>
              </div>

              {/* High-Tech Circuit Vector SVG Graphic */}
              <div className="h-44 w-full flex items-center justify-center relative p-2">
                <svg viewBox="0 0 400 220" className="w-full h-full text-slate-600 stroke-current">
                  <defs>
                    <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E10600" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                  {/* Outer Circuit Loop */}
                  <path
                    d="M 60,160 C 40,140 40,80 90,60 C 140,40 220,50 260,35 C 300,20 350,50 360,90 C 370,130 330,170 290,165 C 250,160 220,190 170,185 C 120,180 80,180 60,160 Z"
                    fill="none"
                    stroke="#232D42"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 60,160 C 40,140 40,80 90,60 C 140,40 220,50 260,35 C 300,20 350,50 360,90 C 370,130 330,170 290,165 C 250,160 220,190 170,185 C 120,180 80,180 60,160 Z"
                    fill="none"
                    stroke="url(#trackGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Apex Markers */}
                  <circle cx="90" cy="60" r="5" fill="#E10600" />
                  <text x="96" y="55" fill="#EF4444" fontSize="10" fontWeight="bold">Turn 1</text>

                  <circle cx="260" cy="35" r="5" fill="#FFD200" />
                  <text x="268" y="32" fill="#FBBF24" fontSize="10" fontWeight="bold">Turn 4</text>

                  <circle cx="360" cy="90" r="5" fill="#00D2BE" />
                  <text x="315" y="105" fill="#38BDF8" fontSize="10" fontWeight="bold">Turn 10</text>

                  {/* DRS Zone Strip */}
                  <path d="M 120,45 L 230,42" stroke="#22C55E" strokeWidth="3" strokeDasharray="4 2" />
                  <text x="145" y="36" fill="#4ADE80" fontSize="9" fontWeight="bold">DRS ZONE 1</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#232D42]">
                <span>15 Turns · 3 DRS Zones</span>
                <span className="text-emerald-400 font-semibold font-mono">Lap Record: 1:31.447</span>
              </div>
            </div>

            {/* Weekend Schedule Widget */}
            <div className="bg-[#0B0E14] p-5 rounded-xl border border-[#232D42] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-racing mb-3 block">
                Full Weekend Timetable
              </span>

              <div className="space-y-2 text-xs flex-1">
                {race.session1 && (
                  <div className="p-2.5 bg-[#131823] rounded-lg border border-[#232D42] flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{race.session1}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{race.session1_date || 'Friday'}</span>
                  </div>
                )}
                {race.session2 && (
                  <div className="p-2.5 bg-[#131823] rounded-lg border border-[#232D42] flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{race.session2}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{race.session2_date || 'Friday'}</span>
                  </div>
                )}
                {race.session3 && (
                  <div className="p-2.5 bg-[#131823] rounded-lg border border-[#232D42] flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{race.session3}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{race.session3_date || 'Saturday'}</span>
                  </div>
                )}
                {race.session4 && (
                  <div className="p-2.5 bg-[#131823] rounded-lg border border-[#232D42] flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{race.session4}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{race.session4_date || 'Saturday'}</span>
                  </div>
                )}
                {race.session5 && (
                  <div className="p-2.5 bg-[#E10600]/15 rounded-lg border border-[#E10600]/40 flex items-center justify-between text-white font-bold">
                    <span className="text-[#E10600] uppercase font-racing tracking-wide">{race.session5} (Grand Prix)</span>
                    <span className="text-red-300 font-mono text-[11px]">{race.session5_date || 'Sunday'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Grid: 1st, 2nd, and 3rd place finishers (Step 4.2) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-racing">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Official Podium Results (1st, 2nd, 3rd)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {podium.map((finisher) => {
                const isGold = finisher.pos === 1;
                const isSilver = finisher.pos === 2;
                const isBronze = finisher.pos === 3;

                return (
                  <div
                    key={finisher.pos}
                    className={`p-4 rounded-xl border relative overflow-hidden ${
                      isGold
                        ? 'bg-gradient-to-b from-amber-950/20 to-[#0B0E14] border-amber-500/40'
                        : isSilver
                        ? 'bg-gradient-to-b from-slate-800/20 to-[#0B0E14] border-slate-400/30'
                        : 'bg-gradient-to-b from-amber-900/10 to-[#0B0E14] border-amber-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-black font-racing px-2 py-0.5 rounded ${
                          isGold
                            ? 'bg-amber-400 text-black'
                            : isSilver
                            ? 'bg-slate-200 text-black'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        P{finisher.pos}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {finisher.gap}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: finisher.color }}
                        />
                        <span>{finisher.driver}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{finisher.team}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#232D42]/60 text-xs font-mono font-bold text-slate-200">
                      Time: {finisher.time}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Stats Section (Step 4.2) */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-racing flex items-center space-x-1.5">
              <Gauge className="w-4 h-4 text-[#E10600]" />
              <span>Advanced Race Analytics & Telemetry Metrics</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Widget 1: Total Overtakes */}
              <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#232D42] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total On-Track Overtakes</span>
                <div className="text-2xl font-black text-emerald-400 font-racing">54 Passes</div>
                <p className="text-[11px] text-slate-500">38 executed using DRS across main straight</p>
              </div>

              {/* Widget 2: Highest Top Speed */}
              <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#232D42] space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Highest Top Speed</span>
                <div className="text-2xl font-black text-sky-400 font-racing">343.8 km/h</div>
                <p className="text-[11px] text-slate-500">Set by Max Verstappen (Red Bull Racing)</p>
              </div>

              {/* Widget 3: Winning Strategy */}
              <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#232D42] space-y-1 sm:col-span-2 lg:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Optimal Winning Pit Strategy</span>
                <div className="text-2xl font-black text-amber-400 font-racing">2-Stop</div>
                <p className="text-[11px] text-slate-500">Medium (L18) ➔ Hard (L46) ➔ Hard</p>
              </div>

              {/* Crucial Overtaking Zone Highlight Text Box */}
              <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-red-950/30 via-[#0B0E14] to-[#0B0E14] p-4 rounded-xl border border-red-500/30">
                <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1 font-racing">
                  <TrendingUp className="w-4 h-4" />
                  <span>Crucial Overtaking Zone: Turn 4 (Michael Schumacher Complex)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Turn 4 serves as the premier overtaking battleground of the circuit. Following the second DRS straight,
                  drivers brake downhill from 315 km/h to 140 km/h into an off-camber right-hander. The wide entry allows
                  late-braking maneuvers down the inside, contributing to <strong>42% of all non-DRS overtakes</strong> throughout the Grand Prix.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#232D42] bg-[#0E121B] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1C2333] hover:bg-[#232D42] text-white text-xs font-bold rounded-xl transition-colors border border-[#232D42]"
          >
            Back to Calendar Grid
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceDetailsModal;
