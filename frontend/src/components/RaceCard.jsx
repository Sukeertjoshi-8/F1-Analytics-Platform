import React, { useState } from 'react';
import { Calendar as CalendarIcon, MapPin, ChevronDown, ChevronUp, Flag, Timer, Zap } from 'lucide-react';

export const RaceCard = ({ event }) => {
  const [showSessions, setShowSessions] = useState(false);

  const isSprint = event.event_format?.toLowerCase().includes('sprint');
  const dateFormatted = event.event_date
    ? new Date(event.event_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBD';

  return (
    <div className="group relative bg-[#131823] rounded-xl border border-[#232D42] overflow-hidden f1-card-hover flex flex-col justify-between">
      {/* Top accent glow line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E10600] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-[#1C2333] text-slate-300 rounded border border-[#232D42]">
              ROUND {String(event.round_number).padStart(2, '0')}
            </span>
            {isSprint && (
              <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                <Zap className="w-2.5 h-2.5" />
                <span>Sprint</span>
              </span>
            )}
          </div>
          <span className="text-xs font-semibold text-slate-400 tracking-wide">
            {event.country}
          </span>
        </div>

        {/* Grand Prix Name */}
        <h3 className="text-lg font-bold text-white group-hover:text-[#E10600] transition-colors duration-200 line-clamp-1 font-racing">
          {event.event_name}
        </h3>

        {/* Official circuit location */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>

      {/* Date & Quick Details */}
      <div className="px-5 py-3 border-t border-[#232D42]/60 bg-[#0E121B]/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-[#E10600]" />
          <span className="font-medium">{dateFormatted}</span>
        </div>
        <button
          onClick={() => setShowSessions(!showSessions)}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-[11px] font-medium"
        >
          <span>Sessions</span>
          {showSessions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expandable Timetable */}
      {showSessions && (
        <div className="p-4 bg-[#0B0E14] border-t border-[#232D42] text-xs space-y-2 animate-fadeIn">
          <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1">
            Weekend Timetable
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            {event.session1 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{event.session1}</div>
                <div className="font-mono text-[11px] truncate">{event.session1_date ? event.session1_date.split(' ')[0] : 'Scheduled'}</div>
              </div>
            )}
            {event.session2 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{event.session2}</div>
                <div className="font-mono text-[11px] truncate">{event.session2_date ? event.session2_date.split(' ')[0] : 'Scheduled'}</div>
              </div>
            )}
            {event.session3 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{event.session3}</div>
                <div className="font-mono text-[11px] truncate">{event.session3_date ? event.session3_date.split(' ')[0] : 'Scheduled'}</div>
              </div>
            )}
            {event.session4 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{event.session4}</div>
                <div className="font-mono text-[11px] truncate">{event.session4_date ? event.session4_date.split(' ')[0] : 'Scheduled'}</div>
              </div>
            )}
            {event.session5 && (
              <div className="col-span-2 bg-[#E10600]/10 p-2 rounded border border-[#E10600]/30 flex justify-between items-center">
                <div className="text-[11px] font-bold text-white uppercase">{event.session5} (Grand Prix)</div>
                <div className="font-mono text-[11px] text-[#E10600] font-semibold">
                  {event.session5_date ? event.session5_date.split(' ')[0] : 'Sunday'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RaceCard;
