import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Award, Shield, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

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

export const ChampionshipStandings = () => {
  // Step 1: Scaffold Data Fetching State
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState('');
  const [round, setRound] = useState('');

  // Step 2: Implement the API Calls using Promise.all & Jolpica F1 API
  const fetchStandings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [driverRes, constructorRes] = await Promise.all([
        axios.get('https://api.jolpi.ca/ergast/f1/current/driverStandings.json'),
        axios.get('https://api.jolpi.ca/ergast/f1/current/constructorStandings.json'),
      ]);

      const driverStandingsLists = Array.isArray(driverRes.data?.MRData?.StandingsTable?.StandingsLists)
        ? driverRes.data.MRData.StandingsTable.StandingsLists
        : [];
      const constructorStandingsLists = Array.isArray(constructorRes.data?.MRData?.StandingsTable?.StandingsLists)
        ? constructorRes.data.MRData.StandingsTable.StandingsLists
        : [];

      const drivers =
        driverStandingsLists.length > 0 && Array.isArray(driverStandingsLists[0]?.DriverStandings)
          ? driverStandingsLists[0].DriverStandings
          : [];
      const constructors =
        constructorStandingsLists.length > 0 && Array.isArray(constructorStandingsLists[0]?.ConstructorStandings)
          ? constructorStandingsLists[0].ConstructorStandings
          : [];

      setDriverStandings(drivers);
      setConstructorStandings(constructors);
      setSeason(driverRes.data?.MRData?.StandingsTable?.season || new Date().getFullYear());
      setRound(driverStandingsLists.length > 0 ? driverStandingsLists[0]?.round || '' : '');
    } catch (err) {
      console.error('Failed to fetch Jolpica F1 standings:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to connect to the Jolpica F1 API. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStandings();
  }, []);

  // Step 4: Loading State Early Return
  if (loading) {
    return (
      <div className="bg-[#131823] rounded-2xl border border-[#232D42] p-8 shadow-xl space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#232D42] gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30 animate-pulse">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="h-6 w-64 bg-[#1C2333] rounded animate-pulse" />
              <div className="h-3 w-40 bg-[#1C2333] rounded animate-pulse mt-2" />
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <Loader2 className="w-4 h-4 text-[#E10600] animate-spin" />
            <span>Fetching Live Jolpica F1 API...</span>
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((col) => (
            <div key={col} className="space-y-3">
              <div className="h-4 w-44 bg-[#1C2333] rounded animate-pulse" />
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-[#0B0E14] rounded-xl border border-[#232D42] p-3 animate-pulse flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded bg-[#1C2333]" />
                      <div className="w-1.5 h-7 rounded bg-[#1C2333]" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-[#1C2333] rounded" />
                        <div className="h-3 w-20 bg-[#1C2333] rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-[#1C2333] rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Step 4: Error State Early Return
  if (error) {
    return (
      <div className="bg-[#131823] rounded-2xl border border-red-500/30 p-8 shadow-xl text-center space-y-4 animate-fadeIn">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-racing">Unable to Load Championship Standings</h3>
          <p className="text-xs text-red-300/80 mt-1 max-w-md mx-auto">{error}</p>
        </div>
        <button
          onClick={fetchStandings}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#E10600] hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors shadow-lg shadow-red-600/30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Live Fetch</span>
        </button>
      </div>
    );
  }

  const maxDriverPoints = Math.max(1, ...driverStandings.map((d) => parseFloat(d.points) || 0));
  const maxConstructorPoints = Math.max(1, ...constructorStandings.map((c) => parseFloat(c.points) || 0));

  return (
    <div className="bg-[#131823] rounded-2xl border border-[#232D42] p-6 space-y-6 shadow-xl animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#232D42] gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-racing tracking-tight">
              FIA Formula 1 World Championship Standings {season && `(${season})`}
            </h2>
            <p className="text-xs text-slate-400">
              Live standings powered by Jolpica Ergast-compatible API {round && `· Round ${round}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE JOLPICA FEED</span>
          </div>
          <button
            onClick={fetchStandings}
            title="Refresh Standings"
            className="p-1.5 text-slate-400 hover:text-white bg-[#0B0E14] hover:bg-[#1C2333] rounded-lg border border-[#232D42] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Driver Standings (Step 3: Update Driver Mapping) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-racing">
            <div className="flex items-center space-x-2 text-slate-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Drivers' Championship ({driverStandings.length})</span>
            </div>
            <span>Points</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {driverStandings.map((driver) => {
              const pointsNum = parseFloat(driver.points) || 0;
              const pct = (pointsNum / maxDriverPoints) * 100;
              const posNum = parseInt(driver.position, 10);
              const isP1 = posNum === 1;
              const isP2 = posNum === 2;
              const isP3 = posNum === 3;
              const teamName = driver.Constructors?.[0]?.name || 'N/A';
              const constructorId = driver.Constructors?.[0]?.constructorId;
              const teamColor = getTeamColor(constructorId, teamName);

              return (
                <div
                  key={driver.Driver?.driverId || `${driver.position}-${driver.Driver?.code}`}
                  className="group relative bg-[#0B0E14] hover:bg-[#161C28] p-3 rounded-xl border border-[#232D42] hover:border-slate-600 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Position */}
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black font-racing ${
                          isP1
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                            : isP2
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                            : isP3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/40'
                            : 'bg-[#1C2333] text-slate-400'
                        }`}
                      >
                        {driver.position}
                      </span>

                      {/* Team Color Pill */}
                      <span
                        className="w-1.5 h-7 rounded-full shrink-0"
                        style={{ backgroundColor: teamColor }}
                      />

                      {/* Driver & Team */}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          {/* Name: driver.Driver.givenName driver.Driver.familyName */}
                          <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                            {driver.Driver?.givenName} {driver.Driver?.familyName}
                          </span>
                          {driver.Driver?.code && (
                            <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                              {driver.Driver.code}
                            </span>
                          )}
                        </div>
                        {/* Constructor: driver.Constructors[0].name */}
                        <span className="text-[11px] text-slate-400 block -mt-0.5">
                          {driver.Constructors?.[0]?.name || 'Independent'}
                        </span>
                      </div>
                    </div>

                    {/* Points: driver.points PTS & Wins: driver.wins Wins */}
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-white">
                        {driver.points} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-semibold font-racing">
                        {driver.wins} Wins
                      </span>
                    </div>
                  </div>

                  {/* Relative Points Progress Bar */}
                  <div className="mt-2 w-full h-1 bg-[#1C2333] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: teamColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Constructor Standings (Step 3: Update Constructors Mapping) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-racing">
            <div className="flex items-center space-x-2 text-slate-300">
              <Shield className="w-4 h-4 text-[#E10600]" />
              <span>Constructors' Championship ({constructorStandings.length})</span>
            </div>
            <span>Points</span>
          </div>

          <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
            {constructorStandings.map((team) => {
              const pointsNum = parseFloat(team.points) || 0;
              const pct = (pointsNum / maxConstructorPoints) * 100;
              const posNum = parseInt(team.position, 10);
              const isP1 = posNum === 1;
              const teamColor = getTeamColor(team.Constructor?.constructorId, team.Constructor?.name);

              return (
                <div
                  key={team.Constructor?.constructorId || team.position}
                  className="group relative bg-[#0B0E14] hover:bg-[#161C28] p-3 rounded-xl border border-[#232D42] hover:border-slate-600 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Position: team.position */}
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black font-racing ${
                          isP1
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                            : 'bg-[#1C2333] text-slate-400'
                        }`}
                      >
                        {team.position}
                      </span>

                      {/* Team Color Pill */}
                      <span
                        className="w-1.5 h-7 rounded-full shrink-0"
                        style={{ backgroundColor: teamColor }}
                      />

                      {/* Team Name: team.Constructor.name */}
                      <div>
                        <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors block">
                          {team.Constructor?.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {team.wins} Wins
                        </span>
                      </div>
                    </div>

                    {/* Points: team.points PTS & Wins: team.wins Wins */}
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-white">
                        {team.points} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-semibold font-racing">
                        {team.wins} Wins
                      </span>
                    </div>
                  </div>

                  {/* Relative Points Progress Bar */}
                  <div className="mt-2 w-full h-1 bg-[#1C2333] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: teamColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampionshipStandings;
