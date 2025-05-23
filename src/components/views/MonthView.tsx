import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameMonth, 
  isSameDay,
  isToday,
  addDays,
  setHours,
  setMinutes
} from 'date-fns';
import { Event } from '../../types/calendar';
import { DndContext, DragEndEvent, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import DraggableEvent from '../DraggableEvent';
import DroppableCell from '../DroppableCell';

const MonthView: React.FC = () => {
  const { date, events, setSelectedEvent, setIsModalOpen, setIsCreatingEvent, setSelectedTimeSlot, moveEvent } = useCalendar();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor);

  // Calculate days to display
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Group days into weeks
  const weeks = [];
  let week = [];
  
  allDays.forEach((day) => {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsCreatingEvent(false);
    setIsModalOpen(true);
  };
  
  const handleCellClick = (day: Date) => {
    const startDate = new Date(day);
    startDate.setHours(9, 0, 0, 0);
    
    const endDate = new Date(day);
    endDate.setHours(10, 0, 0, 0);
    
    setSelectedTimeSlot({ start: startDate, end: endDate });
    setSelectedEvent(null);
    setIsCreatingEvent(true);
    setIsModalOpen(true);
  };
  
  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.start, day));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.data.current) {
      const droppedEvent = active.data.current as Event;
      const [, dropDate] = over.id.toString().split('-');
      const newDate = new Date(parseInt(dropDate));
      
      const newStart = setHours(setMinutes(newDate, droppedEvent.start.getMinutes()), droppedEvent.start.getHours());
      const newEnd = setHours(setMinutes(newDate, droppedEvent.end.getMinutes()), droppedEvent.end.getHours());
      
      moveEvent(droppedEvent.id, newStart, newEnd);
    }
  };

  const handleDrop = (event: Event, day: Date) => {
    const hoursDiff = event.end.getHours() - event.start.getHours();
    const minutesDiff = event.end.getMinutes() - event.start.getMinutes();
    
    const newStart = setHours(setMinutes(day, event.start.getMinutes()), event.start.getHours());
    const newEnd = setHours(setMinutes(day, event.end.getMinutes()), event.end.getHours());
    
    moveEvent(event.id, newStart, newEnd);
  };

  const renderEvents = (day: Date) => {
    const dayEvents = events.filter(event => isSameDay(event.start, day));
    const hasMultipleEvents = dayEvents.length > 1;
    const maxVisibleEvents = 2;

    return (
      <div className="relative">
        <div className="space-y-0.5">
          {dayEvents.slice(0, maxVisibleEvents).map(event => (
            <DraggableEvent
              key={event.id}
              event={event}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEvent(event);
                setIsModalOpen(true);
              }}
              isCompact={hasMultipleEvents}
            />
          ))}
        </div>
        {dayEvents.length > maxVisibleEvents && (
          <div className="group relative">
            <div className="text-xs text-[#2F3645] mt-1 cursor-pointer hover:text-[#1F2430]">
              +{dayEvents.length - maxVisibleEvents} more
            </div>
            <div className="absolute left-0 top-full z-50 hidden group-hover:block bg-[#FAF6E3] rounded-lg shadow-lg p-2 min-w-[200px] border border-[#2F3645]/20">
              <div className="space-y-1">
                {dayEvents.slice(maxVisibleEvents).map(event => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded cursor-pointer hover:bg-[#2F3645]/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="font-medium">{event.title}</div>
                    {!event.allDay && (
                      <div className="text-[10px] opacity-80">
                        {format(event.start, 'h:mm a')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full flex flex-col">
        <style>
          {`
            .calendar-scrollbar::-webkit-scrollbar {
              width: 4px;
            }
            .calendar-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .calendar-scrollbar::-webkit-scrollbar-thumb {
              background: #2F3645;
              border-radius: 2px;
            }
            .calendar-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #1F2430;
            }
          `}
        </style>

        <div className="grid grid-cols-7 border-b border-[#2F3645] bg-[#FAF6E3]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
            <div key={i} className="py-2 text-center text-sm font-medium text-[#2F3645]">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto calendar-scrollbar">
          <div className="grid grid-cols-7 h-full">
            {weeks.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const dayEvents = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, date);
                  const isCurrentDay = isToday(day);
                  
                  return (
                    <DroppableCell
                      key={dayIndex}
                      date={day}
                      onDrop={(event) => handleDrop(event, day)}
                    >
                      <div 
                        className={`min-h-[120px] p-1 border-r border-b border-[#2F3645]/20 ${
                          !isCurrentMonth ? 'bg-[#FAF6E3]/50' : ''
                        } ${isCurrentDay ? 'bg-[#D8DBBD]/20' : ''}`}
                        onClick={() => handleCellClick(day)}
                      >
                        <div className={`text-sm mb-1 ${
                          isCurrentDay 
                            ? 'font-bold text-[#2A3663]' 
                            : isCurrentMonth 
                              ? 'text-[#2A3663]' 
                              : 'text-[#2F3645]'
                        }`}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {renderEvents(day)}
                        </div>
                      </div>
                    </DroppableCell>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default MonthView;