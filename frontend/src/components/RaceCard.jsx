import React from 'react';
import { Calendar as CalendarIcon, MapPin, ChevronRight, Zap, Radio } from 'lucide-react';
import { formatWeekendRange } from '../utils/dateUtils';

export const RaceCard = ({
  race,
  event,
  index,
  onClick,
  onSelect,
  isActiveRace = false,
}) => {
  const item = race || event;
  const isSprint = item?.event_format?.toLowerCase().includes('sprint');
  const dateRange = formatWeekendRange(item?.session1_date, item?.session5_date || item?.event_date);

  const handleClick = () => {
    if (onClick) onClick(item);
    else if (onSelect) onSelect(item);
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative bg-[#131823] rounded-xl border overflow-hidden f1-card-hover flex flex-col justify-between transition-all duration-300 cursor-pointer hover:border-[#E10600]/60 hover:shadow-xl hover:shadow-red-950/20 ${
        isActiveRace
          ? 'ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-red-500/80 bg-gradient-to-b from-[#18131d] to-[#131823]'
          : 'border-[#232D42]'
      }`}
    >
      {/* Top accent glow line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300 ${
          isActiveRace
            ? 'bg-[#E10600] opacity-100 shadow-[0_0_10px_#E10600]'
            : 'bg-gradient-to-r from-transparent via-[#E10600] to-transparent opacity-0 group-hover:opacity-100'
        }`}
      />

      {/* Card Header & Content */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded border ${
                isActiveRace
                  ? 'bg-red-500/20 text-red-200 border-red-500/40'
                  : 'bg-[#1C2333] text-slate-300 border-[#232D42]'
              }`}
            >
              ROUND {String(item?.round_number || (index !== undefined ? index + 1 : 1)).padStart(2, '0')}
            </span>

            {/* LIVE NOW Badge for Active Race Weekend */}
            {isActiveRace && (
              <span className="flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-red-600 text-white rounded-full animate-pulse shadow-md shadow-red-500/50">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-0.5" />
                <Radio className="w-2.5 h-2.5" />
                <span>LIVE NOW</span>
              </span>
            )}

            {isSprint && !isActiveRace && (
              <span className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                <Zap className="w-2.5 h-2.5" />
                <span>Sprint</span>
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-slate-400 tracking-wide">
            {item?.country}
          </span>
        </div>

        {/* Grand Prix Name */}
        <h3 className="text-lg font-bold text-white group-hover:text-[#E10600] transition-colors duration-200 line-clamp-1 font-racing">
          {item?.official_event_name || item?.event_name}
        </h3>

        {/* Circuit Location */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{item?.location}</span>
        </div>
      </div>

      {/* Date Range & Click Action */}
      <div className="px-5 py-3 border-t border-[#232D42]/60 bg-[#0E121B]/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-[#E10600]" />
          <span className="font-medium text-slate-200">{dateRange}</span>
        </div>
        <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400 group-hover:text-[#E10600] transition-colors">
          <span>Details</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default RaceCard;
