import React from 'react';
import { NavLink } from 'react-router-dom';
import { Calendar, Activity, Gauge, BrainCircuit, Flag, Zap } from 'lucide-react';

export const Navbar = () => {
  const navItems = [
    { to: '/', label: 'Calendar', icon: Calendar },
    { to: '/live', label: 'Live Timing', icon: Activity },
    { to: '/telemetry', label: 'Telemetry Compare', icon: Gauge },
    { to: '/strategy', label: 'Strategy Predictor', icon: BrainCircuit },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#232D42]">
      {/* Top F1 Red Racing Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E10600] via-[#FF3B30] to-[#E10600]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-[#E10600] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform duration-200">
              <span className="tracking-tighter italic">F1</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-racing">
                APEX<span className="text-[#E10600]">ANALYTICS</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                Predictive Telemetry Platform
              </span>
            </div>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1C2333] text-white border border-[#232D42] shadow-sm text-[#E10600]'
                        : 'text-slate-400 hover:text-white hover:bg-[#131823]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Engine Status & Live Indicator */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-[#131823] border border-[#232D42] px-3 py-1.5 rounded-full text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium tracking-wide">FASTAPI ENGINE</span>
            </div>
            <div className="bg-[#E10600]/10 border border-[#E10600]/30 text-[#E10600] text-xs font-semibold px-2.5 py-1 rounded">
              FASTF1 v3.7
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
