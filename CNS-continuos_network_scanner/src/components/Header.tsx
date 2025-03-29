import React from 'react';
import { Network, Bell, Search, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onAlertClick: () => void;
}

export function Header({ onAlertClick }: HeaderProps) {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Network className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">NetMonitor</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-primary font-medium">Dashboard</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Devices</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Alerts</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Reports</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Settings</a>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none focus:outline-none ml-2 w-48"
            />
          </div>

          <button
            onClick={onAlertClick}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
            <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <ChevronDown className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}