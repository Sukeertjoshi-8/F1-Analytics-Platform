import React, { useState } from 'react';
import { Trophy, Award, Users, Shield, ChevronRight } from 'lucide-react';

export const ChampionshipStandings = () => {
  // Official driver standings data
  const [driverStandings] = useState([
    { rank: 1, name: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', color: '#3671C6', points: 331, wins: 7 },
    { rank: 2, name: 'Lando Norris', code: 'NOR', team: 'McLaren', color: '#FF8000', points: 279, wins: 3 },
    { rank: 3, name: 'Charles Leclerc', code: 'LEC', team: 'Ferrari', color: '#E80020', points: 245, wins: 2 },
    { rank: 4, name: 'Oscar Piastri', code: 'PIA', team: 'McLaren', color: '#FF8000', points: 237, wins: 2 },
    { rank: 5, name: 'Carlos Sainz', code: 'SAI', team: 'Ferrari', color: '#E80020', points: 190, wins: 1 },
    { rank: 6, name: 'Lewis Hamilton', code: 'HAM', team: 'Mercedes', color: '#27F4D2', points: 174, wins: 2 },
    { rank: 7, name: 'George Russell', code: 'RUS', team: 'Mercedes', color: '#27F4D2', points: 155, wins: 1 },
    { rank: 8, name: 'Sergio Perez', code: 'PER', team: 'Red Bull Racing', color: '#3671C6', points: 144, wins: 0 },
    { rank: 9, name: 'Fernando Alonso', code: 'ALO', team: 'Aston Martin', color: '#229971', points: 62, wins: 0 },
    { rank: 10, name: 'Nico Hülkenberg', code: 'HUL', team: 'Haas', color: '#B6BABD', points: 24, wins: 0 },
  ]);

  // Official constructor standings data
  const [constructorStandings] = useState([
    { rank: 1, name: 'McLaren', color: '#FF8000', points: 516, wins: 5, podiums: 18 },
    { rank: 2, name: 'Red Bull Racing', color: '#3671C6', points: 475, wins: 7, podiums: 14 },
    { rank: 3, name: 'Ferrari', color: '#E80020', points: 441, wins: 3, podiums: 16 },
    { rank: 4, name: 'Mercedes', color: '#27F4D2', points: 329, wins: 3, podiums: 10 },
    { rank: 5, name: 'Aston Martin', color: '#229971', points: 86, wins: 0, podiums: 0 },
    { rank: 6, name: 'RB', color: '#6692FF', points: 34, wins: 0, podiums: 0 },
    { rank: 7, name: 'Haas', color: '#B6BABD', points: 31, wins: 0, podiums: 0 },
    { rank: 8, name: 'Williams', color: '#64C4FF', points: 16, wins: 0, podiums: 0 },
    { rank: 9, name: 'Alpine', color: '#FF87BC', points: 13, wins: 0, podiums: 0 },
    { rank: 10, name: 'Kick Sauber', color: '#52E252', points: 0, wins: 0, podiums: 0 },
  ]);

  const maxDriverPoints = driverStandings[0]?.points || 1;
  const maxConstructorPoints = constructorStandings[0]?.points || 1;

  return (
    <div className="bg-[#131823] rounded-2xl border border-[#232D42] p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#232D42] gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white font-racing tracking-tight">
              FIA Formula 1 World Championship Standings
            </h2>
            <p className="text-xs text-slate-400">
              Live points, wins, and title fight standings
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>OFFICIAL FIA CLASSIFICATION</span>
        </div>
      </div>

      {/* Two-Column Layout (Step 2.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Driver Standings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-racing">
            <div className="flex items-center space-x-2 text-slate-300">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Drivers' Championship (Top 10)</span>
            </div>
            <span>Points</span>
          </div>

          <div className="space-y-2">
            {driverStandings.map((driver) => {
              const pct = (driver.points / maxDriverPoints) * 100;
              const isP1 = driver.rank === 1;
              const isP2 = driver.rank === 2;
              const isP3 = driver.rank === 3;

              return (
                <div
                  key={driver.code}
                  className="group relative bg-[#0B0E14] hover:bg-[#161C28] p-3 rounded-xl border border-[#232D42] hover:border-slate-600 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Rank Badge */}
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
                        {driver.rank}
                      </span>

                      {/* Team Color Pill */}
                      <span
                        className="w-1.5 h-7 rounded-full shrink-0"
                        style={{ backgroundColor: driver.color }}
                      />

                      {/* Driver & Team */}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                            {driver.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                            {driver.code}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block -mt-0.5">
                          {driver.team}
                        </span>
                      </div>
                    </div>

                    {/* Points & Wins */}
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-white">
                        {driver.points} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                      </div>
                      {driver.wins > 0 && (
                        <span className="text-[10px] text-amber-400 font-semibold font-racing">
                          {driver.wins} {driver.wins === 1 ? 'Win' : 'Wins'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Relative Points Progress Bar */}
                  <div className="mt-2 w-full h-1 bg-[#1C2333] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: driver.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Constructor Standings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400 font-racing">
            <div className="flex items-center space-x-2 text-slate-300">
              <Shield className="w-4 h-4 text-[#E10600]" />
              <span>Constructors' Championship</span>
            </div>
            <span>Points</span>
          </div>

          <div className="space-y-2">
            {constructorStandings.map((team) => {
              const pct = (team.points / maxConstructorPoints) * 100;
              const isP1 = team.rank === 1;

              return (
                <div
                  key={team.name}
                  className="group relative bg-[#0B0E14] hover:bg-[#161C28] p-3 rounded-xl border border-[#232D42] hover:border-slate-600 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Rank Badge */}
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black font-racing ${
                          isP1
                            ? 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                            : 'bg-[#1C2333] text-slate-400'
                        }`}
                      >
                        {team.rank}
                      </span>

                      {/* Team Color Pill */}
                      <span
                        className="w-1.5 h-7 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      />

                      {/* Team Name */}
                      <div>
                        <span className="text-sm font-bold text-white group-hover:text-red-400 transition-colors block">
                          {team.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {team.podiums} Podiums · {team.wins} Wins
                        </span>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <div className="text-base font-black font-mono text-white">
                        {team.points} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {isP1 ? 'Leader' : `-${maxConstructorPoints - team.points} pts`}
                      </span>
                    </div>
                  </div>

                  {/* Relative Points Progress Bar */}
                  <div className="mt-2 w-full h-1 bg-[#1C2333] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: team.color,
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
