import React, { useState, useEffect } from 'react';
import { Event, RecurrenceType } from '../types/calendar';
import { useCalendar } from '../context/CalendarContext';
import { format } from 'date-fns';

interface EventFormProps {
  initialEvent?: Event;
  onSubmit: (event: Omit<Event, 'id'>) => void;
  onCancel: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ initialEvent, onSubmit, onCancel }) => {
  const { events } = useCalendar();
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [description, setDescription] = useState(initialEvent?.description || '');
  const [start, setStart] = useState<Date>(initialEvent?.start || new Date());
  const [end, setEnd] = useState<Date>(initialEvent?.end || new Date());
  const [allDay, setAllDay] = useState(initialEvent?.allDay || false);
  const [location, setLocation] = useState(initialEvent?.location || '');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>(initialEvent?.recurrence?.type || 'none');
  const [interval, setInterval] = useState(initialEvent?.recurrence?.interval || 1);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEvent?.recurrence?.endDate);
  const [selectedDays, setSelectedDays] = useState<number[]>(initialEvent?.recurrence?.daysOfWeek || []);
  const [monthDay, setMonthDay] = useState<number | undefined>(initialEvent?.recurrence?.monthDay);

  // Get upcoming events
  const upcomingEvents = events
    .filter(event => event.start > new Date())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const event: Omit<Event, 'id'> = {
      title,
      description,
      start,
      end,
      allDay,
      location,
      colorId: 0, // Default color
      recurrence: recurrenceType !== 'none' ? {
        type: recurrenceType,
        interval,
        endDate,
        daysOfWeek: recurrenceType === 'weekly' ? selectedDays : undefined,
        monthDay: recurrenceType === 'monthly' ? monthDay : undefined,
      } : undefined,
    };

    onSubmit(event);
  };

  const handleDayToggle = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  return (
    <div className="flex gap-8 max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="flex-1 space-y-5 bg-[#FAF6E3] p-6 rounded-2xl shadow-sm">
        <div>
          <label className="block text-sm font-medium text-[#2A3663] mb-1">What's the event?</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label="Event title"
            placeholder="Give your event a name"
            className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663] placeholder-[#2F3645]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A3663] mb-1">Tell me more about it</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Event description"
            placeholder="Add some details about your event"
            className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors min-h-[100px] bg-[#FAF6E3] text-[#2A3663] placeholder-[#2F3645]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#2A3663] mb-1">When does it start?</label>
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={allDay ? start.toISOString().split('T')[0] : start.toISOString().slice(0, 16)}
              onChange={(e) => setStart(new Date(e.target.value))}
              required
              aria-label="Event start date and time"
              className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2A3663] mb-1">When does it end?</label>
            <input
              type={allDay ? 'date' : 'datetime-local'}
              value={allDay ? end.toISOString().split('T')[0] : end.toISOString().slice(0, 16)}
              onChange={(e) => setEnd(new Date(e.target.value))}
              required
              aria-label="Event end date and time"
              className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663]"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            aria-label="All day event"
            className="h-4 w-4 rounded-full border-[#2F3645] text-[#D8DBBD] focus:ring-[#D8DBBD]"
          />
          <label className="ml-2 text-sm text-[#2A3663]">This is an all-day event</label>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A3663] mb-1">Where's it happening?</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Event location"
            placeholder="Add a location or meeting link"
            className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663] placeholder-[#2F3645]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#2A3663] mb-1">Does this event repeat?</label>
          <select
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value as RecurrenceType)}
            aria-label="Event recurrence type"
            className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663]"
          >
            <option value="none">No, it's a one-time event</option>
            <option value="daily">Yes, every day</option>
            <option value="weekly">Yes, every week</option>
            <option value="monthly">Yes, every month</option>
            <option value="custom">Yes, with a custom schedule</option>
          </select>
        </div>

        {recurrenceType !== 'none' && (
          <div className="space-y-4 bg-[#D8DBBD]/20 p-4 rounded-2xl">
            <div>
              <label className="block text-sm font-medium text-[#2A3663] mb-1">How often?</label>
              <input
                type="number"
                min="1"
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
                aria-label="Recurrence interval"
                className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663]"
              />
            </div>

            {recurrenceType === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-[#2A3663] mb-2">Which days?</label>
                <div className="flex flex-wrap gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(index)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        selectedDays.includes(index)
                          ? 'bg-[#2F3645] text-white hover:bg-[#D8DBBD]'
                          : 'bg-[#FAF6E3] text-[#2A3663] hover:bg-[#D8DBBD]/20 border border-[#2F3645]'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recurrenceType === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-[#2A3663] mb-1">Which day of the month?</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={monthDay || ''}
                  onChange={(e) => setMonthDay(parseInt(e.target.value))}
                  aria-label="Day of month for monthly recurrence"
                  className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#2A3663] mb-1">When should it stop repeating?</label>
              <input
                type="date"
                value={endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : undefined)}
                aria-label="Recurrence end date"
                className="w-full px-4 py-2 rounded-2xl border border-[#2F3645] focus:border-[#D8DBBD] focus:ring-2 focus:ring-[#D8DBBD]/20 transition-colors bg-[#FAF6E3] text-[#2A3663]"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-[#2A3663] bg-[#FAF6E3] border border-[#2F3645] rounded-full hover:bg-[#D8DBBD]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D8DBBD] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#2F3645] rounded-full hover:bg-[#D8DBBD] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D8DBBD] transition-colors"
          >
            {initialEvent ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>

      <div className="w-80 bg-[#FAF6E3] rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-medium text-[#2A3663] mb-4">What's Coming Up</h3>
        {upcomingEvents.length > 0 ? (
          <div className="space-y-4">
            {upcomingEvents.map(event => (
              <div key={event.id} className="border-b border-[#2F3645]/20 pb-4 last:border-0">
                <h4 className="font-medium text-[#2A3663]">{event.title}</h4>
                <p className="text-sm text-[#2F3645] mt-1">
                  {format(event.start, 'MMM d, yyyy h:mm a')}
                </p>
                {event.location && (
                  <p className="text-sm text-[#2F3645] mt-1 flex items-center gap-1">
                    <span className="text-[#2F3645]">📍</span> {event.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#2F3645] text-sm">No upcoming events scheduled</p>
        )}
      </div>
    </div>
  );
}; 