'use client';

import React, { useState } from 'react';
import { Clock, Plus, X } from 'lucide-react';

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DaySchedule {
  enabled: boolean;
  slots: TimeSlot[];
}

export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

interface OperatingHoursInputProps {
  value?: WeeklySchedule;
  onChange: (schedule: WeeklySchedule) => void;
}

const DEFAULT_SLOT: TimeSlot = { open: '09:00', close: '17:00' };

const DEFAULT_SCHEDULE: WeeklySchedule = {
  monday: { enabled: true, slots: [DEFAULT_SLOT] },
  tuesday: { enabled: true, slots: [DEFAULT_SLOT] },
  wednesday: { enabled: true, slots: [DEFAULT_SLOT] },
  thursday: { enabled: true, slots: [DEFAULT_SLOT] },
  friday: { enabled: true, slots: [DEFAULT_SLOT] },
  saturday: { enabled: false, slots: [] },
  sunday: { enabled: false, slots: [] },
};

export function OperatingHoursInput({ value, onChange }: OperatingHoursInputProps) {
  const schedule = value || DEFAULT_SCHEDULE;

  const updateDay = (day: keyof WeeklySchedule, updates: Partial<DaySchedule>) => {
    onChange({
      ...schedule,
      [day]: {
        ...schedule[day],
        ...updates,
      },
    });
  };

  const toggleDay = (day: keyof WeeklySchedule) => {
    const daySchedule = schedule[day];
    updateDay(day, {
      enabled: !daySchedule.enabled,
      slots: !daySchedule.enabled && daySchedule.slots.length === 0 ? [DEFAULT_SLOT] : daySchedule.slots,
    });
  };

  const addSlot = (day: keyof WeeklySchedule) => {
    const daySchedule = schedule[day];
    updateDay(day, {
      slots: [...daySchedule.slots, DEFAULT_SLOT],
    });
  };

  const removeSlot = (day: keyof WeeklySchedule, index: number) => {
    const daySchedule = schedule[day];
    updateDay(day, {
      slots: daySchedule.slots.filter((_, i) => i !== index),
    });
  };

  const updateSlot = (day: keyof WeeklySchedule, index: number, field: 'open' | 'close', value: string) => {
    const daySchedule = schedule[day];
    const newSlots = [...daySchedule.slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    updateDay(day, { slots: newSlots });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-[var(--sage)]" />
        <h3 className="text-sm font-semibold text-[var(--ink)]">Operating Hours</h3>
      </div>

      <div className="space-y-3">
        {DAYS.map(({ key, label }) => {
          const daySchedule = schedule[key];
          return (
            <div key={key} className="border border-[var(--mist)] rounded-xl p-4 bg-[var(--paper)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${key}`}
                    checked={daySchedule.enabled}
                    onChange={() => toggleDay(key)}
                    className="w-4 h-4 text-[var(--sage)] border-[var(--mist)] rounded focus:ring-2 focus:ring-[var(--sage)]"
                  />
                  <label
                    htmlFor={`day-${key}`}
                    className={`font-medium text-sm cursor-pointer ${
                      daySchedule.enabled ? 'text-[var(--ink)]' : 'text-[var(--muted)]'
                    }`}
                  >
                    {label}
                  </label>
                </div>

                {daySchedule.enabled && (
                  <button
                    type="button"
                    onClick={() => addSlot(key)}
                    className="flex items-center gap-1 text-xs text-[var(--sage)] hover:text-[var(--clay)] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                )}
              </div>

              {daySchedule.enabled && (
                <div className="space-y-2 ml-7">
                  {daySchedule.slots.length === 0 ? (
                    <p className="text-xs text-[var(--muted)] italic">No time slots added</p>
                  ) : (
                    daySchedule.slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={slot.open}
                            onChange={(e) => updateSlot(key, index, 'open', e.target.value)}
                            className="px-3 py-2 border border-[var(--mist)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--sage)] focus:border-[var(--sage)]"
                          />
                          <span className="text-[var(--muted)] text-sm">to</span>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={(e) => updateSlot(key, index, 'close', e.target.value)}
                            className="px-3 py-2 border border-[var(--mist)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--sage)] focus:border-[var(--sage)]"
                          />
                        </div>
                        {daySchedule.slots.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSlot(key, index)}
                            className="p-2 text-[var(--clay)] hover:bg-[var(--clay)]/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {!daySchedule.enabled && (
                <p className="text-xs text-[var(--muted)] ml-7 italic">Closed</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-[var(--sage)]/5 border border-[var(--sage)]/20 rounded-lg">
        <p className="text-xs text-[var(--muted)]">
          💡 <strong>Tip:</strong> You can add multiple time slots per day for breaks (e.g., 9AM-12PM, 2PM-5PM)
        </p>
      </div>
    </div>
  );
}

// Helper function to convert WeeklySchedule to string format
export function scheduleToString(schedule: WeeklySchedule): string {
  const days: string[] = [];
  
  DAYS.forEach(({ key, label }) => {
    const daySchedule = schedule[key];
    if (daySchedule.enabled && daySchedule.slots.length > 0) {
      const slots = daySchedule.slots
        .map(slot => `${slot.open}-${slot.close}`)
        .join(', ');
      days.push(`${label}: ${slots}`);
    } else if (daySchedule.enabled) {
      days.push(`${label}: Closed`);
    }
  });
  
  return days.join(' | ');
}

// Helper function to parse string format to WeeklySchedule
export function stringToSchedule(str: string): WeeklySchedule {
  if (!str) return DEFAULT_SCHEDULE;
  
  const schedule = { ...DEFAULT_SCHEDULE };
  
  try {
    const dayParts = str.split('|').map(s => s.trim());
    
    dayParts.forEach(part => {
      const [dayStr, timesStr] = part.split(':').map(s => s.trim());
      const dayKey = dayStr.toLowerCase() as keyof WeeklySchedule;
      
      if (DAYS.find(d => d.key === dayKey)) {
        if (timesStr && timesStr !== 'Closed') {
          const slots = timesStr.split(',').map(timeRange => {
            const [open, close] = timeRange.trim().split('-');
            return { open: open.trim(), close: close.trim() };
          });
          schedule[dayKey] = { enabled: true, slots };
        } else {
          schedule[dayKey] = { enabled: false, slots: [] };
        }
      }
    });
  } catch (error) {
    console.error('Failed to parse schedule string:', error);
    return DEFAULT_SCHEDULE;
  }
  
  return schedule;
}
