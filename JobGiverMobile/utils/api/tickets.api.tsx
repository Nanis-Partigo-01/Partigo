// utils/api/tickets.api.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";

/* ----------------------------------
   Config
----------------------------------- */

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL; // move to env later

/* ----------------------------------
   Axios Instance
----------------------------------- */

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ----------------------------------
   Interceptors
----------------------------------- */

// Attach token automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log("🔐 Unauthorized – logging out");
      await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
      // TODO: navigate to Login screen
    }
    return Promise.reject(error);
  },
);

/* ----------------------------------
   Types
----------------------------------- */

export enum TicketStatus {
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS", // Worker Accepted
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export type CoordinatesPayload = {
  latitude: number;
  longitude: number;
};

// Payload for creating a ticket
export type CreateTicketPayload = {
  title: string;
  description: string;
  specificDetails?: string;

  // Location Snapshot
  serviceLatitude: number;
  serviceLongitude: number;
  serviceAddress: string;
  addressId?: number; // Optional: Link to a saved address ID if available

  // Schedule & Pricing
  dates: string[];
  startTime: number;
  endTime: number;
  totalPrice: number;
  priceAdjustment?: number;

  photos?: string[];
};

// Payload for rescheduling
export type ReschedulePayload = {
  dates: string[];
  startTime: number;
  endTime: number;
};

// Response shape for a Schedule row
export type ScheduleDetail = {
  id: number;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_price: number;
};

// Basic Ticket Info (for lists)
export type Ticket = {
  id: string;
  title: string;
  status: TicketStatus;
  location: string;
  display_status: string; // 'Active', 'Accepted', etc.
  created_at: string;
};

// Detailed Ticket Info (for details screen)
export type TicketDetails = Ticket & {
  description: string;
  schedules: ScheduleDetail[];
  photos: string[];
  service_lat: number;
  service_lng: number;
};

/* ----------------------------------
   APIs
----------------------------------- */

// 1. Create Ticket
export const createTicket = async (
  payload: CreateTicketPayload,
): Promise<{ ticketId: string; message: string }> => {
  console.log("Create ticket Payload", payload);
  // Ensure your Backend Controller is set to @Post() on '/tickets'
  const response = await api.post("/tickets/create", payload);
  return response.data;
};

// 2. Get My Tickets (List)
export const getMyTickets = async (): Promise<Ticket[]> => {
  const response = await api.get("/tickets/my-tickets");
  return response.data;
};

// 3. Get Single Ticket Details
export const getTicketDetails = async (id: string): Promise<TicketDetails> => {
  const response = await api.get(`/tickets/${id}`);
  return response.data;
};

// 4. Reschedule Ticket
export const rescheduleTicket = async (
  id: string,
  payload: ReschedulePayload,
): Promise<{ message: string }> => {
  const response = await api.patch(`/tickets/${id}/reschedule`, payload);
  return response.data;
};
