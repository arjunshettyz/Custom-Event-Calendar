import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Event } from '../types/calendar';

interface DraggableEventProps {
  event: Event;
  onClick: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  isCompact?: boolean;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ event, onClick, style, isCompact = false }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `event-${event.id}`,
    data: event,
  });

  const eventStyle = transform ? {
    ...style,
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : style;

  // Convert hex to rgba for transparency
  const hexToRGBA = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const eventColor = event.color || '#2F3645';

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`rounded truncate cursor-move backdrop-blur-sm ${
        isCompact ? 'px-1 py-0.5 text-[9px]' : 'px-2 py-1 text-xs'
      }`}
      style={{
        ...eventStyle,
        backgroundColor: hexToRGBA(eventColor, 0.15),
        color: eventColor,
        border: `1px solid ${hexToRGBA(eventColor, 0.3)}`,
        boxShadow: `0 2px 4px ${hexToRGBA(eventColor, 0.1)}`,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        marginBottom: isCompact ? '1px' : '4px',
        maxHeight: isCompact ? '16px' : 'auto',
        fontSize: isCompact ? '9px' : '12px',
        lineHeight: isCompact ? '1' : '1.5'
      }}
    >
      <div className="font-medium truncate">{event.title}</div>
      {!isCompact && !event.allDay && (
        <div className="text-xs opacity-90">
          {event.start.getHours()}:{event.start.getMinutes().toString().padStart(2, '0')}
        </div>
      )}
      {!isCompact && event.location && (
        <div className="text-xs truncate opacity-80">📍 {event.location}</div>
      )}
    </div>
  );
};

export default DraggableEvent;