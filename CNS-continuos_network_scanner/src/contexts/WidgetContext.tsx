import React, { createContext, useContext, useState } from 'react';

type WidgetPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WidgetSettings = {
  id: string;
  title: string;
  visible: boolean;
  position: WidgetPosition;
};

type WidgetContextType = {
  widgets: WidgetSettings[];
  updateWidget: (id: string, settings: Partial<WidgetSettings>) => void;
  toggleWidget: (id: string) => void;
};

const defaultWidgets: WidgetSettings[] = [
  {
    id: 'status',
    title: 'SYSTEM STATUS',
    visible: true,
    position: { x: 0, y: 0, width: 300, height: 200 },
  },
  {
    id: 'threat',
    title: 'THREAT LEVEL',
    visible: true,
    position: { x: 0, y: 220, width: 300, height: 200 },
  },
  {
    id: 'logs',
    title: 'SYSTEM LOGS',
    visible: true,
    position: { x: 0, y: 440, width: 400, height: 200 },
  },
];

const WidgetContext = createContext<WidgetContextType | null>(null);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetSettings[]>(defaultWidgets);

  const updateWidget = (id: string, settings: Partial<WidgetSettings>) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, ...settings } : widget
    ));
  };

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(widget =>
      widget.id === id ? { ...widget, visible: !widget.visible } : widget
    ));
  };

  return (
    <WidgetContext.Provider value={{ widgets, updateWidget, toggleWidget }}>
      {children}
    </WidgetContext.Provider>
  );
}

export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (!context) throw new Error('useWidgets must be used within a WidgetProvider');
  return context;
};