import React from 'react';
import { formatBytes } from '../utils/format';

interface SystemMetrics {
  cpu_usage: number;
  memory_total: number;
  memory_used: number;
  memory_free: number;
}

interface StatusPanelProps {
  metrics: SystemMetrics | undefined;
}

export function StatusPanel({ metrics }: StatusPanelProps) {
  if (!metrics) {
    return (
      <div className="cyber-panel p-4 h-[200px] flex items-center justify-center">
        <span className="text-[#00f7ff]">Waiting for system metrics...</span>
      </div>
    );
  }

  const memoryUsagePercent = (metrics.memory_used / metrics.memory_total) * 100;

  return (
    <div className="cyber-panel p-4 h-[200px]">
      <h3 className="text-sm mb-4 neon-text">SYSTEM STATUS</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span>CPU</span>
            <span className={`${metrics.cpu_usage > 80 ? 'text-[#ff0033]' : 'text-[#00f7ff]'}`}>
              {metrics.cpu_usage.toFixed(1)}%
            </span>
          </div>
          <div className="h-1 bg-[#222222] rounded">
            <div
              className={`h-full rounded ${
                metrics.cpu_usage > 80 ? 'bg-[#ff0033]' : 'bg-[#00f7ff]'
              }`}
              style={{ width: `${metrics.cpu_usage}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>MEMORY</span>
            <span className={`${memoryUsagePercent > 80 ? 'text-[#ff0033]' : 'text-[#00f7ff]'}`}>
              {formatBytes(metrics.memory_used)} / {formatBytes(metrics.memory_total)}
            </span>
          </div>
          <div className="h-1 bg-[#222222] rounded">
            <div
              className={`h-full rounded ${
                memoryUsagePercent > 80 ? 'bg-[#ff0033]' : 'bg-[#00f7ff]'
              }`}
              style={{ width: `${memoryUsagePercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span>FREE MEMORY</span>
            <span className="text-[#00f7ff]">{formatBytes(metrics.memory_free)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}