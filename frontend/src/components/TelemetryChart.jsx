import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { Flag } from 'lucide-react';

export const TelemetryChart = ({
  data = [],
  driver1 = 'VER',
  driver2 = 'NOR',
  metric = 'speed', // 'speed' or 'throttle'
  corners = [], // Array of corner objects: [{ name: 'Turn 1', distance: 620, description: '...' }]
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-[#0E121B] rounded-xl border border-[#232D42] text-slate-500">
        No telemetry traces loaded.
      </div>
    );
  }

  const isSpeed = metric === 'speed';

  // Custom tooltip with driver delta and apex corner detection
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dist = Number(label);
      const nearbyCorner = corners.find(
        (c) => Math.abs(c.distance - dist) <= 140
      );

      const d1Val = payload.find((p) => p.dataKey === 'driver1_value')?.value;
      const d2Val = payload.find((p) => p.dataKey === 'driver2_value')?.value;
      const delta =
        d1Val !== undefined && d2Val !== undefined
          ? (d1Val - d2Val).toFixed(1)
          : null;

      return (
        <div className="bg-[#131823] p-3.5 rounded-xl border border-[#232D42] shadow-2xl text-xs space-y-1.5 min-w-[180px]">
          <div className="flex items-center justify-between border-b border-[#232D42] pb-1 font-mono text-slate-400">
            <span>Distance:</span>
            <span className="font-bold text-white">{dist} m</span>
          </div>

          {nearbyCorner && (
            <div className="flex items-center space-x-1.5 px-2 py-1 bg-red-500/15 border border-red-500/30 rounded text-red-300 font-bold text-[10px]">
              <Flag className="w-3 h-3 text-red-400 shrink-0" />
              <span>
                Apex: {nearbyCorner.name}
                {nearbyCorner.description ? ` (${nearbyCorner.description})` : ''}
              </span>
            </div>
          )}

          {payload.map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex justify-between items-center font-semibold"
              style={{ color: entry.color }}
            >
              <span>{entry.name}:</span>
              <span className="font-mono text-white">
                {entry.value} {isSpeed ? 'km/h' : '%'}
              </span>
            </div>
          ))}

          {delta !== null && (
            <div className="border-t border-[#232D42] pt-1 flex justify-between items-center text-[11px] text-slate-300 font-mono">
              <span className="text-slate-500">Delta ({driver1} - {driver2}):</span>
              <span
                className={`font-bold ${
                  Number(delta) >= 0 ? 'text-sky-400' : 'text-orange-400'
                }`}
              >
                {Number(delta) > 0 ? `+${delta}` : delta} {isSpeed ? 'km/h' : '%'}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#131823] p-6 rounded-2xl border border-[#232D42] space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-base font-bold text-white uppercase tracking-wider font-racing flex items-center space-x-2">
            <span>{isSpeed ? 'Speed Trace Comparison' : 'Throttle / Brake Profile'}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized GPS distance telemetry: <span className="text-sky-400 font-semibold">{driver1}</span> vs{' '}
            <span className="text-orange-400 font-semibold">{driver2}</span> with circuit apex corner markers.
          </p>
        </div>

        {/* Visual Legend for Corner Markers */}
        {corners.length > 0 && (
          <div className="flex items-center space-x-2 bg-[#0B0E14] px-3 py-1.5 rounded-lg border border-[#232D42] text-[11px] text-slate-400">
            <span className="inline-block w-3 border-t-2 border-dashed border-red-500" />
            <span className="text-slate-300 font-medium">Turn Reference Lines</span>
          </div>
        )}
      </div>

      {/* Main Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis
              dataKey="distance"
              type="number"
              domain={['dataMin', 'dataMax']}
              stroke="#64748B"
              fontSize={11}
              tickFormatter={(val) => `${val}m`}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              domain={isSpeed ? ['auto', 'auto'] : [0, 100]}
              unit={isSpeed ? ' km/h' : '%'}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

            {/* Vertical Reference Lines for Corner Annotations (Step 3) */}
            {corners.map((corner, idx) => (
              <ReferenceLine
                key={`corner-ref-${corner.name}-${idx}`}
                x={corner.distance}
                stroke="#EF4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                strokeOpacity={0.75}
                label={{
                  value: corner.name,
                  position: 'top',
                  fill: '#EF4444',
                  fontSize: 10,
                  fontWeight: 700,
                  offset: 8,
                }}
              />
            ))}

            <Line
              type="monotone"
              dataKey="driver1_value"
              name={`${driver1} (${isSpeed ? 'Speed' : 'Throttle'})`}
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0B0E14', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="driver2_value"
              name={`${driver2} (${isSpeed ? 'Speed' : 'Throttle'})`}
              stroke="#fb923c"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: '#fb923c', stroke: '#0B0E14', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Track Turn Index Bar for Casual Fans */}
      {corners.length > 0 && (
        <div className="pt-2 border-t border-[#232D42]/60">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Flag className="w-3 h-3 text-[#E10600]" />
            <span>Circuit Corner Annotations</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {corners.map((corner, i) => (
              <div
                key={`badge-${i}`}
                className="bg-[#0B0E14] px-2.5 py-1 rounded-md border border-[#232D42] text-[11px] flex items-center space-x-1.5"
              >
                <span className="font-bold text-red-400 font-racing">{corner.name}</span>
                <span className="text-slate-500 font-mono text-[10px]">({corner.distance}m)</span>
                {corner.description && (
                  <span className="text-slate-400 text-[10px] hidden md:inline">
                    · {corner.description}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TelemetryChart;
