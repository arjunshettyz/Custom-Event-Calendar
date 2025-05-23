import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  isToday,
  addHours,
  isBefore,
  isAfter,
  areIntervalsOverlapping,
  getHours,
  getMinutes,
  setHours,
  setMinutes
} from 'date-fns';
import { Event } from '../../types/calendar';
import { getEventColor } from '../../utils/calendarUtils';
import { DndContext, DragEndEvent, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import DraggableEvent from '../DraggableEvent';
import DroppableCell from '../DroppableCell';

const WeekView: React.FC = () => {
  const { date, events, setSelectedEvent, setIsModalOpen, setIsCreatingEvent, setSelectedTimeSlot, moveEvent } = useCalendar();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor);

  // Calculate days of the week
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Generate hours for the day (8am to 8pm)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsCreatingEvent(false);
    setIsModalOpen(true);
  };
  
  const handleCellClick = (day: Date, hour: number) => {
    const startDate = new Date(day);
    startDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(day);
    endDate.setHours(hour + 1, 0, 0, 0);
    
    setSelectedTimeSlot({ start: startDate, end: endDate });
    setSelectedEvent(null);
    setIsCreatingEvent(true);
    setIsModalOpen(true);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.data.current) {
      const droppedEvent = active.data.current as Event;
      const [, dropDate, dropHour] = over.id.toString().split('-');
      const newDate = new Date(parseInt(dropDate));
      
      // Calculate the time difference from the start of the hour
      const originalStartMinutes = droppedEvent.start.getMinutes();
      const originalDuration = droppedEvent.end.getTime() - droppedEvent.start.getTime();
      
      // Set the new start time while preserving minutes
      const newStart = setHours(setMinutes(newDate, originalStartMinutes), parseInt(dropHour));
      const newEnd = new Date(newStart.getTime() + originalDuration);
      
      moveEvent(droppedEvent.id, newStart, newEnd);
    }
  };
  
  const isEventInHour = (event: Event, day: Date, hour: number) => {
    const hourStart = setHours(setMinutes(new Date(day), 0), hour);
    const hourEnd = setHours(setMinutes(new Date(day), 59), hour);
    
    return areIntervalsOverlapping(
      { start: hourStart, end: hourEnd },
      { start: event.start, end: event.end }
    ) && isSameDay(event.start, day);
  };
  
  const getEventsForHourAndDay = (day: Date, hour: number) => {
    return events.filter(event => !event.allDay && isEventInHour(event, day, hour));
  };
  
  const getAllDayEvents = (day: Date) => {
    return events.filter(event => 
      event.allDay && isSameDay(event.start, day)
    );
  };
  
  const formatEventTime = (event: Event) => {
    return `${getHours(event.start)}:${getMinutes(event.start).toString().padStart(2, '0')}`;
  };
  
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  
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

        <div className="grid grid-cols-8 border-b border-[#2F3645] bg-[#FAF6E3]">
          <div className="border-r border-[#2F3645] p-2"></div>
          {weekDays.map((day) => (
            <div 
              key={day.toString()} 
              className={`p-2 text-center border-r border-[#2F3645] ${
                isToday(day) ? 'bg-[#D8DBBD]/20' : ''
              }`}
            >
              <div className="text-sm font-medium text-[#2F3645]">
                {format(day, 'EEE')}
              </div>
              <div className={`text-lg ${
                isToday(day) ? 'font-bold text-[#2A3663]' : 'text-[#2A3663]'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto calendar-scrollbar">
          <div className="grid grid-cols-8">
            {/* Time column */}
            <div className="border-r border-[#2F3645]">
              {hours.map((hour) => (
                <div 
                  key={hour} 
                  className="h-16 border-b border-[#2F3645]/20 p-1 text-xs text-[#2F3645]"
                >
                  {format(setHours(new Date(), hour), 'h:mm a')}
                </div>
              ))}
            </div>
            
            {/* Day columns */}
            {weekDays.map((day) => (
              <div key={day.toString()} className="relative border-r border-[#2F3645]">
                {hours.map((hour) => (
                  <DroppableCell
                    key={hour}
                    date={day}
                    onDrop={(event) => {
                      const originalStartMinutes = event.start.getMinutes();
                      const originalDuration = event.end.getTime() - event.start.getTime();
                      
                      const newStart = setHours(setMinutes(day, originalStartMinutes), hour);
                      const newEnd = new Date(newStart.getTime() + originalDuration);
                      
                      moveEvent(event.id, newStart, newEnd);
                    }}
                  >
                    <div 
                      className="h-16 border-b border-[#2F3645]/20 p-1 relative"
                      onClick={() => handleCellClick(day, hour)}
                    >
                      {getEventsForHourAndDay(day, hour).map((event) => (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          onClick={(e) => handleEventClick(event, e)}
                          style={{
                            position: 'absolute',
                            left: 4,
                            right: 4,
                            top: `${((getMinutes(event.start) / 60) * 100)}%`,
                            height: `${Math.max(((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 100, 10)}%`,
                            zIndex: 10
                          }}
                        />
                      ))}
                    </div>
                  </DroppableCell>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default WeekView;