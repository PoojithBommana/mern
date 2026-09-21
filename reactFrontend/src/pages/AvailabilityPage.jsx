import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllAvailability, saveAvailability } from '../apis/availabilityApi';
import Button from '../components/Button';
import { Banner, SvgIcon } from '../components/ui';
import { AvailabilityIllustration } from '../components/illustrations';

const days = [
  { id: 0, name: 'Sunday', icon: 'sun' },
  { id: 1, name: 'Monday', icon: 'calendar' },
  { id: 2, name: 'Tuesday', icon: 'calendar' },
  { id: 3, name: 'Wednesday', icon: 'calendar' },
  { id: 4, name: 'Thursday', icon: 'calendar' },
  { id: 5, name: 'Friday', icon: 'calendar' },
  { id: 6, name: 'Saturday', icon: 'sun' },
];

const asList = (value) => (Array.isArray(value) ? value : value?.availability || []);

const AvailabilityPage = () => {
  const location = useLocation();
  const fromService = location.state?.fromService;
  const [selectedDay, setSelectedDay] = useState(1);
  const [availability, setAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const data = asList(await getAllAvailability());
      const map = {};
      data.forEach((item) => {
        map[item.dayOfWeek] = item.slots || [];
      });
      setAvailability(map);
    } catch (err) {
      setError(err.message || 'Could not load availability');
    } finally {
      setLoading(false);
    }
  };

  const currentSlots = availability[selectedDay] || [];

  const addTimeSlot = () => {
    setAvailability({
      ...availability,
      [selectedDay]: [...currentSlots, { startTime: '09:00', endTime: '17:00' }],
    });
  };

  const removeTimeSlot = (index) => {
    setAvailability({
      ...availability,
      [selectedDay]: currentSlots.filter((_, i) => i !== index),
    });
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...currentSlots];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability({ ...availability, [selectedDay]: updated });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await saveAvailability({ dayOfWeek: selectedDay, slots: currentSlots });
      setMessage(`${days[selectedDay].name} hours saved.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="bm-kicker">Availability</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 md:text-[44px]">
            <span className="text-slate-900">Set</span> the hours
            <br />
            customers can
            <br />
            <span className="italic text-amber-500">choose.</span>
          </h1>
          <p className="mt-3 max-w-xl text-slate-500">
            Keep it simple: select a weekday, add one or more time windows, then save.
          </p>
        </div>
        <AvailabilityIllustration />
      </div>

      {fromService && (
        <Banner type="info">
          {fromService} is created. Add the weekdays and time windows customers can book, then save.
        </Banner>
      )}
      {error && <Banner>{error}</Banner>}
      {message && <Banner type="success">{message}</Banner>}

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="grid grid-cols-2 gap-3">
          {days.map((day) => {
            const active = selectedDay === day.id;
            const saved = (availability[day.id] || []).length;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? 'border-violet-200 bg-violet-50 text-violet-800 shadow-sm'
                    : 'border-slate-100 bg-white text-slate-700 hover:border-violet-100'
                }`}
              >
                <span className="flex items-center gap-3 font-semibold">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? 'bg-violet-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    <SvgIcon name={day.icon} className="h-4 w-4" />
                  </span>
                  {day.name}
                </span>
                {active && <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                {!active && saved > 0 && <span className="text-xs font-bold text-violet-400">{saved}</span>}
              </button>
            );
          })}
        </div>

        <div className="bm-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{days[selectedDay].name}</h2>
              <p className="text-sm text-slate-400">
                {currentSlots.length} saved time window{currentSlots.length === 1 ? '' : 's'}
              </p>
            </div>
            <Button onClick={addTimeSlot}>
              <SvgIcon name="plus" className="h-4 w-4" />
              Add window
            </Button>
          </div>

          <div className="space-y-4">
            {currentSlots.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-400">
                No windows yet. Add one to make this day bookable.
              </div>
            )}
            {currentSlots.map((slot, index) => (
              <div key={index} className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-600">Start</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
                      <SvgIcon name="clock" className="h-4 w-4" />
                    </span>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      className="bm-input"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold text-slate-600">End</span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center text-slate-400">
                      <SvgIcon name="clock" className="h-4 w-4" />
                    </span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      className="bm-input"
                    />
                  </div>
                </label>
                <button
                  onClick={() => removeTimeSlot(index)}
                  className="mb-1 flex items-center gap-1 pb-2 text-sm font-semibold text-rose-500"
                >
                  <SvgIcon name="trash" className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addTimeSlot}
            className="mt-5 w-full rounded-2xl border-2 border-dashed border-slate-200 py-3 text-sm font-semibold text-slate-400 hover:border-violet-300 hover:text-violet-600"
          >
            + Add another time window
          </button>

          <Button onClick={handleSave} fullWidth size="lg" loading={saving} className="mt-5">
            <SvgIcon name="save" className="h-4 w-4" />
            Save availability
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
