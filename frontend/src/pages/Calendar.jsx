import React, { useState, useEffect } from 'react';
import { f1Api } from '../services/api';
import { isCurrentRaceWeek, formatEventDate } from '../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  RefreshCw,
  Trophy,
  AlertCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Zap,
  Radio,
} from 'lucide-react';

export const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(2024);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');

  // Strict array index-based state for dropdown accordion
  const [expandedIndex, setExpandedIndex] = useState(null);

  const fetchCalendar = async (selectedYear) => {
    setLoading(true);
    setError(null);
    try {
      const data = await f1Api.getCalendar(selectedYear);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load race calendar:', err);
      setError(
        err.response?.data?.detail ||
          'Failed to connect to backend engine. Please ensure FastAPI server is running on http://localhost:8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(year);
    // Reset expanded accordion when season changes
    setExpandedIndex(null);
  }, [year]);

  // Filtered list
  const filteredEvents = events.filter((race) => {
    const matchesSearch =
      race.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.location.toLowerCase().includes(searchQuery.toLowerCase());

    const isSprint = race.event_format?.toLowerCase().includes('sprint');
    if (formatFilter === 'sprint') return matchesSearch && isSprint;
    if (formatFilter === 'conventional') return matchesSearch && !isSprint;
    return matchesSearch;
  });

  const sprintCount = events.filter((e) => e.event_format?.toLowerCase().includes('sprint')).length;

  // Check if any race in current season is happening this week
  const activeRaceIndex = filteredEvents.findIndex((race) => isCurrentRaceWeek(race));
  const activeRace = activeRaceIndex !== -1 ? filteredEvents[activeRaceIndex] : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#151922] via-[#0E121B] to-[#151922] border border-[#232D42] p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E10600]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-[#E10600] text-xs font-bold tracking-widest uppercase mb-2">
              <Trophy className="w-4 h-4" />
              <span>FIA FORMULA 1 WORLD CHAMPIONSHIP</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-racing">
              Grand Prix Race Calendar <span className="text-[#E10600]">{year}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Official Formula 1 event schedule, circuit venues, sprint formats, and weekend timetable fetched directly via FastF1.
            </p>
          </div>

          {/* Season Switcher */}
          <div className="flex items-center space-x-2 bg-[#0B0E14] p-1.5 rounded-xl border border-[#232D42]">
            {[2024, 2025, 2026].map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 ${
                  year === y
                    ? 'bg-[#E10600] text-white shadow-lg shadow-red-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-[#131823]'
                }`}
              >
                {y} SEASON
              </button>
            ))}
          </div>
        </div>

        {/* Live Race Announcement Banner if a race is active this week */}
        {activeRace && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-red-900/20 to-transparent border border-red-500/40 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <div>
                <span className="text-[11px] font-black uppercase text-red-400 tracking-wider">
                  ACTIVE RACE WEEKEND
                </span>
                <p className="text-sm font-bold text-white font-racing">
                  Round {activeRace.round_number}: {activeRace.event_name} ({activeRace.location})
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpandedIndex(expandedIndex === activeRaceIndex ? null : activeRaceIndex)}
              className="text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors shrink-0"
            >
              {expandedIndex === activeRaceIndex ? 'Hide Weekend Timetable' : 'View Weekend Timetable'}
            </button>
          </div>
        )}

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#232D42]/60">
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Total Grands Prix</div>
            <div className="text-2xl font-black text-white font-racing">{events.length || 24}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Sprint Weekends</div>
            <div className="text-2xl font-black text-amber-400 font-racing">{sprintCount || 6}</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Continents</div>
            <div className="text-2xl font-black text-emerald-400 font-racing">5</div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 uppercase font-semibold">Live Week Status</div>
            <div className="text-2xl font-black text-sky-400 font-racing">
              {activeRace ? 'Live Grand Prix' : 'Scheduled'}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Grand Prix, Country, or Circuit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131823] border border-[#232D42] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E10600] transition-colors"
          />
        </div>

        {/* Format Filter Tabs & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="bg-[#131823] border border-[#232D42] rounded-xl p-1 flex items-center space-x-1 text-xs">
            <button
              onClick={() => setFormatFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                formatFilter === 'all'
                  ? 'bg-[#1C2333] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setFormatFilter('sprint')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center space-x-1 ${
                formatFilter === 'sprint'
                  ? 'bg-[#1C2333] text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Sprint ({sprintCount})</span>
            </button>
            <button
              onClick={() => setFormatFilter('conventional')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                formatFilter === 'conventional'
                  ? 'bg-[#1C2333] text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Conventional
            </button>
          </div>

          <button
            onClick={() => fetchCalendar(year)}
            title="Refresh Calendar"
            className="p-2.5 bg-[#131823] border border-[#232D42] rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E10600]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Backend Connection Issue</p>
            <p className="text-red-300/80 text-xs mt-1">{error}</p>
          </div>
          <button
            onClick={() => fetchCalendar(year)}
            className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-500"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid of Races */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-[#131823] rounded-xl border border-[#232D42] p-5 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="h-4 w-24 bg-[#1C2333] rounded" />
                <div className="h-6 w-48 bg-[#1C2333] rounded" />
                <div className="h-3 w-32 bg-[#1C2333] rounded" />
              </div>
              <div className="h-4 w-full bg-[#1C2333] rounded pt-2" />
            </div>
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEvents.map((race, index) => {
            const isActive = isCurrentRaceWeek(race);
            const isSprint = race.event_format?.toLowerCase().includes('sprint');
            const dateFormatted = formatEventDate(race.event_date);

            return (
              <div
                key={race.id || index}
                className={`group relative bg-[#131823] rounded-xl border overflow-hidden f1-card-hover flex flex-col justify-between transition-all duration-300 ${
                  isActive
                    ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-500/80 bg-gradient-to-b from-[#18131d] to-[#131823]'
                    : 'border-[#232D42]'
                }`}
              >
                {/* Top accent glow line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300 ${
                    isActive
                      ? 'bg-[#E10600] opacity-100 shadow-[0_0_10px_#E10600]'
                      : 'bg-gradient-to-r from-transparent via-[#E10600] to-transparent opacity-0 group-hover:opacity-100'
                  }`}
                />

                {/* Card Header */}
                <div className="p-5 pb-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded border ${
                          isActive
                            ? 'bg-red-500/20 text-red-200 border-red-500/40'
                            : 'bg-[#1C2333] text-slate-300 border-[#232D42]'
                        }`}
                      >
                        ROUND {String(race.round_number || index + 1).padStart(2, '0')}
                      </span>

                      {/* LIVE NOW Badge */}
                      {isActive && (
                        <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-full animate-pulse shadow-md shadow-red-500/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-0.5" />
                          <Radio className="w-2.5 h-2.5" />
                          <span>LIVE NOW</span>
                        </span>
                      )}

                      {isSprint && !isActive && (
                        <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                          <Zap className="w-2.5 h-2.5" />
                          <span>Sprint</span>
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-slate-400 tracking-wide">
                      {race.country}
                    </span>
                  </div>

                  {/* Grand Prix Name */}
                  <h3 className="text-lg font-bold text-white group-hover:text-[#E10600] transition-colors duration-200 line-clamp-1 font-racing">
                    {race.event_name}
                  </h3>

                  {/* Circuit Location */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{race.location}</span>
                  </div>
                </div>

                {/* Date & Dropdown Button */}
                <div className="px-5 py-3 border-t border-[#232D42]/60 bg-[#0E121B]/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#E10600]" />
                    <span className="font-medium">{dateFormatted}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-[11px] font-medium py-1 px-2 rounded hover:bg-[#1C2333]"
                    aria-expanded={expandedIndex === index}
                  >
                    <span>Sessions</span>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Conditionally rendered sessions based on expandedIndex === index */}
                {expandedIndex === index && (
                  <div className="sessions-dropdown-content p-4 bg-[#0B0E14] border-t border-[#232D42] text-xs space-y-2 animate-fadeIn">
                    <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
                      <span>Weekend Timetable</span>
                      {isSprint && <span className="text-amber-400 text-[10px]">Sprint Format</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      {race.session1 && (
                        <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                          <div className="text-[10px] text-slate-500">{race.session1}</div>
                          <div className="font-mono text-[11px] truncate">
                            {race.session1_date ? race.session1_date.split(' ')[0] : 'Scheduled'}
                          </div>
                        </div>
                      )}
                      {race.session2 && (
                        <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                          <div className="text-[10px] text-slate-500">{race.session2}</div>
                          <div className="font-mono text-[11px] truncate">
                            {race.session2_date ? race.session2_date.split(' ')[0] : 'Scheduled'}
                          </div>
                        </div>
                      )}
                      {race.session3 && (
                        <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                          <div className="text-[10px] text-slate-500">{race.session3}</div>
                          <div className="font-mono text-[11px] truncate">
                            {race.session3_date ? race.session3_date.split(' ')[0] : 'Scheduled'}
                          </div>
                        </div>
                      )}
                      {race.session4 && (
                        <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                          <div className="text-[10px] text-slate-500">{race.session4}</div>
                          <div className="font-mono text-[11px] truncate">
                            {race.session4_date ? race.session4_date.split(' ')[0] : 'Scheduled'}
                          </div>
                        </div>
                      )}
                      {race.session5 && (
                        <div className="col-span-2 bg-[#E10600]/10 p-2 rounded border border-[#E10600]/30 flex justify-between items-center">
                          <div className="text-[11px] font-bold text-white uppercase">
                            {race.session5} (Grand Prix)
                          </div>
                          <div className="font-mono text-[11px] text-[#E10600] font-semibold">
                            {race.session5_date ? race.session5_date.split(' ')[0] : 'Sunday'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#131823] rounded-2xl border border-[#232D42]">
          <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Grands Prix Found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            No race events match your filter query "{searchQuery}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFormatFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-[#1C2333] text-white text-xs font-semibold rounded-lg hover:bg-[#232D42]"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Calendar;
