import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Event } from '../types/calendar';

interface DroppableCellProps {
  date: Date;
  children: React.ReactNode;
  onDrop: (event: Event, date: Date) => void;
  className?: string;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ date, children, onDrop, className = '' }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${date.getTime()}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'bg-[#D8DBBD]/20' : ''}`}
    >
      {children}
    </div>
  );
};

export default DroppableCell;