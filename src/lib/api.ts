import type { AttendanceLog, Device, User } from "@/data/mockData";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

type DateField = AttendanceLog | Device;

function mapDates<T extends DateField>(item: T): T {
  const clone = { ...item } as Record<string, unknown>;
  if (clone.eventDateTime) clone.eventDateTime = new Date(String(clone.eventDateTime));
  if (clone.receivedAt) clone.receivedAt = new Date(String(clone.receivedAt));
  if (clone.lastSeen) clone.lastSeen = new Date(String(clone.lastSeen));
  return clone as T;
}

async function fetchJson<T>(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function postJson<TResponse, TBody>(path: string, body: TBody) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<TResponse>;
}

export async function fetchUsers() {
  return fetchJson<User[]>("/users");
}

export interface CreateUserInput {
  userID: string;
  userName: string;
  department: string;
  jobTitle: string;
  status: User["status"];
}

export async function createUser(input: CreateUserInput) {
  return postJson<User, CreateUserInput>("/users", input);
}

export async function fetchDevices() {
  const devices = await fetchJson<Device[]>("/devices");
  return devices.map(mapDates);
}

export interface CreateDeviceInput {
  deviceID: string;
  deviceName: string;
  ipAddress: string;
  serialNumber: string;
  status: Device["status"];
}

export async function createDevice(input: CreateDeviceInput) {
  const device = await postJson<Device, CreateDeviceInput>("/devices", input);
  return mapDates(device);
}

export interface LogFilters {
  limit?: number;
  from?: Date;
  to?: Date;
  userId?: string;
  deviceId?: string;
  eventType?: string;
}

export async function fetchLogs(filters: LogFilters = {}) {
  const params = new URLSearchParams();
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.from) params.set("from", filters.from.toISOString());
  if (filters.to) params.set("to", filters.to.toISOString());
  if (filters.userId && filters.userId !== "all") params.set("userId", filters.userId);
  if (filters.deviceId && filters.deviceId !== "all") params.set("deviceId", filters.deviceId);
  if (filters.eventType && filters.eventType !== "all") params.set("eventType", filters.eventType);
  const query = params.toString();
  const logs = await fetchJson<AttendanceLog[]>(`/logs${query ? `?${query}` : ""}`);
  return logs.map(mapDates);
}
