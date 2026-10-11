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
} from 'recharts';

export const TelemetryChart = ({
  data = [],
  driver1 = 'VER',
  driver2 = 'NOR',
  metric = 'speed', // 'speed' or 'throttle'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-[#0E121B] rounded-xl border border-[#232D42] text-slate-500">
        No telemetry traces loaded.
      </div>
    );
  }

  const isSpeed = metric === 'speed';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#131823] p-3 rounded-lg border border-[#232D42] shadow-xl text-xs space-y-1">
          <p className="font-mono text-slate-400">Distance: {label} m</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="font-semibold" style={{ color: entry.color }}>
              {entry.name}: {entry.value} {isSpeed ? 'km/h' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#131823] p-5 rounded-xl border border-[#232D42]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider font-racing">
            {isSpeed ? 'Speed Trace Comparison' : 'Throttle / Brake Profile'}
          </h4>
          <p className="text-xs text-slate-400">
            Fastest Lap overlay: <span className="text-[#38bdf8] font-semibold">{driver1}</span> vs{' '}
            <span className="text-[#fb923c] font-semibold">{driver2}</span>
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis
              dataKey="distance"
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
            <Line
              type="monotone"
              dataKey="driver1_value"
              name={`${driver1} (${isSpeed ? 'Speed' : 'Throttle'})`}
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="driver2_value"
              name={`${driver2} (${isSpeed ? 'Speed' : 'Throttle'})`}
              stroke="#fb923c"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TelemetryChart;
