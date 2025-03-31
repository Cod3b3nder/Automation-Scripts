import React, { useEffect, useState, useRef } from 'react';
import { Network, MonitorDot, Shield, Terminal, AlertTriangle, Play, Square } from 'lucide-react';
import { NetworkMap } from './components/NetworkMap';
import { StatusPanel } from './components/StatusPanel';
import { ThreatPanel } from './components/ThreatPanel';
import { LogPanel } from './components/LogPanel';
import { DraggableWidget } from './components/DraggableWidget';
import { WidgetProvider, useWidgets } from './contexts/WidgetContext';

interface Port {
  port: number;
  state: string;
  service: string;
  version: string;
  product: string;
}

interface OS {
  name: string;
  accuracy: number;
  family: string;
}

interface Device {
  ip: string;
  hostname: string;
  os: OS;
  ports: Port[];
  status: string;
  last_seen: number;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_total: number;
  memory_used: number;
  memory_free: number;
}

interface NetworkData {
  devices: Device[];
  metrics: SystemMetrics;
  timestamp: number;
  scanning: boolean;
}

interface ErrorState {
  message: string;
  type: 'error' | 'warning';
  details?: string;
}

function MenuBar() {
  const { widgets, toggleWidget } = useWidgets();

  return (
    <div className="cyber-panel p-2 mb-4">
      <div className="flex items-center space-x-4">
        {widgets.map(widget => (
          <button
            key={widget.id}
            onClick={() => toggleWidget(widget.id)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded ${
              widget.visible ? 'bg-[#00ff00]/20' : 'hover:bg-[#00ff00]/10'
            }`}
          >
            {widget.id === 'status' && <MonitorDot className="h-4 w-4" />}
            {widget.id === 'threat' && <Shield className="h-4 w-4" />}
            {widget.id === 'logs' && <Terminal className="h-4 w-4" />}
            <span className="text-sm">{widget.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: ErrorState }) {
  return (
    <div className={`cyber-panel p-4 mb-4 ${
      error.type === 'error' ? 'text-[#ff0033]' : 'text-[#f59e0b]'
    } flex items-start space-x-3`}>
      <div className="flex-shrink-0 mt-1">
        {error.type === 'error' ? (
          <Shield className="h-5 w-5" />
        ) : (
          <AlertTriangle className="h-5 w-5" />
        )}
      </div>
      <div>
        <p className="font-medium">{error.message}</p>
        {error.details && (
          <p className="mt-1 text-sm opacity-80">{error.details}</p>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: 'idle' | 'loading' | 'success' | 'error' }) {
  const getStatusColor = () => {
    switch (status) {
      case 'loading': return 'text-[#f59e0b]';
      case 'success': return 'text-[#00ff00]';
      case 'error': return 'text-[#ff0033]';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'loading': return 'Scanning network...';
      case 'success': return 'Network scan complete';
      case 'error': return 'Scan failed';
      default: return 'Scanner idle';
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
      {status === 'loading' && (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      <span>{getStatusText()}</span>
    </div>
  );
}

function Dashboard() {
  const { widgets, updateWidget, toggleWidget } = useWidgets();
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isScanning, setIsScanning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchData = async () => {
    try {
      setFetchStatus('loading');
      console.log('Fetching network data...');
      
      const response = await fetch('http://localhost:5000/api/network');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Network data received:', data);
      
      setNetworkData(data);
      setError(null);
      setFetchStatus('success');
    } catch (err) {
      console.error('Error fetching network data:', err);
      
      if (err.message.includes('Failed to fetch')) {
        setError({
          type: 'error',
          message: 'Failed to connect to network scanner',
          details: 'Please ensure the Python server is running with administrator privileges.'
        });
      } else {
        setError({
          type: 'error',
          message: 'Network scanning error',
          details: err.message
        });
      }
      setFetchStatus('error');
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setFetchStatus('idle');
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      {/* Header Bar */}
      <div className="cyber-panel p-2 mb-4 flex items-center justify-between text-[#00ff00]">
        <div className="flex items-center space-x-4">
          <Network className="h-6 w-6" />
          <span className="text-xl neon-text">NETWORK SCANNER v1.0</span>
        </div>
        <div className="flex items-center space-x-6">
          <StatusIndicator status={fetchStatus} />
          <button
            onClick={isScanning ? stopScanning : startScanning}
            className={`flex items-center space-x-2 px-4 py-2 rounded ${
              isScanning ? 'bg-[#ff0033]/20 hover:bg-[#ff0033]/30' : 'bg-[#00ff00]/20 hover:bg-[#00ff00]/30'
            }`}
          >
            {isScanning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isScanning ? 'Stop Scanning' : 'Start Scanning'}</span>
          </button>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-green-500"></div>
            <div className="w-4 h-4 bg-blue-500"></div>
            <div className="w-4 h-4 bg-red-500"></div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Widget Menu Bar */}
      <MenuBar />

      {/* Main Network Map */}
      <div className="relative">
        <NetworkMap networkData={networkData} />

        {/* Draggable Widgets */}
        {widgets.map(widget => widget.visible && (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            position={{ x: widget.position.x, y: widget.position.y }}
            onPositionChange={(x, y) => 
              updateWidget(widget.id, { position: { ...widget.position, x, y } })
            }
            onClose={() => toggleWidget(widget.id)}
          >
            {widget.id === 'status' && <StatusPanel metrics={networkData?.metrics} />}
            {widget.id === 'threat' && <ThreatPanel devices={networkData?.devices} />}
            {widget.id === 'logs' && <LogPanel title="SYSTEM LOGS" devices={networkData?.devices} />}
          </DraggableWidget>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <WidgetProvider>
      <Dashboard />
    </WidgetProvider>
  );
}

export default App;