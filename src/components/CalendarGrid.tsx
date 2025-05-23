import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';

const CalendarGrid: React.FC = () => {
  const { view } = useCalendar();

  return (
    <div className="flex-1 overflow-auto">
      {view === 'month' && <MonthView />}
      {view === 'week' && <WeekView />}
      {view === 'day' && <DayView />}
    </div>
  );
};

export default CalendarGrid;