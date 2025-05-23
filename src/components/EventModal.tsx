import React, { useEffect, useState } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { format, addDays, addWeeks, addMonths, isSameDay } from 'date-fns';
import { X, Calendar, Clock, MapPin, Tag, Repeat } from 'lucide-react';
import { Event, EVENT_COLORS } from '../types/calendar';

const EventModal: React.FC = () => {
  const {
    selectedEvent,
    setSelectedEvent,
    isModalOpen,
    setIsModalOpen,
    isCreatingEvent,
    selectedTimeSlot,
    addEvent,
    updateEvent,
    deleteEvent
  } = useCalendar();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [color, setColor] = useState('#2F3645');
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [recurrence, setRecurrence] = useState<{
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  } | null>(null);

  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title);
      setDescription(selectedEvent.description || '');
      setLocation(selectedEvent.location || '');
      setStartDate(format(selectedEvent.start, 'yyyy-MM-dd'));
      setStartTime(format(selectedEvent.start, 'HH:mm'));
      setEndDate(format(selectedEvent.end, 'yyyy-MM-dd'));
      setEndTime(format(selectedEvent.end, 'HH:mm'));
      setAllDay(selectedEvent.allDay || false);
      setColor(selectedEvent.color || '#2F3645');
      setRecurrence(selectedEvent.recurrence || null);
      setShowRecurrence(!!selectedEvent.recurrence);
    } else if (selectedTimeSlot) {
      setStartDate(format(selectedTimeSlot.start, 'yyyy-MM-dd'));
      setStartTime(format(selectedTimeSlot.start, 'HH:mm'));
      setEndDate(format(selectedTimeSlot.end, 'yyyy-MM-dd'));
      setEndTime(format(selectedTimeSlot.end, 'HH:mm'));
      setAllDay(false);
      setColor('#2F3645');
      setRecurrence(null);
      setShowRecurrence(false);
    }
  }, [selectedEvent, selectedTimeSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create date objects from the form values
      const start = new Date(`${startDate}T${startTime}`);
      const end = new Date(`${endDate}T${endTime}`);

      // Basic validation
      if (!title.trim()) {
        console.error('Title is required');
        return;
      }

      if (end < start) {
        console.error('End time must be after start time');
        return;
      }

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        start,
        end,
        allDay,
        color,
        recurrence: showRecurrence ? {
          frequency: recurrence?.frequency || 'daily',
          interval: recurrence?.interval || 1,
          endDate: recurrence?.endDate,
          daysOfWeek: recurrence?.daysOfWeek
        } : undefined
      };

      if (selectedEvent) {
        // Update existing event
        updateEvent(selectedEvent.id, {
          ...eventData,
          id: selectedEvent.id
        });
      } else {
        // Create new event
        addEvent(eventData);
      }

      // Reset form and close modal
      handleClose();
    } catch (error) {
      console.error('Error handling event submission:', error);
    }
  };

  const handleDelete = () => {
    if (selectedEvent) {
      deleteEvent(selectedEvent.id);
    }
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setLocation('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setAllDay(false);
    setColor('#2F3645');
    setRecurrence(null);
    setShowRecurrence(false);
  };

  const handleColorSelect = (colorValue: string) => {
    setColor(colorValue);
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#FAF6E3] rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#2F3645]/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#2F3645]/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#2A3663]">
            {isCreatingEvent ? 'Create Event' : 'Edit Event'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[#2F3645] hover:text-[#1F2430] p-1 rounded-full hover:bg-[#2F3645]/10"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-[#2F3645] mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                required
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-[#2F3645] mb-1">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-[#2F3645]/50" />
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                  required
                  aria-label="Start date"
                />
              </div>
            </div>
            {!allDay && (
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-[#2F3645] mb-1">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-[#2F3645]/50" />
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                    required
                    aria-label="Start time"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-[#2F3645] mb-1">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-[#2F3645]/50" />
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                  required
                  aria-label="End date"
                />
              </div>
            </div>
            {!allDay && (
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-[#2F3645] mb-1">
                  End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-5 w-5 text-[#2F3645]/50" />
                  <input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                    required
                    aria-label="End time"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="allDay"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="rounded border-[#2F3645]/20 text-[#2F3645] focus:ring-[#2F3645]"
            />
            <label htmlFor="allDay" className="text-sm font-medium text-[#2F3645]">
              All Day
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#2F3645] mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-[#2F3645]/50" />
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                  placeholder="Add location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2F3645] mb-1 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {EVENT_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    onClick={() => handleColorSelect(colorOption.value)}
                    className={`w-full h-8 rounded-md border-2 transition-all ${
                      color === colorOption.value
                        ? 'border-[#2F3645] scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: colorOption.value }}
                    title={colorOption.name}
                    aria-label={`Select ${colorOption.name} color`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#2F3645] mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
              rows={2}
              placeholder="Add description"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurrence"
                checked={showRecurrence}
                onChange={(e) => setShowRecurrence(e.target.checked)}
                className="rounded border-[#2F3645]/20 text-[#2F3645] focus:ring-[#2F3645]"
              />
              <label htmlFor="recurrence" className="text-sm font-medium text-[#2F3645] flex items-center">
                <Repeat className="h-4 w-4 mr-2" />
                Repeat Event
              </label>
            </div>

            {showRecurrence && (
              <div className="grid grid-cols-2 gap-4 p-4 border border-[#2F3645]/20 rounded-md bg-[#F2EFE7]">
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-[#2F3645] mb-1">
                    Repeat
                  </label>
                  <select
                    id="frequency"
                    value={recurrence?.frequency || 'daily'}
                    onChange={(e) => setRecurrence(prev => ({ ...prev, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' }))}
                    className="w-full px-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                    aria-label="Repeat frequency"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="interval" className="block text-sm font-medium text-[#2F3645] mb-1">
                    Repeat every
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      id="interval"
                      min="1"
                      value={recurrence?.interval || 1}
                      onChange={(e) => setRecurrence(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                      className="w-20 px-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                      aria-label="Repeat interval"
                    />
                    <span className="text-sm text-[#2F3645]">
                      {recurrence?.frequency === 'daily' ? 'day(s)' : 
                       recurrence?.frequency === 'weekly' ? 'week(s)' : 'month(s)'}
                    </span>
                  </div>
                </div>

                {recurrence?.frequency === 'weekly' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-[#2F3645] mb-1">
                      Repeat on
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = recurrence?.daysOfWeek || [];
                            const newDays = days.includes(index)
                              ? days.filter(d => d !== index)
                              : [...days, index];
                            setRecurrence(prev => ({ ...prev, daysOfWeek: newDays }));
                          }}
                          className={`px-3 py-1 rounded-md text-sm ${
                            recurrence?.daysOfWeek?.includes(index)
                              ? 'bg-[#2F3645] text-white'
                              : 'bg-white text-[#2F3645] hover:bg-[#2F3645]/10'
                          }`}
                          aria-label={`Select ${day}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-[#2F3645] mb-1">
                    End Date (Optional)
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-[#2F3645]/50" />
                    <input
                      type="date"
                      id="recurrenceEndDate"
                      value={recurrence?.endDate ? format(recurrence.endDate, 'yyyy-MM-dd') : ''}
                      onChange={(e) => setRecurrence(prev => ({ ...prev, endDate: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full pl-10 pr-3 py-2 border border-[#2F3645]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2F3645] bg-[#F2EFE7]"
                      aria-label="Recurrence end date"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Delete event"
              >
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-[#2F3645] hover:bg-[#2F3645]/10 rounded-md transition-colors"
              aria-label="Cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2F3645] text-white rounded-md hover:bg-[#1F2430] transition-colors"
              aria-label={isCreatingEvent ? 'Create event' : 'Save changes'}
            >
              {isCreatingEvent ? 'Create' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;