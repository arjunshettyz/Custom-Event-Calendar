import { openDB } from 'idb';
import { Event } from '../types/calendar';

const DB_NAME = 'calendar-db';
const STORE_NAME = 'events';
const VERSION = 1;

export async function initDB() {
  const db = await openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('start', 'start');
        store.createIndex('end', 'end');
      }
    },
  });
  return db;
}

export async function getAllEvents(): Promise<Event[]> {
  const db = await initDB();
  const events = await db.getAll(STORE_NAME);
  return events.map(event => ({
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
    recurrence: event.recurrence ? {
      ...event.recurrence,
      endDate: event.recurrence.endDate ? new Date(event.recurrence.endDate) : undefined,
    } : undefined,
  }));
}

export async function saveEvent(event: Event): Promise<void> {
  const db = await initDB();
  await db.put(STORE_NAME, {
    ...event,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    recurrence: event.recurrence ? {
      ...event.recurrence,
      endDate: event.recurrence.endDate?.toISOString(),
    } : undefined,
  });
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}