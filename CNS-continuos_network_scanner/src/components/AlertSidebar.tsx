import React from 'react';
import { X, AlertTriangle, AlertCircle, Bell } from 'lucide-react';

interface AlertSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertSidebar({ isOpen, onClose }: AlertSidebarProps) {
  return (
    <div className={`
      fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl
      transform transition-transform duration-300
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Alerts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Critical Alerts</p>
              <p className="text-sm text-red-700">2 unresolved issues</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">Warnings</p>
              <p className="text-sm text-yellow-700">5 items need attention</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Notifications</p>
              <p className="text-sm text-blue-700">12 new updates</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}