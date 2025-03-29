import React from 'react';
import { Laptop, AlertTriangle, RefreshCw } from 'lucide-react';

const devices = [
  {
    id: 'NAS-01',
    name: 'Network Storage',
    ip: '192.168.1.100',
    status: 'online',
    type: 'storage',
    lastSeen: '2 mins ago',
    ports: [21, 22, 80, 443],
    riskLevel: 'high'
  },
  // Add more mock devices here
];

export function DeviceGrid() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Connected Devices</h2>
        <button className="flex items-center space-x-2 text-primary hover:text-primary/80">
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(device => (
          <div
            key={device.id}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/20 hover:shadow-lg transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-medium">{device.name}</h3>
                <p className="text-sm text-gray-600">{device.ip}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium
                ${device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {device.status}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last seen</span>
                <span>{device.lastSeen}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Open ports</span>
                <div className="flex items-center space-x-1">
                  {device.ports.map(port => (
                    <span key={port} className="px-1.5 py-0.5 bg-gray-100 rounded">
                      {port}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Risk level</span>
                <div className={`flex items-center space-x-1
                  ${device.riskLevel === 'high' ? 'text-red-600' : 'text-yellow-600'}`}>
                  <AlertTriangle className="h-4 w-4" />
                  <span className="capitalize">{device.riskLevel}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}