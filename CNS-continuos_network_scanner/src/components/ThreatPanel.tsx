import React, { useMemo } from 'react';
import { AlertCircle, Shield } from 'lucide-react';

interface Device {
  ip: string;
  hostname: string;
  status: string;
  ports: Array<{
    port: number;
    state: string;
    service: string;
  }>;
}

interface ThreatPanelProps {
  devices: Device[] | undefined;
}

export function ThreatPanel({ devices }: ThreatPanelProps) {
  const threatAnalysis = useMemo(() => {
    if (!devices?.length) return { level: 0, status: 'NO DATA', color: '#666666' };

    const compromisedDevices = devices.filter(d => d.status === 'compromised').length;
    const warningDevices = devices.filter(d => d.status === 'warning').length;
    const totalDevices = devices.length;

    const threatLevel = ((compromisedDevices * 2 + warningDevices) / (totalDevices * 2)) * 100;

    if (threatLevel > 50) {
      return { level: threatLevel, status: 'CRITICAL', color: '#ff0033' };
    } else if (threatLevel > 20) {
      return { level: threatLevel, status: 'WARNING', color: '#f59e0b' };
    } else {
      return { level: threatLevel, status: 'SECURE', color: '#00ff00' };
    }
  }, [devices]);

  if (!devices) {
    return (
      <div className="cyber-panel p-4 h-[200px] flex items-center justify-center">
        <span className="text-[#00f7ff]">Analyzing network threats...</span>
      </div>
    );
  }

  return (
    <div className="cyber-panel p-4 h-[200px]">
      <h3 className="text-sm mb-4 neon-text">THREAT LEVEL</h3>
      <div className="flex flex-col items-center justify-center h-[140px]">
        <div className="relative w-24 h-24">
          {/* Circular progress background */}
          <div className="absolute inset-0 rounded-full border-4 border-[#222222]" />
          
          {/* Circular progress indicator */}
          <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              stroke={threatAnalysis.color}
              strokeWidth="4"
              fill="none"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 - (301.59 * threatAnalysis.level) / 100}
              className="transition-all duration-1000"
            />
          </svg>
          
          {/* Percentage display */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl" style={{ color: threatAnalysis.color }}>
              {Math.round(threatAnalysis.level)}%
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center" style={{ color: threatAnalysis.color }}>
          {threatAnalysis.status === 'CRITICAL' ? (
            <AlertCircle className="h-4 w-4 mr-2" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          <span>{threatAnalysis.status}</span>
        </div>
      </div>
    </div>
  );
}