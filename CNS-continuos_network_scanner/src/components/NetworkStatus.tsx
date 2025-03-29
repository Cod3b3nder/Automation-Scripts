import React from 'react';
import { Activity, Wifi, Shield, Clock } from 'lucide-react';

export function NetworkStatus() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Network Status Overview</h2>
            <div className="flex items-center space-x-2">
              <span className="inline-block h-2 w-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-gray-600">Healthy</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Wifi className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600">Active Devices</span>
              </div>
              <p className="text-2xl font-semibold">24/28</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600">Bandwidth</span>
              </div>
              <p className="text-2xl font-semibold">2.4 GB/s</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600">Security</span>
              </div>
              <p className="text-2xl font-semibold">Protected</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-sm text-gray-600">Last Scan</span>
              </div>
              <p className="text-sm font-medium">2 mins ago</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <canvas id="bandwidthChart" className="w-full h-[200px]"></canvas>
          <div className="absolute top-0 right-0">
            <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">24h</button>
            <button className="text-sm text-primary font-medium px-3 py-1">7d</button>
            <button className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1">30d</button>
          </div>
        </div>
      </div>
    </div>
  );
}