'use client';

import React, { useState, useMemo } from 'react';
import { useCalendarEvents } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  AlertCircle,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface CalendarEvent {
  id: number;
  title: string;
  date: string; // ISO date string
  start_time?: string;
  end_time?: string;
  event_type: 'meeting' | 'consultation' | 'deadline' | 'reminder';
  attendees_count?: number;
}

type EventType = CalendarEvent['event_type'];

// ─── Constants ──────────────────────────────────────────────────────────────

const EVENT_TYPE_CONFIG: Record<
  EventType,
  { label: string; dot: string; chip: string; chipText: string }
> = {
  meeting: {
    label: 'Meeting',
    dot: 'bg-blue-400',
    chip: 'bg-blue-500/10 border-blue-500/20',
    chipText: 'text-blue-400',
  },
  consultation: {
    label: 'Consultation',
    dot: 'bg-[#D4A843]',
    chip: 'bg-[#D4A843]/10 border-[#D4A843]/20',
    chipText: 'text-[#D4A843]',
  },
  deadline: {
    label: 'Deadline',
    dot: 'bg-red-400',
    chip: 'bg-red-500/10 border-red-500/20',
    chipText: 'text-red-400',
  },
  reminder: {
    label: 'Reminder',
    dot: 'bg-neutral-400',
    chip: 'bg-neutral-500/10 border-neutral-500/20',
    chipText: 'text-neutral-400',
  },
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(isoStr?: string): string {
  if (!isoStr) return '';
  return new Date(`1970-01-01T${isoStr}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ─── Calendar Grid Helpers ──────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const eventListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
};

const eventItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function CalendarContent() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Fetch events for the current month range
  const monthStart = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const monthEnd = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  const {
    data: events,
    isLoading,
    isError,
    total,
  } = useCalendarEvents({ dateFrom: monthStart, dateTo: monthEnd, limit: 50 });

  const resolvedEvents = useMemo(() => (events ?? []) as CalendarEvent[], [events]);
  const resolvedTotal = total ?? 0;

  // Build a map of day → events for dot rendering
  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    resolvedEvents.forEach((event) => {
      const d = new Date(event.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(event);
    });
    return map;
  }, [resolvedEvents]);

  // Sort events chronologically for the list view
  const sortedEvents = useMemo(() => {
    return [...resolvedEvents].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [resolvedEvents]);

  // Calendar grid generation
  const startingDay = getFirstDayOfMonth(currentYear, currentMonth);
  const totalCells = startingDay + daysInMonth;
  const rows = Math.ceil(totalCells / 7);
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < startingDay; i++) {
    calendarDays.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }
  while (calendarDays.length < rows * 7) {
    calendarDays.push(null);
  }

  const goPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="p-8 md:p-10 lg:p-12 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-4">
          <CalendarIcon size={13} />
          <span>Calendar</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-1">
              Calendar
            </h1>
            <p className="text-[13px] text-neutral-500 font-light">
              {resolvedTotal} events this month
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4A843] text-[#0A0A0A] text-sm font-light tracking-wide rounded-lg hover:bg-[#D4A843]/90 hover:shadow-[0_0_20px_rgba(212,168,67,0.15)] transition-all duration-300">
            <Plus size={15} />
            New Event
          </button>
        </div>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#141414] border border-[#1F1F1F] rounded-xl overflow-hidden mb-8"
      >
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F1F1F]">
          <button
            onClick={goPrevMonth}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-serif font-light text-white">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={goNextMonth}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[#1F1F1F]">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-neutral-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const isEmpty = day === null;
            const dateKey = isEmpty
              ? ''
              : `${currentYear}-${currentMonth}-${day}`;
            const dayEvents = eventsByDay[dateKey] ?? [];
            const isToday = !isEmpty && isSameDay(
              new Date(currentYear, currentMonth, day),
              today,
            );

            return (
              <div
                key={idx}
                className={`min-h-[72px] p-2 border-b border-r border-[#1F1F1F]/50 transition-colors duration-200 ${
                  isEmpty
                    ? 'bg-[#0A0A0A]/30'
                    : 'hover:bg-white/[0.02]'
                } ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}`}
              >
                {!isEmpty && (
                  <>
                    <div className="flex items-center justify-center mb-1">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-light transition-all duration-200 ${
                          isToday
                            ? 'bg-[#D4A843] text-[#0A0A0A] ring-2 ring-[#D4A843]/40'
                            : 'text-neutral-400'
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-0.5">
                      {dayEvents.slice(0, 3).map((evt, i) => {
                        const cfg = EVENT_TYPE_CONFIG[evt.event_type] ?? EVENT_TYPE_CONFIG.reminder;
                        return (
                          <span
                            key={i}
                            title={evt.title}
                            className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                          />
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <span className="text-[9px] text-neutral-600 font-light leading-none">
                          +{dayEvents.length - 3}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Events List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <h3 className="text-sm font-serif font-light text-white mb-4">
          Upcoming Events
        </h3>

        <div className="bg-[#141414] border border-[#1F1F1F] rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <div className="animate-pulse space-y-4 w-full max-w-md">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-[#1F1F1F]/60 rounded-lg"
                  />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="p-12 text-center">
              <AlertCircle
                size={32}
                className="text-red-400/60 mx-auto mb-3"
              />
              <p className="text-red-400 text-sm font-light">
                Failed to load events.
              </p>
              <p className="text-neutral-600 text-xs mt-1 font-light">
                Please check your connection and try again.
              </p>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon
                size={32}
                className="text-neutral-700 mx-auto mb-3"
              />
              <p className="text-neutral-500 text-sm font-light">
                No events scheduled this month.
              </p>
              <p className="text-neutral-600 text-xs mt-1 font-light">
                Click &quot;New Event&quot; to schedule your first event.
              </p>
            </div>
          ) : (
            <motion.div
              variants={eventListVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-[#1F1F1F]/50"
            >
              {sortedEvents.map((event) => {
                const cfg =
                  EVENT_TYPE_CONFIG[event.event_type] ??
                  EVENT_TYPE_CONFIG.reminder;
                const timeDisplay =
                  event.start_time && event.end_time
                    ? `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`
                    : event.start_time
                      ? formatTime(event.start_time)
                      : '';

                return (
                  <motion.div
                    key={event.id}
                    variants={eventItemVariants}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  >
                    {/* Date block */}
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-[#1A1A1A] border border-[#1F1F1F] flex flex-col items-center justify-center">
                      <span className="text-xs font-medium text-neutral-400">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-neutral-600">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-light group-hover:text-[#D4A843] transition-colors duration-200 truncate">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {timeDisplay && (
                          <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-light">
                            <Clock size={10} className="text-neutral-600" />
                            {timeDisplay}
                          </span>
                        )}
                        {event.attendees_count !== undefined && event.attendees_count > 0 && (
                          <span className="flex items-center gap-1 text-[11px] text-neutral-500 font-light">
                            <Users size={10} className="text-neutral-600" />
                            {event.attendees_count}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${cfg.chip} ${cfg.chipText}`}
                    >
                      {cfg.label}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
