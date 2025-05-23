import { RRule, RRuleSet, rrulestr } from 'rrule';
import { Event, RecurrenceRule } from '../types/calendar';
import { addDays, addMonths, addWeeks, startOfDay, endOfDay } from 'date-fns';

export const generateRecurringEvents = (
  event: Event,
  startDate: Date,
  endDate: Date
): Event[] => {
  if (!event.recurrence || event.recurrence.type === 'none') {
    return [event];
  }

  const events: Event[] = [];
  const { recurrence } = event;
  let currentDate = new Date(event.start);

  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      const eventEnd = new Date(currentDate.getTime() + (event.end.getTime() - event.start.getTime()));
      events.push({
        ...event,
        start: new Date(currentDate),
        end: eventEnd,
      });
    }

    // Calculate next occurrence
    switch (recurrence.type) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + (recurrence.interval || 1));
        break;
      case 'weekly':
        if (recurrence.daysOfWeek) {
          const currentDay = currentDate.getDay();
          const nextDayIndex = recurrence.daysOfWeek.findIndex(day => day > currentDay);
          if (nextDayIndex !== -1) {
            currentDate.setDate(currentDate.getDate() + (recurrence.daysOfWeek[nextDayIndex] - currentDay));
          } else {
            currentDate.setDate(currentDate.getDate() + (7 - currentDay + recurrence.daysOfWeek[0]));
          }
        } else {
          currentDate.setDate(currentDate.getDate() + 7 * (recurrence.interval || 1));
        }
        break;
      case 'monthly':
        if (recurrence.monthDay) {
          currentDate.setMonth(currentDate.getMonth() + 1);
          currentDate.setDate(recurrence.monthDay);
        } else {
          currentDate.setMonth(currentDate.getMonth() + (recurrence.interval || 1));
        }
        break;
      case 'custom':
        if (recurrence.interval) {
          currentDate.setDate(currentDate.getDate() + recurrence.interval);
        }
        break;
    }

    // Check if we've reached the end date
    if (recurrence.endDate && currentDate > recurrence.endDate) {
      break;
    }
  }

  return events;
};

export const isEventInRange = (event: Event, startDate: Date, endDate: Date): boolean => {
  const recurringEvents = generateRecurringEvents(event, startDate, endDate);
  return recurringEvents.some(e => 
    (e.start <= endDate && e.end >= startDate)
  );
};