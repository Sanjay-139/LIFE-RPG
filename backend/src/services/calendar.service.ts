import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { rpgStore, getUserLocalDate } from '../database/rpgStore.js';

export interface CalendarStatus {
  connected: boolean;
  status: 'NOT_CONNECTED' | 'CONNECTED' | 'REAUTHORIZATION_REQUIRED';
  accountEmail?: string;
  lastSync?: string;
  authUrl?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
  color?: string;
}

// User contextual calendar event cache for offline/dev fallback (user-isolated)
const userCalendarEvents: Record<string, CalendarEvent[]> = {};

export class CalendarService {
  async getStatus(userId: string): Promise<CalendarStatus> {
    const conn = await rpgStore.getCalendarConnection(userId);
    if (!conn) {
      return {
        connected: false,
        status: 'NOT_CONNECTED'
      };
    }
    return {
      connected: conn.connected,
      status: conn.status,
      accountEmail: conn.accountEmail,
      lastSync: conn.lastSync
    };
  }

  /**
   * Generates Google OAuth 2.0 authorization URL or performs direct connection in dev mode.
   * Requests ONLY read-only calendar scope: https://www.googleapis.com/auth/calendar.events.readonly
   */
  async connect(userId: string, email?: string): Promise<CalendarStatus> {
    // If Google OAuth credentials are configured on the server, initiate real OAuth 2.0 flow
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
      const state = jwt.sign(
        { userId, purpose: 'calendar_oauth', timestamp: Date.now() },
        env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: env.GOOGLE_REDIRECT_URI,
        response_type: 'code',
        scope: env.GOOGLE_CALENDAR_SCOPES,
        access_type: 'offline',
        prompt: 'consent',
        state
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      return {
        connected: false,
        status: 'NOT_CONNECTED',
        authUrl
      };
    }

    // Resilient offline / development mode fallback
    const user = await rpgStore.findUserById(userId);
    const profile = await rpgStore.getProfile(userId);
    const accountEmail = email || user?.email || 'adventurer@gmail.com';
    const now = new Date().toISOString();

    const record = await rpgStore.setCalendarConnection(userId, {
      connected: true,
      status: 'CONNECTED',
      accountEmail,
      lastSync: now
    });

    const localDate = getUserLocalDate(profile?.timezone || 'UTC');
    userCalendarEvents[userId] = [
      {
        id: `cal-${userId}-1`,
        title: 'Deep Work: System Architecture & Coding',
        date: localDate,
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        description: 'Focus block for core technical development',
        location: 'Workstation Terminal',
        color: '#4f46e5'
      },
      {
        id: `cal-${userId}-2`,
        title: 'Physical Conditioning & Recovery',
        date: localDate,
        startTime: '05:30 PM',
        endTime: '06:30 PM',
        description: 'Cardiovascular conditioning session',
        location: 'Athletic Facility',
        color: '#f59e0b'
      }
    ];

    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'CALENDAR_CONNECTED',
      title: '📅 Google Calendar Linked',
      description: `Synchronized scheduled blocks for account ${accountEmail}.`,
      createdAt: now
    });

    return {
      connected: record.connected,
      status: record.status,
      accountEmail: record.accountEmail,
      lastSync: record.lastSync
    };
  }

  /**
   * Processes OAuth 2.0 authorization code callback from Google.
   */
  async handleOAuthCallback(code: string, state: string): Promise<{ success: boolean; redirectUrl: string; error?: string }> {
    try {
      // 1. Verify signed state to prevent CSRF and extract userId
      const decoded = jwt.verify(state, env.JWT_SECRET) as { userId: string; purpose: string };
      if (decoded.purpose !== 'calendar_oauth' || !decoded.userId) {
        return {
          success: false,
          redirectUrl: `${env.FRONTEND_URL}/settings?calendar=error&reason=invalid_state`
        };
      }

      const userId = decoded.userId;

      // 2. Exchange authorization code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: env.GOOGLE_CLIENT_ID!,
          client_secret: env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: env.GOOGLE_REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });

      const tokenData = (await tokenRes.json()) as any;
      if (!tokenRes.ok || !tokenData.access_token) {
        console.error('❌ Google Token Exchange Failed:', tokenData);
        return {
          success: false,
          redirectUrl: `${env.FRONTEND_URL}/settings?calendar=error&reason=token_exchange_failed`,
          error: tokenData.error_description || 'Failed to exchange authorization code'
        };
      }

      // 3. Fetch primary calendar user email using the new access token
      let accountEmail = 'google_adventurer@gmail.com';
      try {
        const profileRes = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList/primary', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
        if (profileRes.ok) {
          const profileData = (await profileRes.json()) as any;
          accountEmail = profileData.id || accountEmail;
        }
      } catch (err) {
        console.warn('⚠️ Could not fetch primary calendar email, using fallback', err);
      }

      const now = new Date().toISOString();
      const tokenExpiry = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

      // 4. Save connection with tokens in database/store
      await rpgStore.setCalendarConnection(userId, {
        connected: true,
        status: 'CONNECTED',
        accountEmail,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry,
        scope: tokenData.scope,
        lastSync: now
      });

      await rpgStore.logActivity({
        id: `act-${Date.now()}`,
        userId,
        actionType: 'CALENDAR_CONNECTED',
        title: '📅 Google Calendar Linked',
        description: `Connected Google Calendar for ${accountEmail} (read-only).`,
        createdAt: now
      });

      return {
        success: true,
        redirectUrl: `${env.FRONTEND_URL}/settings?calendar=connected`
      };
    } catch (err: any) {
      console.error('❌ Calendar OAuth Callback Exception:', err);
      return {
        success: false,
        redirectUrl: `${env.FRONTEND_URL}/settings?calendar=error&reason=callback_exception`,
        error: err.message
      };
    }
  }

  /**
   * Refreshes expired Google access token using stored refresh token.
   * If refresh token was revoked by user at Google, marks status as REAUTHORIZATION_REQUIRED.
   */
  private async refreshAccessToken(userId: string, refreshToken: string): Promise<string | null> {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      return null;
    }

    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: env.GOOGLE_CLIENT_ID,
          client_secret: env.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      const data = (await res.json()) as any;

      if (!res.ok) {
        // invalid_grant indicates user revoked permission or token expired
        if (data.error === 'invalid_grant' || res.status === 400 || res.status === 401) {
          console.warn(`⚠️ Google Calendar authorization revoked for user ${userId}. Setting REAUTHORIZATION_REQUIRED.`);
          await this.setReauthorizationRequired(userId);
        }
        return null;
      }

      const newExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();
      await rpgStore.setCalendarConnection(userId, {
        accessToken: data.access_token,
        tokenExpiry: newExpiry
      });

      return data.access_token;
    } catch (err) {
      console.error('❌ Token refresh network error:', err);
      return null;
    }
  }

  /**
   * Fetches real read-only events from Google Calendar API.
   * User-isolated. Never converts calendar events into completed LIFE RPG quests.
   * Returns empty array when disconnected.
   */
  async getEvents(userId: string): Promise<CalendarEvent[]> {
    const conn = await rpgStore.getCalendarConnection(userId);
    if (!conn || !conn.connected || conn.status !== 'CONNECTED') {
      return [];
    }

    // If real Google Calendar tokens exist, call Google Calendar API
    if (conn.accessToken) {
      let accessToken = conn.accessToken;

      // Check if access token is expired or within 60 seconds of expiration
      const isExpired = conn.tokenExpiry ? new Date(conn.tokenExpiry).getTime() < Date.now() + 60000 : false;
      if (isExpired && conn.refreshToken) {
        const refreshed = await this.refreshAccessToken(userId, conn.refreshToken);
        if (!refreshed) {
          return [];
        }
        accessToken = refreshed;
      }

      try {
        const now = new Date();
        const timeMin = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        const timeMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const calUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime&maxResults=20`;

        const eventsRes = await fetch(calUrl, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (eventsRes.status === 401) {
          // Token rejected; try refresh or mark reauthorization required
          if (conn.refreshToken) {
            const refreshed = await this.refreshAccessToken(userId, conn.refreshToken);
            if (refreshed) {
              return this.getEvents(userId);
            }
          }
          await this.setReauthorizationRequired(userId);
          return [];
        }

        if (!eventsRes.ok) {
          console.error(`❌ Google Calendar API returned ${eventsRes.status}`);
          return [];
        }

        const data = (await eventsRes.json()) as any;
        const items = data.items || [];

        return items.map((item: any) => {
          const startDate = item.start?.dateTime
            ? item.start.dateTime.split('T')[0]
            : (item.start?.date || '');

          const startTime = item.start?.dateTime
            ? new Date(item.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'All Day';

          const endTime = item.end?.dateTime
            ? new Date(item.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return {
            id: item.id,
            title: item.summary || 'Scheduled Focus Block',
            date: startDate,
            startTime,
            endTime,
            description: item.description || '',
            location: item.location || '',
            color: '#4f46e5'
          };
        });
      } catch (err) {
        console.error('❌ Error fetching Google Calendar events:', err);
        return [];
      }
    }

    // Development / offline test fallback
    return userCalendarEvents[userId] || [];
  }

  async disconnect(userId: string): Promise<CalendarStatus> {
    const conn = await rpgStore.getCalendarConnection(userId);

    // Revoke token at Google if possible
    if (conn?.accessToken || conn?.refreshToken) {
      try {
        const tokenToRevoke = conn.refreshToken || conn.accessToken || '';
        if (tokenToRevoke) {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tokenToRevoke)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });
        }
      } catch {
        // Safe fallback if network error
      }
    }

    const record = await rpgStore.setCalendarConnection(userId, {
      connected: false,
      status: 'NOT_CONNECTED',
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiry: undefined,
      lastSync: undefined
    });

    delete userCalendarEvents[userId];

    await rpgStore.logActivity({
      id: `act-${Date.now()}`,
      userId,
      actionType: 'CALENDAR_DISCONNECTED',
      title: '📅 Google Calendar Disconnected',
      description: 'External calendar synchronization terminated.',
      createdAt: new Date().toISOString()
    });

    return {
      connected: record.connected,
      status: record.status
    };
  }

  async setReauthorizationRequired(userId: string): Promise<CalendarStatus> {
    const conn = await rpgStore.getCalendarConnection(userId);
    const record = await rpgStore.setCalendarConnection(userId, {
      connected: false,
      status: 'REAUTHORIZATION_REQUIRED',
      accessToken: undefined,
      accountEmail: conn?.accountEmail,
      lastSync: conn?.lastSync
    });

    delete userCalendarEvents[userId];

    return {
      connected: false,
      status: 'REAUTHORIZATION_REQUIRED',
      accountEmail: record.accountEmail,
      lastSync: record.lastSync
    };
  }
}

export const calendarService = new CalendarService();
