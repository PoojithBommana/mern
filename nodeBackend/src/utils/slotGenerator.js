import availabilityModel from '../models/availability.js';
import bookingModel from '../models/booking.js';
import { checkOverlap } from './overlap.js';
import { timetominutes, minutestotime, getDayOfWeek, getDayName, DAY_NAMES } from './time.js';

const isPastSlot = (date, startTime) => {
  const [year, month, day] = String(date).slice(0, 10).split('-').map(Number);
  const [hours, minutes] = String(startTime).split(':').map(Number);
  const slotAt = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return slotAt.getTime() <= Date.now();
};

export const generateSlots = async (userId, service, date) => {
  const duration = Number(service?.duration) || 0;
  const dayOfWeek = getDayOfWeek(date);

  if (!userId || Number.isNaN(dayOfWeek) || duration <= 0) {
    return { slots: [], dayOfWeek, dayName: getDayName(dayOfWeek), availableDays: [] };
  }

  const [availability, week, bookings] = await Promise.all([
    availabilityModel.findOne({
      userId,
      $or: [{ dayOfWeek }, { dayofweek: dayOfWeek }],
    }),
    availabilityModel.find({ userId }).select('dayOfWeek dayofweek slots'),
    bookingModel.find({
      userId,
      date,
      status: { $in: ['confirmed', 'pending', 'pending_payment'] },
    }),
  ]);

  const availableDays = week
    .filter((item) => (item.slots || []).length > 0)
    .map((item) => {
      const index = item.dayOfWeek ?? item.dayofweek;
      return { dayOfWeek: index, name: DAY_NAMES[index] };
    })
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  const windows = availability?.slots || [];
  const slots = [];

  for (const window of windows) {
    let cursor = timetominutes(window.startTime);
    const windowEnd = timetominutes(window.endTime);
    if (Number.isNaN(cursor) || Number.isNaN(windowEnd) || cursor >= windowEnd) continue;

    while (cursor + duration <= windowEnd) {
      const startTime = minutestotime(cursor);
      const endTime = minutestotime(cursor + duration);
      const taken = bookings.some((booking) =>
        checkOverlap(startTime, endTime, booking.startTime, booking.endTime)
      );

      if (!taken && !isPastSlot(date, startTime)) {
        slots.push({ startTime, endTime });
      }

      cursor += duration;
    }
  }

  return {
    slots,
    dayOfWeek,
    dayName: getDayName(dayOfWeek),
    availableDays,
  };
};
