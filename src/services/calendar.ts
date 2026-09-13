import { api } from './api';
import { ApiResponse } from '../types';

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

export const calendarService = {
  async getCalendarStatus(): Promise<ApiResponse<CalendarStatus>> {
    return api.get<CalendarStatus>('/calendar/status');
  },

  async connectCalendar(email?: string): Promise<ApiResponse<CalendarStatus>> {
    const res = await api.post<CalendarStatus>('/calendar/connect', { email });
    if (res.success && res.data?.authUrl && typeof window !== 'undefined') {
      window.location.href = res.data.authUrl;
    }
    return res;
  },

  async disconnectCalendar(): Promise<ApiResponse<CalendarStatus>> {
    return api.post<CalendarStatus>('/calendar/disconnect');
  },

  async getCalendarEvents(): Promise<ApiResponse<CalendarEvent[]>> {
    return api.get<CalendarEvent[]>('/calendar/events');
  },
};
