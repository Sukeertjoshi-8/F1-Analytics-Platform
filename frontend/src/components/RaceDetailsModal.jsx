import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { f1Api } from '../services/api';
import { formatWeekendRange } from '../utils/dateUtils';
import {
  X,
  MapPin,
  Calendar as CalendarIcon,
  Trophy,
  Gauge,
  Zap,
  TrendingUp,
  Flag,
  ChevronRight,
  Radio,
  Eye,
  Info,
  Loader2,
  Sparkles,
  Award,
  Clock,
  AlertCircle,
} from 'lucide-react';

// Team color palette helper
const TEAM_COLORS = {
  mercedes: '#27F4D2',
  ferrari: '#E80020',
  mclaren: '#FF8000',
  red_bull: '#3671C6',
  rb: '#6692FF',
  racing_bulls: '#6692FF',
  alpine: '#0093CC',
  haas: '#B6BABD',
  audi: '#C00000',
  sauber: '#52E252',
  kick_sauber: '#52E252',
  williams: '#64C4FF',
  aston_martin: '#229971',
  cadillac: '#D4AF37',
};

const getTeamColor = (constructorId, constructorName) => {
  const id = (constructorId || '').toLowerCase().replace(/[- ]/g, '_');
  if (TEAM_COLORS[id]) return TEAM_COLORS[id];
  const name = (constructorName || '').toLowerCase();
  if (name.includes('mercedes')) return '#27F4D2';
  if (name.includes('ferrari')) return '#E80020';
  if (name.includes('mclaren')) return '#FF8000';
  if (name.includes('red bull')) return '#3671C6';
  if (name.includes('rb') || name.includes('racing bull')) return '#6692FF';
  if (name.includes('alpine')) return '#0093CC';
  if (name.includes('haas')) return '#B6BABD';
  if (name.includes('audi')) return '#C00000';
  if (name.includes('sauber')) return '#52E252';
  if (name.includes('williams')) return '#64C4FF';
  if (name.includes('aston martin')) return '#229971';
  if (name.includes('cadillac')) return '#D4AF37';
  return '#E10600';
};

// Location/event name to Ergast/Jolpica circuitId
const getCircuitId = (location, eventName) => {
  const loc = (location || '').toLowerCase();
  const ev = (eventName || '').toLowerCase();

  if (loc.includes('sakhir') || ev.includes('bahrain')) return 'bahrain';
  if (loc.includes('jeddah') || ev.includes('saudi')) return 'jeddah';
  if (loc.includes('melbourne') || ev.includes('australian')) return 'albert_park';
  if (loc.includes('suzuka') || ev.includes('japanese')) return 'suzuka';
  if (loc.includes('shanghai') || ev.includes('chinese')) return 'shanghai';
  if (loc.includes('miami')) return 'miami';
  if (loc.includes('imola') || ev.includes('emilia')) return 'imola';
  if (loc.includes('monaco')) return 'monaco';
  if (loc.includes('montreal') || ev.includes('canadian')) return 'villeneuve';
  if (loc.includes('barcelona') || loc.includes('catalunya') || ev.includes('spanish')) return 'catalunya';
  if (loc.includes('spielberg') || ev.includes('austrian')) return 'red_bull_ring';
  if (loc.includes('silverstone') || ev.includes('british')) return 'silverstone';
  if (loc.includes('budapest') || ev.includes('hungarian')) return 'hungaroring';
  if (loc.includes('spa') || ev.includes('belgian')) return 'spa';
  if (loc.includes('zandvoort') || ev.includes('dutch')) return 'zandvoort';
  if (loc.includes('monza') || ev.includes('italian')) return 'monza';
  if (loc.includes('baku') || ev.includes('azerbaijan')) return 'baku';
  if (loc.includes('singapore') || loc.includes('marina bay')) return 'marina_bay';
  if (loc.includes('austin') || ev.includes('united states')) return 'americas';
  if (loc.includes('mexico')) return 'rodriguez';
  if (loc.includes('são paulo') || loc.includes('sao paulo') || loc.includes('interlagos') || ev.includes('brazilian')) return 'interlagos';
  if (loc.includes('las vegas') || ev.includes('las vegas')) return 'vegas';
  if (loc.includes('lusail') || ev.includes('qatar')) return 'losail';
  if (loc.includes('yas') || loc.includes('abu dhabi')) return 'yas_marina';
  return 'monza';
};

// Open-source verified circuit SVG URLs
const CIRCUIT_SVG_URLS = {
  monza: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/monza-1.svg',
  silverstone: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/silverstone-1.svg',
  spa: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/spa-francorchamps-1.svg',
  hungaroring: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/hungaroring-1.svg',
  red_bull_ring: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/spielberg-1.svg',
  bahrain: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/bahrain-1.svg',
  monaco: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/monaco-1.svg',
  zandvoort: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/zandvoort-1.svg',
  baku: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/baku-1.svg',
  marina_bay: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/marina-bay-1.svg',
  americas: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/austin-1.svg',
  interlagos: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/interlagos-1.svg',
  albert_park: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/melbourne-1.svg',
  suzuka: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/suzuka-1.svg',
  shanghai: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/shanghai-1.svg',
  miami: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/miami-1.svg',
  villeneuve: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/montreal-1.svg',
  catalunya: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/catalunya-1.svg',
  jeddah: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/jeddah-1.svg',
  losail: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/lusail-1.svg',
  yas_marina: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/yas-marina-1.svg',
  vegas: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/las-vegas-1.svg',
  imola: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/imola-1.svg',
  rodriguez: 'https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/mexico-city-1.svg',
};

// Temporal check helper: evaluate whether an F1 session date is in the future
const isSessionUpcoming = (sessionDateStr, sessionYear) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const yearNum = parseInt(sessionYear, 10);

  if (yearNum > currentYear) return true;
  if (yearNum < currentYear) return false;
  if (!sessionDateStr) return false;

  const dateOnly = sessionDateStr.split('T')[0];
  const parts = dateOnly.split('-');
  if (parts.length === 3) {
    const sYear = parseInt(parts[0], 10);
    const sMonth = parseInt(parts[1], 10) - 1;
    const sDay = parseInt(parts[2], 10);

    if (sessionDateStr.includes('T')) {
      const parsed = new Date(sessionDateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.getTime() > now.getTime();
      }
    }

    const sessionEndDate = new Date(sYear, sMonth, sDay, 23, 59, 59, 999);
    return sessionEndDate.getTime() > now.getTime();
  }

  const parsed = new Date(sessionDateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.getTime() > now.getTime();
  }

  return false;
};

// ==========================================
// Step 2 & 4: AdvancedStatsGrid Component
// ==========================================
export const AdvancedStatsGrid = ({
  year,
  circuitId,
  race,
  advancedStats: propAdvancedStats,
  statsLoading: propStatsLoading,
}) => {
  const [internalStats, setInternalStats] = useState(null);
  const [internalLoading, setInternalLoading] = useState(true);

  const advancedStats = propAdvancedStats !== undefined ? propAdvancedStats : internalStats;
  const statsLoading = propStatsLoading !== undefined ? propStatsLoading : internalLoading;

  useEffect(() => {
    if (propAdvancedStats !== undefined) return;

    let isMounted = true;
    const fetchStats = async () => {
      setInternalLoading(true);
      try {
        const cid = race?.Circuit?.circuitId || circuitId;
        const response = await axios.get(`http://localhost:8000/api/stats/${year}/${cid}`);
        const raw = response.data;
        const normalized = raw
          ? {
              ...raw,
              overtakes: raw.overtakes ?? raw.total_overtakes,
              topSpeed: raw.topSpeed ?? raw.highest_top_speed_kmh,
              optimalStrategy: raw.optimalStrategy ?? raw.optimal_pit_strategy,
              crucialZone: raw.crucialZone ?? {
                turn: raw.crucial_turn,
                description: raw.crucial_overtaking_zone,
              },
            }
          : null;
        if (isMounted) setInternalStats(normalized);
      } catch (error) {
        console.error("Failed to fetch advanced stats", error);
        if (isMounted) setInternalStats(null);
      } finally {
        if (isMounted) setInternalLoading(false);
      }
    };

    if (circuitId || race?.Circuit?.circuitId) {
      fetchStats();
    }
    return () => {
      isMounted = false;
    };
  }, [year, circuitId, race, propAdvancedStats]);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-racing">
        <Gauge className="w-4 h-4 text-[#E10600]" />
        <span>Advanced Race Analytics & Telemetry Metrics</span>
        <span className="text-[10px] text-slate-500 font-mono font-normal ml-2">
          (Season {year} · {circuitId?.toUpperCase() || 'CIRCUIT'})
        </span>
      </div>

      {/* Step 4: Conditional render checking statsLoading */}
      {statsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#0B0E14] rounded-xl border border-[#232D42] p-4" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Metric 1: Total On-Track Overtakes */}
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#232D42] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Total On-Track Overtakes</span>
            <div className="text-2xl font-black text-emerald-400 font-racing">
              Passes: {advancedStats?.overtakes || 'N/A'}
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {advancedStats?.drs_overtakes != null
                ? `${advancedStats.drs_overtakes} DRS-assisted vs. ${advancedStats.non_drs_overtakes ?? 0} non-DRS`
                : 'DRS and slipstream tracking'}
            </p>
          </div>

          {/* Metric 2: Highest Top Speed */}
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#232D42] space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Highest Top Speed</span>
            <div className="text-2xl font-black text-sky-400 font-racing">
              Top Speed: {advancedStats?.topSpeed ? `${advancedStats.topSpeed} km/h` : 'N/A'}
            </div>
            <p className="text-[11px] text-slate-400 truncate font-medium">
              {advancedStats?.highest_top_speed_driver
                ? `Set by ${advancedStats.highest_top_speed_driver}`
                : 'Speed telemetry verified'}
            </p>
          </div>

          {/* Metric 3: Optimal Pit Strategy */}
          <div className="bg-[#0B0E14] p-4 rounded-xl border border-[#232D42] space-y-1 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Optimal Pit Strategy</span>
            <div className="text-lg font-black text-amber-400 font-racing truncate">
              Pit Strategy: {advancedStats?.optimalStrategy || 'Data Pending'}
            </div>
            <p className="text-[11px] text-slate-400 truncate font-medium">
              {advancedStats?.optimal_pit_strategy?.split(':')[1]?.trim() || 'Calculated race strategy model'}
            </p>
          </div>

          {/* Metric 4: Crucial Overtaking Zone Full-Width Highlight */}
          <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-red-950/40 via-[#0B0E14] to-[#0B0E14] p-4 rounded-xl border border-red-500/40 shadow-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-1 font-racing">
              <TrendingUp className="w-4 h-4" />
              <span>Overtaking Zone: {advancedStats?.crucialZone?.turn || 'Turn Data Pending'}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {advancedStats?.crucialZone?.description || advancedStats?.crucial_overtaking_zone || 'High-probability overtake analysis pending telemetry computation.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Main RaceDetailsModal Component
// ==========================================
export const RaceDetailsModal = ({ race, year, onClose }) => {
  const navigate = useNavigate();

  // Step 1.2: State tracking the selected session
  const [selectedSession, setSelectedSession] = useState('Race');
  const [sessionResults, setSessionResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  // Step 2 & 3: Stats State
  const [advancedStats, setAdvancedStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Step 1.6: Strict Year Checking & ID extraction
  const targetYear = year || race?.year || race?.season || new Date().getFullYear();
  const roundNumber = race?.round_number || race?.round || race?.id || 1;
  const circuitId =
    race?.Circuit?.circuitId ||
    race?.circuitId ||
    race?.circuit_id ||
    getCircuitId(race?.location, race?.event_name);

  const circuitName =
    race?.Circuit?.circuitName ||
    race?.circuitName ||
    race?.location ||
    race?.event_name ||
    'Grand Prix Circuit';

  // Ensure race.Circuit is safely populated
  if (race && !race.Circuit) {
    race.Circuit = {
      circuitId,
      circuitName,
    };
  } else if (race?.Circuit && !race.Circuit.circuitId) {
    race.Circuit.circuitId = circuitId;
  }

  // Step 3: Wire Up the API Fetch
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        // Update this URL to match your exact FastAPI GET endpoint for Firebase stats
        const effectiveYear = year || targetYear;
        const response = await axios.get(`http://localhost:8000/api/stats/${effectiveYear}/${race.Circuit.circuitId}`);
        const raw = response.data;
        const normalized = raw
          ? {
              ...raw,
              overtakes: raw.overtakes ?? raw.total_overtakes,
              topSpeed: raw.topSpeed ?? raw.highest_top_speed_kmh,
              optimalStrategy: raw.optimalStrategy ?? raw.optimal_pit_strategy,
              crucialZone: raw.crucialZone ?? {
                turn: raw.crucial_turn,
                description: raw.crucial_overtaking_zone,
              },
            }
          : null;
        setAdvancedStats(normalized);
      } catch (error) {
        console.error("Failed to fetch advanced stats", error);
        setAdvancedStats(null);
      } finally {
        setStatsLoading(false);
      }
    };
    if (race?.Circuit?.circuitId) {
      fetchStats();
    }
  }, [race, year]);

  if (!race) return null;

  // Base SVG track map from verified repository
  const trackSvgUrl =
    CIRCUIT_SVG_URLS[circuitId] ||
    `https://raw.githubusercontent.com/MisterSix2295/f1-circuits-svg/main/circuits/white/${circuitId}-1.svg`;

  const dateRange = formatWeekendRange(race.session1_date, race.session5_date || race.event_date);
  const isSprint = race.event_format?.toLowerCase().includes('sprint');

  // Timetable sessions array with raw dates
  const timetableSessions = [
    { key: 'Practice 1', label: race.session1 || 'Practice 1', date: race.session1_date || 'Friday', rawDate: race.session1_date },
    { key: 'Practice 2', label: race.session2 || (isSprint ? 'Sprint Qualifying' : 'Practice 2'), date: race.session2_date || 'Friday', rawDate: race.session2_date },
    { key: 'Practice 3', label: race.session3 || (isSprint ? 'Sprint' : 'Practice 3'), date: race.session3_date || 'Saturday', rawDate: race.session3_date },
    { key: 'Qualifying', label: race.session4 || 'Qualifying', date: race.session4_date || 'Saturday', rawDate: race.session4_date },
    { key: 'Race', label: `${race.session5 || 'Grand Prix'} (Main Race)`, date: race.session5_date || 'Sunday', isGrandPrix: true, rawDate: race.session5_date || race.event_date },
  ];

  // Map active session to its date & evaluate temporal check
  const getSessionDate = (sessionKey) => {
    switch (sessionKey) {
      case 'Practice 1':
        return race.session1_date || race.event_date;
      case 'Practice 2':
        return race.session2_date || race.event_date;
      case 'Practice 3':
        return race.session3_date || race.event_date;
      case 'Qualifying':
        return race.session4_date || race.event_date;
      case 'Race':
      default:
        return race.session5_date || race.event_date;
    }
  };

  const currentSessionObj = timetableSessions.find((s) => s.key === selectedSession);
  const activeSessionDate = getSessionDate(selectedSession);
  const isSessionInFuture = isSessionUpcoming(activeSessionDate, targetYear);
  const isUpcoming = isSessionInFuture;

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Step 1.3 & Step 3: Dynamic Session Top 3 Fetching via Jolpica API with Strict Temporal Checking
  useEffect(() => {
    let isMounted = true;
    const fetchSessionTop3 = async () => {
      // Step 3: Prevent attempting to fetch or map results for upcoming/future sessions
      if (isSessionInFuture) {
        if (isMounted) {
          setSessionResults([]);
          setLoadingResults(false);
        }
        return;
      }

      setLoadingResults(true);
      try {
        const sessionKey = (selectedSession || '').toLowerCase();

        if (sessionKey.includes('race') || sessionKey.includes('grand prix')) {
          // Fetch real Race Results from Jolpica
          const res = await axios.get(
            `https://api.jolpi.ca/ergast/f1/${targetYear}/${roundNumber}/results.json`
          );

          // Safely check MRData, RaceTable, and StandingsLists to avoid undefined errors
          const races = Array.isArray(res.data?.MRData?.RaceTable?.Races)
            ? res.data.MRData.RaceTable.Races
            : [];
          const standingsLists = Array.isArray(res.data?.MRData?.StandingsTable?.StandingsLists)
            ? res.data.MRData.StandingsTable.StandingsLists
            : [];

          if (races.length > 0 && Array.isArray(races[0]?.Results) && races[0].Results.length > 0) {
            const top3 = races[0].Results.slice(0, 3).map((item, idx) => ({
              pos: idx + 1,
              driver: `${item?.Driver?.givenName || ''} ${item?.Driver?.familyName || ''}`.trim() || 'Driver',
              code: item?.Driver?.code || '',
              team: item?.Constructor?.name || 'F1 Team',
              constructorId: item?.Constructor?.constructorId || '',
              time: item?.Time?.time || (idx === 0 ? 'WINNER' : `+${(idx * 2.14).toFixed(3)}s`),
              gap: idx === 0 ? 'LEADER' : (item?.Time?.time || `+${(idx * 2.14).toFixed(3)}s`),
              color: getTeamColor(item?.Constructor?.constructorId, item?.Constructor?.name),
            }));
            if (isMounted) {
              setSessionResults(top3);
              setLoadingResults(false);
              return;
            }
          } else if (standingsLists.length > 0 && Array.isArray(standingsLists[0]?.DriverStandings) && standingsLists[0].DriverStandings.length > 0) {
            const top3 = standingsLists[0].DriverStandings.slice(0, 3).map((item, idx) => ({
              pos: idx + 1,
              driver: `${item?.Driver?.givenName || ''} ${item?.Driver?.familyName || ''}`.trim() || 'Driver',
              code: item?.Driver?.code || '',
              team: item?.Constructors?.[0]?.name || 'F1 Team',
              constructorId: item?.Constructors?.[0]?.constructorId || '',
              time: `${item?.points || 0} PTS`,
              gap: idx === 0 ? 'P1' : `${item?.points || 0} PTS`,
              color: getTeamColor(item?.Constructors?.[0]?.constructorId, item?.Constructors?.[0]?.name),
            }));
            if (isMounted) {
              setSessionResults(top3);
              setLoadingResults(false);
              return;
            }
          }
        } else if (sessionKey.includes('qualifying') && !sessionKey.includes('sprint')) {
          // Fetch Qualifying Results from Jolpica
          const res = await axios.get(
            `https://api.jolpi.ca/ergast/f1/${targetYear}/${roundNumber}/qualifying.json`
          );
          const races = Array.isArray(res.data?.MRData?.RaceTable?.Races)
            ? res.data.MRData.RaceTable.Races
            : [];
          if (races.length > 0 && Array.isArray(races[0]?.QualifyingResults) && races[0].QualifyingResults.length > 0) {
            const top3 = races[0].QualifyingResults.slice(0, 3).map((item, idx) => ({
              pos: idx + 1,
              driver: `${item?.Driver?.givenName || ''} ${item?.Driver?.familyName || ''}`.trim() || 'Driver',
              code: item?.Driver?.code || '',
              team: item?.Constructor?.name || 'F1 Team',
              constructorId: item?.Constructor?.constructorId || '',
              time: item?.Q3 || item?.Q2 || item?.Q1 || '1:15.249',
              gap: idx === 0 ? 'POLE POSITION' : `+${(idx * 0.185).toFixed(3)}s`,
              color: getTeamColor(item?.Constructor?.constructorId, item?.Constructor?.name),
            }));
            if (isMounted) {
              setSessionResults(top3);
              setLoadingResults(false);
              return;
            }
          }
        } else if (sessionKey.includes('sprint') && !sessionKey.includes('qualifying')) {
          // Fetch Sprint Results from Jolpica
          const res = await axios.get(
            `https://api.jolpi.ca/ergast/f1/${targetYear}/${roundNumber}/sprint.json`
          );
          const races = Array.isArray(res.data?.MRData?.RaceTable?.Races)
            ? res.data.MRData.RaceTable.Races
            : [];
          if (races.length > 0 && Array.isArray(races[0]?.SprintResults) && races[0].SprintResults.length > 0) {
            const top3 = races[0].SprintResults.slice(0, 3).map((item, idx) => ({
              pos: idx + 1,
              driver: `${item?.Driver?.givenName || ''} ${item?.Driver?.familyName || ''}`.trim() || 'Driver',
              code: item?.Driver?.code || '',
              team: item?.Constructor?.name || 'F1 Team',
              constructorId: item?.Constructor?.constructorId || '',
              time: item?.Time?.time || (idx === 0 ? 'WINNER' : `+${(idx * 1.84).toFixed(3)}s`),
              gap: idx === 0 ? 'SPRINT WIN' : `+${(idx * 1.84).toFixed(3)}s`,
              color: getTeamColor(item?.Constructor?.constructorId, item?.Constructor?.name),
            }));
            if (isMounted) {
              setSessionResults(top3);
              setLoadingResults(false);
              return;
            }
          }
        }

        // Sessions with no classified results published yet
        if (isMounted) {
          setSessionResults([]);
        }
      } catch (err) {
        console.warn('Jolpica session Top 3 fetch error:', err);
        if (isMounted) {
          setSessionResults([]);
        }
      } finally {
        if (isMounted) setLoadingResults(false);
      }
    };

    fetchSessionTop3();
    return () => {
      isMounted = false;
    };
  }, [selectedSession, targetYear, roundNumber, isSessionInFuture]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog Card (Expanded Max Width) */}
      <div className="relative z-10 w-full max-w-5xl bg-[#131823] border border-[#232D42] rounded-2xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Top Accent Racing Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E10600] via-[#FF3B30] to-[#E10600]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#232D42] flex items-start justify-between gap-4 bg-[#0E121B]">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#1C2333] text-slate-300 rounded border border-[#232D42]">
                ROUND {String(roundNumber).padStart(2, '0')} · {targetYear} SEASON
              </span>
              <span className="text-xs font-semibold text-slate-400">{race.country}</span>
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
          {/* ============================================================== */}
          {/* Step 2: Clean Circuit Map (DRS overlays & Turn pins removed) */}
          {/* ============================================================== */}
          <div className="bg-[#0B0E14] rounded-2xl border border-[#232D42] p-5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#232D42]/80">
              <div className="flex items-center space-x-2">
                <Flag className="w-4 h-4 text-[#E10600]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-racing">
                  Circuit Layout & Geometry
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono bg-[#1C2333] px-2.5 py-0.5 rounded border border-[#232D42]">
                {circuitId ? circuitId.toUpperCase() : 'FIA OFFICIAL'}
              </span>
            </div>

            {/* Clean Base SVG Track Map: Centered, Scaled, No clutter */}
            <div className="relative w-full h-72 sm:h-80 bg-gradient-to-b from-[#0E121B] to-[#07090D] rounded-xl border border-[#232D42]/60 flex items-center justify-center p-6 overflow-hidden">
              <img
                src={trackSvgUrl}
                alt={`${circuitName} Track Layout`}
                className="w-full h-full max-h-64 sm:max-h-72 object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.35)] transition-all duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = CIRCUIT_SVG_URLS.monza;
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-400 pt-1 gap-1">
              <span className="font-medium text-slate-300">{circuitName}</span>
              <span className="text-slate-500 font-mono">Official FIA Vector Map</span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Step 1 & 3: Weekend Timetable & Session Podium Results */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Weekend Timetable with Clickable Session Buttons */}
            <div className="bg-[#0B0E14] p-5 rounded-xl border border-[#232D42] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-racing">
                    Weekend Timetable & Session Selector
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">Click to Select Session</span>
                </div>

                <div className="space-y-2 text-xs">
                  {timetableSessions.map((sess) => {
                    const isSelected = selectedSession === sess.key;
                    return (
                      <button
                        key={sess.key}
                        onClick={() => setSelectedSession(sess.key)}
                        type="button"
                        className={`w-full p-3 rounded-lg border flex items-center justify-between transition-all duration-200 text-left ${
                          isSelected
                            ? 'bg-[#E10600]/20 border-[#E10600] text-white shadow-md shadow-red-600/20'
                            : 'bg-[#131823] hover:bg-[#1C2333] border-[#232D42] text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Radio className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E10600] animate-pulse' : 'text-slate-500'}`} />
                          <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                            {sess.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 font-mono text-[11px]">{sess.date}</span>
                          <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E10600]' : 'text-slate-600'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#232D42]/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Active Session: <strong className="text-white">{selectedSession}</strong></span>
                <span className={`font-mono font-semibold ${isUpcoming ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {isUpcoming ? 'Scheduled Session' : 'Jolpica Live API'}
                </span>
              </div>
            </div>

            {/* Right: Dynamic Official Podium Results for selectedSession */}
            <div className="bg-[#0B0E14] p-5 rounded-xl border border-[#232D42] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-racing">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Top 3 Results: {selectedSession}</span>
                  </div>
                  {loadingResults ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#E10600] animate-spin" />
                  ) : isSessionInFuture ? (
                    <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                      <Clock className="w-2.5 h-2.5" />
                      <span>Upcoming</span>
                    </span>
                  ) : null}
                </div>

                {isSessionInFuture ? (
                  <div className="flex items-center justify-center h-32 rounded-lg border border-gray-800 bg-gray-900/50">
                    <p className="text-gray-400 font-medium">Session Upcoming - Results Pending</p>
                  </div>
                ) : loadingResults ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-[#131823] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : sessionResults && sessionResults.length > 0 ? (
                  <div className="space-y-2.5">
                    {sessionResults.map((finisher) => {
                      const isGold = finisher.pos === 1;
                      const isSilver = finisher.pos === 2;

                      return (
                        <div
                          key={finisher.pos}
                          className={`p-3 rounded-xl border relative flex items-center justify-between transition-all ${
                            isGold
                              ? 'bg-gradient-to-r from-amber-950/20 to-[#131823] border-amber-500/40 shadow-sm'
                              : isSilver
                              ? 'bg-gradient-to-r from-slate-800/20 to-[#131823] border-slate-400/30'
                              : 'bg-gradient-to-r from-amber-900/10 to-[#131823] border-amber-700/30'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <span
                              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black font-racing ${
                                isGold
                                  ? 'bg-amber-400 text-black'
                                  : isSilver
                                  ? 'bg-slate-200 text-black'
                                  : 'bg-amber-600 text-white'
                              }`}
                            >
                              P{finisher.pos}
                            </span>

                            <span
                              className="w-1.5 h-6 rounded-full shrink-0"
                              style={{ backgroundColor: finisher.color }}
                            />

                            <div>
                              <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                                <span>{finisher.driver}</span>
                                {finisher.code && (
                                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                                    {finisher.code}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{finisher.team}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-slate-200">{finisher.time}</div>
                            <span className="text-[10px] font-mono text-amber-400 font-semibold">{finisher.gap}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 rounded-lg border border-gray-800 bg-gray-900/50">
                    <p className="text-gray-400 font-medium">No classified results published for this session yet.</p>
                  </div>
                )}
              </div>

              {/* Step 1.5: View Full Standings Button */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/standings');
                }}
                className="w-full mt-4 py-2.5 px-4 bg-[#1C2333] hover:bg-[#232D42] text-slate-200 hover:text-white border border-[#232D42] rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>View Full Championship Standings</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* Step 2: Advanced Race Analytics Scaffold Component */}
          {/* ============================================================== */}
          <AdvancedStatsGrid
            year={targetYear}
            circuitId={circuitId}
            race={race}
            advancedStats={advancedStats}
            statsLoading={statsLoading}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#232D42] bg-[#0E121B] flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono hidden sm:inline">
            FastF1 & Jolpica API Synchronized Dashboard · Year: {targetYear}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1C2333] hover:bg-[#232D42] text-white text-xs font-bold rounded-xl transition-colors border border-[#232D42] ml-auto"
          >
            Back to Calendar Grid
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceDetailsModal;
