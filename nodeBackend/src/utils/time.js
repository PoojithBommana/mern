export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const timetominutes = (time) => {
  if (!time && time !== 0) return NaN;
  const [hours, minutes] = String(time).split(':').map(Number);
  return hours * 60 + (minutes || 0);
};

export const minutestotime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
};

export const isTimeValid = (startTime, endTime) => {
  return timetominutes(startTime) < timetominutes(endTime);
};

/** Weekday for a YYYY-MM-DD calendar date, independent of server timezone. 0 = Sunday. */
export const getDayOfWeek = (date) => {
  const [year, month, day] = String(date).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return NaN;
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0)).getUTCDay();
};

export const getDayName = (dateOrIndex) => {
  const index = typeof dateOrIndex === 'number' ? dateOrIndex : getDayOfWeek(dateOrIndex);
  return DAY_NAMES[index] || '';
};
