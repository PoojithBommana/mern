import { google } from 'googleapis';
import { buildCustomCalendarLink } from '../utils/calanderlink.js';

const getOAuthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

export const getoAuthClient = getOAuthClient;

export const getGoogleAuthUrl = (userId) => {
  const oAuthClient = getOAuthClient();
  return oAuthClient.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: JSON.stringify({ userId }),
  });
};

export const getGoogleAccessToken = async (code) => {
  const oAuthClient = getOAuthClient();
  const { tokens } = await oAuthClient.getToken(code);
  return tokens;
};

export const createBookingCalendarEvent = async ({ business, service, booking }) => {
  const customerCalendarUrl = buildCustomCalendarLink({ business, service, booking });

  if (!business?.googleCalendarConnected || !business?.googleRefreshToken) {
    return { customerCalendarUrl };
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: business.googleRefreshToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const summary = `${service.name} - ${booking.customerName}`;
  const description = [
    `Customer: ${booking.customerName}`,
    `Email: ${booking.customerEmail}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const { data } = await calendar.events.insert({
    calendarId: business.googleCalendarId || 'primary',
    requestBody: {
      summary,
      description,
      start: {
        dateTime: `${booking.date}T${booking.startTime}:00`,
        timeZone: business.timezone || 'Asia/Kolkata',
      },
      end: {
        dateTime: `${booking.date}T${booking.endTime}:00`,
        timeZone: business.timezone || 'Asia/Kolkata',
      },
      attendees: [{ email: booking.customerEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    },
    sendUpdates: 'all',
  });

  return {
    googleEventId: data.id,
    customerCalendarUrl,
  };
};

export const updateBookingCalendarEvent = async ({ business, service, booking }) => {
  const customerCalendarUrl = buildCustomCalendarLink({ business, service, booking });

  if (!business?.googleCalendarConnected || !business?.googleRefreshToken) {
    return { customerCalendarUrl };
  }

  if (!booking.googleEventId) {
    return createBookingCalendarEvent({ business, service, booking });
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: business.googleRefreshToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const summary = `${service.name} - ${booking.customerName}`;
  const description = [
    `Customer: ${booking.customerName}`,
    `Email: ${booking.customerEmail}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const { data } = await calendar.events.update({
    calendarId: business.googleCalendarId || 'primary',
    eventId: booking.googleEventId,
    requestBody: {
      summary,
      description,
      start: {
        dateTime: `${booking.date}T${booking.startTime}:00`,
        timeZone: business.timezone || 'Asia/Kolkata',
      },
      end: {
        dateTime: `${booking.date}T${booking.endTime}:00`,
        timeZone: business.timezone || 'Asia/Kolkata',
      },
      attendees: [{ email: booking.customerEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    },
    sendUpdates: 'all',
  });

  return {
    googleEventId: data.id,
    customerCalendarUrl,
  };
};

export const cancelBookingCalendarEvent = async ({ business, booking }) => {
  if (!business?.googleCalendarConnected || !business?.googleRefreshToken || !booking?.googleEventId) {
    return false;
  }

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: business.googleRefreshToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  await calendar.events.patch({
    calendarId: business.googleCalendarId || 'primary',
    eventId: booking.googleEventId,
    requestBody: { status: 'cancelled' },
    sendUpdates: 'all',
  });

  return true;
};
