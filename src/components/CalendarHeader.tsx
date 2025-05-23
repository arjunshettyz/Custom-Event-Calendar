import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Menu, Plus, Search, Download, Upload, Trash2, PanelLeft } from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';
import { format, addMonths, addWeeks, addDays, subMonths, subWeeks, subDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface CalendarHeaderProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ isSidebarOpen, onSidebarToggle }) => {
  const { date, view, setDate, setView, setSelectedTimeSlot, setIsModalOpen, setIsCreatingEvent, events, setFilters, setEvents } = useCalendar();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePrevious = () => {
    if (view === 'month') {
      setDate(subMonths(date, 1));
    } else if (view === 'week') {
      setDate(subWeeks(date, 1));
    } else {
      setDate(subDays(date, 1));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setDate(addMonths(date, 1));
    } else if (view === 'week') {
      setDate(addWeeks(date, 1));
    } else {
      setDate(addDays(date, 1));
    }
  };

  const handleToday = () => {
    setDate(new Date());
  };

  const handleCreateEvent = () => {
    setIsCreatingEvent(true);
    setIsModalOpen(true);
  };

  const handleQuickEvent = () => {
    const now = new Date();
    const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    setSelectedTimeSlot({ start: now, end });
    setIsCreatingEvent(true);
    setIsModalOpen(true);
  };

  const handleExportEvents = () => {
    const eventsData = JSON.stringify(events, null, 2);
    const blob = new Blob([eventsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-events-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportEvents = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            
            // Validate that imported data is an array
            if (!Array.isArray(importedData)) {
              alert('Invalid file format: Events must be an array');
              return;
            }

            // Validate and transform each event
            const validEvents = importedData.map((event, index) => {
              // Check required fields
              if (!event.title || !event.start || !event.end) {
                throw new Error(`Event at index ${index} is missing required fields (title, start, or end)`);
              }

              // Convert string dates to Date objects
              const startDate = new Date(event.start);
              const endDate = new Date(event.end);
              
              // Validate dates
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error(`Event at index ${index} has invalid date format`);
              }

              // Create valid event object
              return {
                id: event.id || uuidv4(), // Generate new ID if not present
                title: event.title,
                description: event.description || '',
                location: event.location || '',
                start: startDate,
                end: endDate,
                allDay: event.allDay || false,
                color: event.color || '#2F3645',
                recurrence: event.recurrence ? {
                  frequency: event.recurrence.frequency,
                  interval: event.recurrence.interval || 1,
                  endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
                  daysOfWeek: event.recurrence.daysOfWeek
                } : undefined
              };
            });

            // Update events in state and localStorage
            setEvents(validEvents);
            localStorage.setItem('calendarEvents', JSON.stringify(validEvents));
            alert(`Successfully imported ${validEvents.length} events`);
          } catch (error) {
            alert(error instanceof Error ? error.message : 'Error importing events');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClearAllEvents = () => {
    if (window.confirm('Are you sure you want to delete all events? This action cannot be undone.')) {
      setEvents([]);
      localStorage.setItem('calendarEvents', JSON.stringify([]));
    }
  };

  const getHeaderText = () => {
    if (view === 'month') {
      return format(date, 'MMMM yyyy');
    } else if (view === 'week') {
      return `Week of ${format(date, 'MMM d, yyyy')}`;
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };

  useEffect(() => {
    setFilters({ searchQuery });
  }, [searchQuery, setFilters]);

  const menuItems = [
    {
      label: 'Quick Event',
      icon: <Plus className="w-4 h-4" />,
      onClick: handleQuickEvent,
    },
    {
      label: 'Export Events',
      icon: <Download className="w-4 h-4" />,
      onClick: handleExportEvents,
    },
    {
      label: 'Import Events',
      icon: <Upload className="w-4 h-4" />,
      onClick: handleImportEvents,
    },
    {
      label: 'Clear All Events',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleClearAllEvents,
      className: 'text-red-500 hover:bg-red-50',
    },
  ];

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 sm:px-4 py-2 border-b border-[#2F3645] bg-[#FAF6E3] gap-2 sm:gap-0">
      {/* Left Section - Menu, Title, and Navigation */}
      <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
        {/* Sidebar Toggle Button - Only visible on mobile */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-2 hover:bg-[#2F3645]/10 rounded-lg transition-colors"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <PanelLeft className="w-5 h-5 text-[#2F3645]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-[#2F3645]/10 rounded-lg transition-colors"
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu className="w-5 h-5 text-[#2F3645]" />
          </button>
          {isMenuOpen && (
            <div className="fixed sm:absolute left-0 sm:left-auto top-[60px] sm:top-full mt-0 sm:mt-2 w-56 bg-[#FAF6E3] rounded-lg shadow-lg border border-[#2F3645]/20 z-[100]">
              <div className="py-1">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center space-x-2 hover:bg-[#2F3645]/10 ${item.className || ''}`}
                    aria-label={item.label}
                    title={item.label}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setIsSearchVisible(!isSearchVisible)}
          className="sm:hidden p-2 hover:bg-[#2F3645]/10 rounded-lg transition-colors"
          aria-label="Toggle search"
        >
          <Search className="w-5 h-5 text-[#2F3645]" />
        </button>

        <div className="flex items-center">
          <h1 className="text-lg sm:text-xl font-semibold text-[#2A3663]">Calendar</h1>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <button 
            onClick={handleToday}
            className="px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium text-[#2A3663] bg-[#FAF6E3] border border-[#2F3645] rounded-full hover:bg-[#D8DBBD]/20"
          >
            Today
          </button>
          <button 
            onClick={handlePrevious}
            className="p-1.5 rounded-full hover:bg-[#D8DBBD]/20"
            aria-label="Previous"
          >
            <ChevronLeft size={16} className="text-[#2A3663]" />
          </button>
          <button 
            onClick={handleNext}
            className="p-1.5 rounded-full hover:bg-[#D8DBBD]/20"
            aria-label="Next"
          >
            <ChevronRight size={16} className="text-[#2A3663]" />
          </button>
          <h2 className="text-sm sm:text-lg font-medium text-[#2A3663] min-w-[120px] sm:min-w-[180px]">{getHeaderText()}</h2>
        </div>
      </div>

      {/* Search Bar - Hidden on mobile unless toggled */}
      <div className={`${isSearchVisible ? 'block' : 'hidden'} sm:block flex-1 max-w-md mx-2 sm:mx-4 w-full sm:w-auto`}>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#2F3645]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-2 border border-[#2F3645]/20 rounded-full focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
          />
        </div>
      </div>

      {/* Right Section - View Controls and Create Event */}
      <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
        <div className="flex border border-[#2F3645] rounded-full overflow-hidden">
          <button 
            onClick={() => setView('month')} 
            className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium ${view === 'month' ? 'bg-[#2F3645] text-white' : 'bg-[#FAF6E3] text-[#2A3663] hover:bg-[#D8DBBD]/20'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setView('week')}
            className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium ${view === 'week' ? 'bg-[#2F3645] text-white' : 'bg-[#FAF6E3] text-[#2A3663] hover:bg-[#D8DBBD]/20'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('day')}
            className={`px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-medium ${view === 'day' ? 'bg-[#2F3645] text-white' : 'bg-[#FAF6E3] text-[#2A3663] hover:bg-[#D8DBBD]/20'}`}
          >
            Day
          </button>
        </div>
        <button 
          onClick={handleCreateEvent}
          className="flex items-center px-2 sm:px-3 py-1.5 bg-[#2F3645] text-white rounded-full hover:bg-[#D8DBBD] text-xs sm:text-sm"
        >
          <Plus size={14} className="mr-1" />
          <span>Event</span>
        </button>
      </div>
    </header>
  );
};

export default CalendarHeader;