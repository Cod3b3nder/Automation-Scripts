import React, { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from '../utils/format';

interface Device {
  ip: string;
  hostname: string;
  status: string;
  last_seen: number;
  ports: Array<{
    port: number;
    state: string;
    service: string;
  }>;
}

interface LogEntry {
  timestamp: number;
  type: 'info' | 'warning' | 'error';
  message: string;
}

interface LogPanelProps {
  title: string;
  devices: Device[] | undefined;
}

export function LogPanel({ title, devices }: LogPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!devices) return;

    const newLogs: LogEntry[] = [];
    const now = Date.now();

    devices.forEach(device => {
      // Log device status
      if (device.status === 'compromised') {
        newLogs.push({
          timestamp: now,
          type: 'error',
          message: `Security breach detected on ${device.hostname} (${device.ip})`
        });
      } else if (device.status === 'warning') {
        newLogs.push({
          timestamp: now,
          type: 'warning',
          message: `Suspicious activity on ${device.hostname} (${device.ip})`
        });
      }

      // Log open ports
      device.ports.forEach(port => {
        if (port.state === 'open') {
          newLogs.push({
            timestamp: now,
            type: 'info',
            message: `Port ${port.port} (${port.service}) is open on ${device.ip}`
          });
        }
      });
    });

    setLogs(prev => [...newLogs, ...prev].slice(0, 100)); // Keep last 100 logs
  }, [devices]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  if (!devices) {
    return (
      <div className="cyber-panel p-4 h-[200px] flex items-center justify-center">
        <span className="text-[#00f7ff]">Collecting system logs...</span>
      </div>
    );
  }

  return (
    <div className="cyber-panel p-4 h-[200px]">
      <h3 className="text-sm mb-4 neon-text">{title}</h3>
      <div
        ref={logContainerRef}
        className="font-mono text-xs space-y-1 h-[152px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#00f7ff] scrollbar-track-[#222222]"
      >
        {logs.map((log, index) => (
          <div
            key={index}
            className={`
              ${log.type === 'error' ? 'text-[#ff0033]' : ''}
              ${log.type === 'warning' ? 'text-[#f59e0b]' : ''}
              ${log.type === 'info' ? 'text-[#00f7ff]' : ''}
            `}
          >
            &gt;[{formatDistanceToNow(log.timestamp)}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
}