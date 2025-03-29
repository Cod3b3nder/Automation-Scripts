import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertBannerProps {
  message: string;
  severity: 'critical' | 'warning';
  onClose: () => void;
}

export function AlertBanner({ message, severity, onClose }: AlertBannerProps) {
  return (
    <div className={`
      ${severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'}
      text-white px-6 py-3
    `}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded-full"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}