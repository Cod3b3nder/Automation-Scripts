import React, { useState } from 'react';
import { Minus, X } from 'lucide-react';

interface DraggableWidgetProps {
  id: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  position: { x: number; y: number };
  onPositionChange: (x: number, y: number) => void;
}

export function DraggableWidget({
  id,
  title,
  onClose,
  children,
  position,
  onPositionChange,
}: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 300, height: 200 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onPositionChange(newX, newY);
    } else if (isResizing) {
      const newWidth = e.clientX - position.x;
      const newHeight = e.clientY - position.y;
      setSize({
        width: Math.max(200, newWidth), // Minimum width
        height: Math.max(150, newHeight), // Minimum height
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  return (
    <div
      className="absolute cyber-panel"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        className="flex items-center justify-between p-2 border-b border-[#00ff00] bg-[#111111]"
        onMouseDown={handleMouseDown}
      >
        <span className="text-sm neon-text">{title}</span>
        <div className="flex items-center space-x-2">
          <button className="p-1 hover:bg-[#222222] rounded">
            <Minus className="h-4 w-4" />
          </button>
          <button className="p-1 hover:bg-[#222222] rounded" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 40px)' }}>
        {children}
      </div>
      
      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
        style={{
          backgroundImage: 'radial-gradient(circle, #00ff00 1px, transparent 1px)',
          backgroundSize: '4px 4px',
          backgroundPosition: 'center',
        }}
      />
    </div>
  );
}