import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components';
import { Calendar, LiveDashboard, TelemetryCompare, StrategyPredictor } from './pages';

function App() {
  // Step 1.1: Dynamic landing year dictated by current date
  const currentYear = new Date().getFullYear();

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col selection:bg-[#E10600] selection:text-white">
        {/* Navigation Bar */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Calendar defaultYear={currentYear} initialView="calendar" />} />
            <Route path="/calendar" element={<Navigate to="/" replace />} />
            <Route path="/standings" element={<Calendar defaultYear={currentYear} initialView="standings" />} />
            <Route path="/live" element={<LiveDashboard />} />
            <Route path="/telemetry" element={<TelemetryCompare />} />
            <Route path="/strategy" element={<StrategyPredictor />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#232D42] bg-[#0E121B] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <span className="font-semibold text-slate-300">ApexF1 Analytics Platform</span>
              <span>— FastF1, Python & React Architecture</span>
            </div>
            <div>
              Formula 1 telemetry and statistics are sourced via FastF1 API. Unofficial enthusiast platform.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
