import React, { useEffect, useState } from 'react';
import { Network, MonitorDot, Shield, Terminal, AlertTriangle } from 'lucide-react';
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

function Dashboard() {
  const { widgets, updateWidget, toggleWidget } = useWidgets();
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/network');
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setNetworkData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching network data:', err);
        
        if (err.message.includes('Failed to fetch')) {
          setError({
            type: 'error',
            message: 'Failed to connect to network scanner',
            details: 'Please ensure the Python server is running with administrator privileges and Nmap is installed correctly.'
          });
        } else if (err.message.includes('permission denied')) {
          setError({
            type: 'error',
            message: 'Permission denied',
            details: 'The network scanner requires administrator privileges. Please restart the application with elevated permissions.'
          });
        } else {
          setError({
            type: 'error',
            message: 'Network scanning error',
            details: err.message
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Fetch every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4">
      {/* Header Bar */}
      <div className="cyber-panel p-2 mb-4 flex items-center justify-between text-[#00ff00]">
        <div className="flex items-center space-x-4">
          <Network className="h-6 w-6" />
          <span className="text-xl neon-text">NETWORK SCANNER v1.0</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[#ff0033]">RED TEAM MODE</span>
          <div className="flex space-x-1">
            <div className="w-4 h-4 bg-green-500"></div>
            <div className="w-4 h-4 bg-blue-500"></div>
            <div className="w-4 h-4 bg-red-500"></div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} />}

      {/* Loading State */}
      {loading && (
        <div className="cyber-panel p-4 mb-4 text-[#00ff00] flex items-center">
          <div className="animate-spin h-5 w-5 mr-2 border-2 border-[#00ff00] border-t-transparent rounded-full" />
          Scanning network...
        </div>
      )}

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