import React from 'react';

export function StatusPanel() {
  return (
    <div className="cyber-panel p-4 h-[200px]">
      <h3 className="text-sm mb-4 neon-text">SYSTEM STATUS</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>CPU</span>
          <span className="text-[#00f7ff]">78%</span>
        </div>
        <div className="flex justify-between">
          <span>MEMORY</span>
          <span className="text-[#00f7ff]">2.4GB</span>
        </div>
        <div className="flex justify-between">
          <span>NETWORK</span>
          <span className="text-[#ff0033]">ALERT</span>
        </div>
      </div>
    </div>
  );
}