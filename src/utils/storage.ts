import { Event } from '../types/calendar';

const STORAGE_KEY = 'calendar_events';

export const saveEvents = (events: Event[]): void => {
  try {
    const serializedEvents = JSON.stringify(events, (key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    localStorage.setItem(STORAGE_KEY, serializedEvents);
  } catch (error) {
    console.error('Error saving events:', error);
  }
};

export const loadEvents = (): Event[] => {
  try {
    const serializedEvents = localStorage.getItem(STORAGE_KEY);
    if (!serializedEvents) return [];

    return JSON.parse(serializedEvents, (key, value) => {
      if (key === 'start' || key === 'end' || key === 'endDate') {
        return new Date(value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error loading events:', error);
    return [];
  }
}; 