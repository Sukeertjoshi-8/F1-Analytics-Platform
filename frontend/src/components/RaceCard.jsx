import React from 'react';
import { Calendar as CalendarIcon, MapPin, ChevronDown, ChevronUp, Zap, Radio } from 'lucide-react';
import { formatEventDate } from '../utils/dateUtils';

export const RaceCard = ({
  race,
  event,
  index,
  expandedIndex,
  setExpandedIndex,
  isExpanded: externalIsExpanded,
  onToggleExpand,
  isActiveRace = false,
}) => {
  const item = race || event;
  const isSprint = item.event_format?.toLowerCase().includes('sprint');
  const dateFormatted = formatEventDate(item.event_date);

  // Determine expanded state based on strict array index if provided
  const isExpanded =
    expandedIndex !== undefined && index !== undefined
      ? expandedIndex === index
      : externalIsExpanded ?? false;

  const handleToggle = () => {
    if (setExpandedIndex && index !== undefined) {
      setExpandedIndex(expandedIndex === index ? null : index);
    } else if (onToggleExpand) {
      onToggleExpand();
    }
  };

  return (
    <div
      className={`group relative bg-[#131823] rounded-xl border overflow-hidden f1-card-hover flex flex-col justify-between transition-all duration-300 ${
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

      {/* Card Header */}
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
              ROUND {String(item.round_number || (index !== undefined ? index + 1 : 1)).padStart(2, '0')}
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
            {item.country}
          </span>
        </div>

        {/* Grand Prix Name */}
        <h3 className="text-lg font-bold text-white group-hover:text-[#E10600] transition-colors duration-200 line-clamp-1 font-racing">
          {item.event_name}
        </h3>

        {/* Official circuit location */}
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
      </div>

      {/* Date & Quick Details */}
      <div className="px-5 py-3 border-t border-[#232D42]/60 bg-[#0E121B]/60 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 text-slate-300">
          <CalendarIcon className="w-3.5 h-3.5 text-[#E10600]" />
          <span className="font-medium">{dateFormatted}</span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-[11px] font-medium py-1 px-1.5 rounded hover:bg-[#1C2333]"
          aria-expanded={isExpanded}
        >
          <span>Sessions</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Timetable */}
      {isExpanded && (
        <div className="sessions-dropdown-content p-4 bg-[#0B0E14] border-t border-[#232D42] text-xs space-y-2 animate-fadeIn">
          <div className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-1 flex items-center justify-between">
            <span>Weekend Timetable</span>
            {isSprint && <span className="text-amber-400 text-[10px]">Sprint Format</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            {item.session1 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{item.session1}</div>
                <div className="font-mono text-[11px] truncate">
                  {item.session1_date ? item.session1_date.split(' ')[0] : 'Scheduled'}
                </div>
              </div>
            )}
            {item.session2 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{item.session2}</div>
                <div className="font-mono text-[11px] truncate">
                  {item.session2_date ? item.session2_date.split(' ')[0] : 'Scheduled'}
                </div>
              </div>
            )}
            {item.session3 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{item.session3}</div>
                <div className="font-mono text-[11px] truncate">
                  {item.session3_date ? item.session3_date.split(' ')[0] : 'Scheduled'}
                </div>
              </div>
            )}
            {item.session4 && (
              <div className="bg-[#131823] p-2 rounded border border-[#232D42]/80">
                <div className="text-[10px] text-slate-500">{item.session4}</div>
                <div className="font-mono text-[11px] truncate">
                  {item.session4_date ? item.session4_date.split(' ')[0] : 'Scheduled'}
                </div>
              </div>
            )}
            {item.session5 && (
              <div className="col-span-2 bg-[#E10600]/10 p-2 rounded border border-[#E10600]/30 flex justify-between items-center">
                <div className="text-[11px] font-bold text-white uppercase">
                  {item.session5} (Grand Prix)
                </div>
                <div className="font-mono text-[11px] text-[#E10600] font-semibold">
                  {item.session5_date ? item.session5_date.split(' ')[0] : 'Sunday'}
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
