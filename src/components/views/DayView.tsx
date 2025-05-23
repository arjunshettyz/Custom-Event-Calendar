import React from 'react';
import { useCalendar } from '../../context/CalendarContext';
import { 
  format, 
  isSameDay,
  isToday,
  addHours,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  areIntervalsOverlapping
} from 'date-fns';
import { Event } from '../../types/calendar';
import { getEventColor } from '../../utils/calendarUtils';
import { DndContext, DragEndEvent, MouseSensor, useSensor, useSensors } from '@dnd-kit/core';
import DraggableEvent from '../DraggableEvent';
import DroppableCell from '../DroppableCell';

const DayView: React.FC = () => {
  const { date, events, setSelectedEvent, setIsModalOpen, setIsCreatingEvent, setSelectedTimeSlot, moveEvent } = useCalendar();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const sensors = useSensors(mouseSensor);

  // Generate hours for the day (8am to 8pm)
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  
  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsCreatingEvent(false);
    setIsModalOpen(true);
  };
  
  const handleCellClick = (hour: number) => {
    const startDate = new Date(date);
    startDate.setHours(hour, 0, 0, 0);
    
    const endDate = new Date(date);
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
      const [, dropHour] = over.id.toString().split('-');
      
      // Calculate the time difference from the start of the hour
      const originalStartMinutes = droppedEvent.start.getMinutes();
      const originalDuration = droppedEvent.end.getTime() - droppedEvent.start.getTime();
      
      // Set the new start time while preserving minutes
      const newStart = setHours(setMinutes(new Date(date), originalStartMinutes), parseInt(dropHour));
      const newEnd = new Date(newStart.getTime() + originalDuration);
      
      moveEvent(droppedEvent.id, newStart, newEnd);
    }
  };
  
  const isEventInHour = (event: Event, hour: number) => {
    const hourStart = setHours(setMinutes(new Date(date), 0), hour);
    const hourEnd = setHours(setMinutes(new Date(date), 59), hour);
    
    return areIntervalsOverlapping(
      { start: hourStart, end: hourEnd },
      { start: event.start, end: event.end }
    ) && isSameDay(event.start, date);
  };
  
  const getEventsForHour = (hour: number) => {
    return events.filter(event => !event.allDay && isEventInHour(event, hour));
  };
  
  const getAllDayEvents = () => {
    return events.filter(event => 
      event.allDay && isSameDay(event.start, date)
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

        <div className="border-b border-[#2F3645] bg-[#FAF6E3] p-4">
          <h2 className="text-xl font-semibold text-[#2A3663]">
            {format(date, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto calendar-scrollbar">
          <div className="grid grid-cols-1">
            {/* All-day events section */}
            <div className="border-b border-[#2F3645] p-2">
              <div className="text-sm font-medium text-[#2F3645] mb-2">All Day</div>
              <div className="space-y-2">
                {getAllDayEvents().map((event) => (
                  <DraggableEvent
                    key={event.id}
                    event={event}
                    onClick={(e) => handleEventClick(event, e)}
                  />
                ))}
              </div>
            </div>

            {/* Time grid */}
            <div className="grid grid-cols-1">
              {hours.map((hour) => (
                <DroppableCell
                  key={hour}
                  date={date}
                  onDrop={(event) => {
                    const originalStartMinutes = event.start.getMinutes();
                    const originalDuration = event.end.getTime() - event.start.getTime();
                    
                    const newStart = setHours(setMinutes(new Date(date), originalStartMinutes), hour);
                    const newEnd = new Date(newStart.getTime() + originalDuration);
                    
                    moveEvent(event.id, newStart, newEnd);
                  }}
                >
                  <div className="flex h-16 border-b border-[#2F3645]/20">
                    <div className="w-20 flex-shrink-0 text-right pr-4 pt-1 text-sm text-[#2F3645]">
                      {format(setHours(new Date(), hour), 'h:mm a')}
                    </div>
                    <div className="flex-1 relative">
                      {getEventsForHour(hour).map((event) => (
                        <DraggableEvent
                          key={event.id}
                          event={event}
                          onClick={(e) => handleEventClick(event, e)}
                          style={{
                            position: 'absolute',
                            left: 8,
                            right: 8,
                            top: `${((getMinutes(event.start) / 60) * 100)}%`,
                            height: `${Math.max(((event.end.getTime() - event.start.getTime()) / (1000 * 60 * 60)) * 100, 10)}%`,
                            zIndex: 10
                          }}
                        />
                      ))}
                      
                      {isToday(date) && currentHour === hour && (
                        <div 
                          className="absolute left-0 right-0 border-t border-[#2F3645] z-20"
                          style={{ top: `${(currentMinute / 60) * 100}%` }}
                        >
                          <div className="absolute -left-1 -top-1.5 w-2.5 h-2.5 rounded-full bg-[#2F3645]"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </DroppableCell>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default DayView;