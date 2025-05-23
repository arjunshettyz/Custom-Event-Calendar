import React, { createContext, useContext, useState, useEffect } from 'react';
import { Event, ViewType, CalendarContextType } from '../types/calendar';
import { saveEvents, loadEvents } from '../utils/storage';
import { generateRecurringEvents } from '../utils/recurrence';
import { v4 as uuidv4 } from 'uuid';
import { getAllEvents, saveEvent, deleteEvent as deleteEventFromDB } from '../utils/db';
import { startOfMonth, endOfMonth, areIntervalsOverlapping, addDays, addWeeks, addMonths, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

interface FilterState {
  searchQuery: string;
  category?: string;
  dateRange?: { start: Date; end: Date };
}

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('calendarEvents');
    if (savedEvents) {
      return JSON.parse(savedEvents, (key, value) => {
        if (key === 'start' || key === 'end' || (key === 'endDate' && value)) {
          return new Date(value);
        }
        return value;
      });
    }
    return [];
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [filters, setFilters] = useState<FilterState>({ searchQuery: '' });

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  const generateRecurringEvents = (event: Event): Event[] => {
    if (!event.recurrence) return [event];

    const events: Event[] = [];
    const { frequency, interval, endDate, daysOfWeek } = event.recurrence;
    let currentDate = event.start;
    const end = endDate || addMonths(currentDate, 12); // Default to 1 year if no end date

    while (currentDate < end) {
      let nextDate: Date;
      switch (frequency) {
        case 'daily':
          nextDate = addDays(currentDate, interval);
          break;
        case 'weekly':
          if (daysOfWeek && daysOfWeek.length > 0) {
            // For weekly with specific days, generate events for each selected day
            const weekStart = startOfDay(currentDate);
            for (let i = 0; i < 7; i++) {
              const dayDate = addDays(weekStart, i);
              if (daysOfWeek.includes(dayDate.getDay())) {
                const newEvent: Event = {
                  ...event,
                  id: uuidv4(), // Generate new unique ID for each instance
                  start: new Date(dayDate.setHours(event.start.getHours(), event.start.getMinutes())),
                  end: new Date(dayDate.setHours(event.end.getHours(), event.end.getMinutes())),
                  recurrence: undefined // Remove recurrence info from individual instances
                };
                events.push(newEvent);
              }
            }
            nextDate = addWeeks(currentDate, interval);
          } else {
            nextDate = addWeeks(currentDate, interval);
          }
          break;
        case 'monthly':
          nextDate = addMonths(currentDate, interval);
          break;
        default:
          nextDate = addDays(currentDate, interval);
      }

      if (nextDate >= end) break;

      const newEvent: Event = {
        ...event,
        id: uuidv4(), // Generate new unique ID for each instance
        start: new Date(nextDate.setHours(event.start.getHours(), event.start.getMinutes())),
        end: new Date(nextDate.setHours(event.end.getHours(), event.end.getMinutes())),
        recurrence: undefined // Remove recurrence info from individual instances
      };
      events.push(newEvent);
      currentDate = nextDate;
    }

    return events;
  };

  const addEvent = (event: Omit<Event, 'id'>) => {
    try {
      // Create new event with unique ID
      const newEvent: Event = {
        ...event,
        id: uuidv4()
      };

      // If it's a recurring event, generate all instances
      if (event.recurrence) {
        const recurringEvents = generateRecurringEvents(newEvent);
        setEvents(prev => {
          const updatedEvents = [...prev, ...recurringEvents];
          // Save to localStorage
          localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
          return updatedEvents;
        });
      } else {
        // If it's a single event, just add it
        setEvents(prev => {
          const updatedEvents = [...prev, newEvent];
          // Save to localStorage
          localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
          return updatedEvents;
        });
      }

      // Reset modal state
      setIsModalOpen(false);
      setIsCreatingEvent(false);
      setSelectedEvent(null);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const updateEvent = (id: string, updatedEvent: Event) => {
    try {
      setEvents(prev => {
        // Find and update the specific event
        return prev.map(event => 
          event.id === id ? updatedEvent : event
        );
      });

      // Save to localStorage
      localStorage.setItem('calendarEvents', JSON.stringify(events));

      // Reset modal state
      setIsModalOpen(false);
      setSelectedEvent(null);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = (id: string) => {
    try {
      setEvents(prev => {
        const updatedEvents = prev.filter(e => e.id !== id);
        // Save to localStorage
        localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
        return updatedEvents;
      });
      setIsModalOpen(false);
      setSelectedEvent(null);
      setSelectedTimeSlot(null);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const moveEvent = (id: string, newStart: Date, newEnd: Date) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id.startsWith(id)) {
          const timeDiff = newStart.getTime() - event.start.getTime();
          return {
            ...event,
            start: new Date(event.start.getTime() + timeDiff),
            end: new Date(event.end.getTime() + timeDiff)
          };
        }
        return event;
      });
    });
  };

  const searchEvents = (query: string): Event[] => {
    const searchTerm = query.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(searchTerm) ||
      event.description?.toLowerCase().includes(searchTerm) ||
      event.location?.toLowerCase().includes(searchTerm)
    );
  };

  const getFilteredEvents = (): Event[] => {
    return events.filter(event => {
      // Search filter
      if (filters.searchQuery) {
        const searchTerm = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          event.title.toLowerCase().includes(searchTerm) ||
          event.description?.toLowerCase().includes(searchTerm) ||
          event.location?.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && event.category !== filters.category) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        const rangeStart = new Date(filters.dateRange.start);
        const rangeEnd = new Date(filters.dateRange.end);

        if (eventStart > rangeEnd || eventEnd < rangeStart) {
          return false;
      }
      }
    
      return true;
    });
  };

  const value: CalendarContextType = {
    date,
    view,
    events: getFilteredEvents(),
    setDate,
    setView,
    addEvent,
    updateEvent,
    deleteEvent,
    selectedEvent,
    setSelectedEvent,
    isModalOpen,
    setIsModalOpen,
    isCreatingEvent,
    setIsCreatingEvent,
    selectedTimeSlot,
    setSelectedTimeSlot,
    moveEvent,
    searchEvents,
    setFilters,
    setEvents,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};