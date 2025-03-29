import React from 'react';

interface LogPanelProps {
  title: string;
}

export function LogPanel({ title }: LogPanelProps) {
  return (
    <div className="cyber-panel p-4 h-[200px]">
      <h3 className="text-sm mb-4 neon-text">{title}</h3>
      <div className="font-mono text-xs space-y-1 text-[#00f7ff]">
        <div>&gt;[2024-03-15 08:23:14] Scanning network...</div>
        <div>&gt;[2024-03-15 08:23:15] Port 443 open on 192.168.1.100</div>
        <div>&gt;[2024-03-15 08:23:16] Suspicious activity detected</div>
        <div className="text-[#ff0033]">&gt;WARNING: Potential breach attempt</div>
      </div>
    </div>
  );
}