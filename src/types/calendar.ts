export type ViewType = 'month' | 'week' | 'day';

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';

export interface RecurrenceRule {
  type: RecurrenceType;
  interval?: number;
  endDate?: Date;
  daysOfWeek?: number[];
  monthDay?: number;
}

export type Event = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  };
};

export type CalendarEvent = Event & {
  isRecurring?: boolean;
  originalEventId?: string;
};

export interface CalendarContextType {
  date: Date;
  view: ViewType;
  events: Event[];
  setDate: (date: Date) => void;
  setView: (view: ViewType) => void;
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  isCreatingEvent: boolean;
  setIsCreatingEvent: (isCreating: boolean) => void;
  selectedTimeSlot: { start: Date; end: Date } | null;
  setSelectedTimeSlot: (timeSlot: { start: Date; end: Date } | null) => void;
  moveEvent: (id: string, start: Date, end: Date) => void;
  searchEvents: (query: string) => Event[];
  setFilters: (filters: { searchQuery: string; category?: string; dateRange?: { start: Date; end: Date } }) => void;
  setEvents: (events: Event[]) => void;
}

export type CalendarView = 'month' | 'week' | 'day';

export type TimeSlot = {
  start: Date;
  end: Date;
};

export const EVENT_COLORS = [
  { name: 'Default', value: '#2F3645' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Indigo', value: '#6366F1' }
];