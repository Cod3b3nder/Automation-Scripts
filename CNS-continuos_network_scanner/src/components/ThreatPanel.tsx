import React from 'react';
import { AlertCircle } from 'lucide-react';

export function ThreatPanel() {
  return (
    <div className="cyber-panel p-4 h-[200px]">
      <h3 className="text-sm mb-4 neon-text">THREAT LEVEL</h3>
      <div className="flex flex-col items-center justify-center h-[140px]">
        <div className="relative w-24 h-24 rounded-full border-4 border-[#ff0033] flex items-center justify-center">
          <span className="text-2xl text-[#ff0033]">87%</span>
        </div>
        <div className="mt-4 flex items-center text-[#ff0033]">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>CRITICAL</span>
        </div>
      </div>
    </div>
  );
}