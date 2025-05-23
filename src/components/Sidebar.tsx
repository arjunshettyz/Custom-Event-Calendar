import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isAfter, isBefore, addDays } from 'date-fns';
import { ChevronDown, Plus, Clock, Calendar, X } from 'lucide-react';

const colorOptions = [
  { id: 1, color: 'bg-blue-500', text: 'Blue', borderColor: 'border-blue-500' },
  { id: 2, color: 'bg-green-500', text: 'Green', borderColor: 'border-green-500' },
  { id: 3, color: 'bg-red-500', text: 'Red', borderColor: 'border-red-500' },
  { id: 4, color: 'bg-yellow-500', text: 'Yellow', borderColor: 'border-yellow-500' },
  { id: 5, color: 'bg-purple-500', text: 'Purple', borderColor: 'border-purple-500' },
  { id: 6, color: 'bg-pink-500', text: 'Pink', borderColor: 'border-pink-500' },
  { id: 7, color: 'bg-indigo-500', text: 'Indigo', borderColor: 'border-indigo-500' },
  { id: 8, color: 'bg-teal-500', text: 'Teal', borderColor: 'border-teal-500' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { 
    date, 
    setDate, 
    setSelectedTimeSlot, 
    setIsCreatingEvent, 
    setIsModalOpen,
    events,
    setSelectedEvent
  } = useCalendar();

  const handleQuickEvent = () => {
    const now = new Date();
    const endTime = new Date(now);
    endTime.setHours(now.getHours() + 1);
    
    setSelectedTimeSlot({ start: now, end: endTime });
    setIsCreatingEvent(true);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsCreatingEvent(false);
    setIsModalOpen(true);
  };

  // Generate days for mini calendar
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get upcoming events (next 7 days)
  const today = new Date();
  const nextWeek = addDays(today, 7);
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.start);
      return isAfter(eventDate, today) && isBefore(eventDate, nextWeek);
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#FAF6E3] border-r border-[#2F3645]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 flex flex-col h-full">
          <style>
            {`
              .custom-scrollbar::-webkit-scrollbar {
                width: 2px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #2F3645;
                border-radius: 1px;
                opacity: 0.3;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #2F3645;
                opacity: 0.5;
              }
            `}
          </style>

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={handleQuickEvent}
              className="flex-1 bg-[#2F3645] text-white py-2 px-4 rounded-md hover:bg-[#D8DBBD] transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Quick Event
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-2 ml-2 hover:bg-[#2F3645]/10 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-[#2F3645]" />
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#2A3663] mb-2">
              {format(date, 'MMMM yyyy')}
            </h2>
            <div className="grid grid-cols-7 gap-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-sm text-[#2F3645]">
                  {day}
                </div>
              ))}
              {days.map(day => (
                <button
                  key={day.toString()}
                  onClick={() => setDate(day)}
                  className={`text-center p-1 rounded-md text-sm ${
                    isToday(day)
                      ? 'bg-[#2F3645] text-white'
                      : isSameMonth(day, date)
                      ? 'text-[#2A3663] hover:bg-[#D8DBBD]/20'
                      : 'text-[#2F3645]/50'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <h2 className="text-lg font-semibold text-[#2A3663] mb-2">Upcoming Events</h2>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="w-full text-left p-3 rounded-md hover:bg-[#D8DBBD]/20 transition-colors border border-[#2F3645]/20"
                  >
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: event.color || '#2F3645' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[#2A3663] truncate">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[#2F3645] mt-1">
                          <Calendar size={14} />
                          <span>{format(new Date(event.start), 'MMM d, yyyy')}</span>
                        </div>
                        {!event.allDay && (
                          <div className="flex items-center gap-2 text-sm text-[#2F3645] mt-1">
                            <Clock size={14} />
                            <span>
                              {format(new Date(event.start), 'h:mm a')} - 
                              {format(new Date(event.end), 'h:mm a')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-[#2A3663]">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;