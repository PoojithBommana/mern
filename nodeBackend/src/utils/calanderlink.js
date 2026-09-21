const toGoogleDatetime = (date, time) => {
  const compactDate = String(date || '').replace(/-/g, '');
  const compactTime = `${String(time || '00:00').replace(/:/g, '')}00`.slice(0, 6);
  return `${compactDate}T${compactTime}`;
};

export const buildCustomCalendarLink = ({ business, service, booking } = {}) => {
  const businessName = business?.businessName || business?.name || 'BookMe';
  const serviceName = service?.name || 'Appointment';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${serviceName} with ${businessName}`,
    dates: `${toGoogleDatetime(booking?.date, booking?.startTime)}/${toGoogleDatetime(booking?.date, booking?.endTime)}`,
    details: booking?.notes || `Booked ${serviceName} with ${businessName}`,
  });

  if (booking?.customerEmail) {
    params.set('add', booking.customerEmail);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export const buildCustomerCalendarUrl = buildCustomCalendarLink;
