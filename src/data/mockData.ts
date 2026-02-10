// ─── Types ───────────────────────────────────────────────────────
export interface User {
  userID: string;
  userName: string;
  department: string;
  jobTitle: string;
  status: "Active" | "Inactive";
}

export interface Device {
  deviceID: string;
  deviceName: string;
  ipAddress: string;
  serialNumber: string;
  lastSeen: Date;
  status: "Online" | "Offline";
}

export type EventType = "Access Granted" | "Access Denied" | "Attendance";
export type EventStatus = "Real-time" | "Offline";

export interface AttendanceLog {
  logID: string;
  userID: string;
  userName: string;
  deviceID: string;
  deviceName: string;
  deviceIP: string;
  eventType: EventType;
  eventDateTime: Date;
  eventStatus: EventStatus;
  terminalSerial: string;
  receivedAt: Date;
}

// ─── Seed Data ───────────────────────────────────────────────────
export const users: User[] = [
  { userID: "U001", userName: "Ahmed Al-Farsi", department: "Engineering", jobTitle: "Software Engineer", status: "Active" },
  { userID: "U002", userName: "Sara Malik", department: "HR", jobTitle: "HR Manager", status: "Active" },
  { userID: "U003", userName: "James Chen", department: "Operations", jobTitle: "Operations Lead", status: "Active" },
  { userID: "U004", userName: "Fatima Hassan", department: "Finance", jobTitle: "Accountant", status: "Active" },
  { userID: "U005", userName: "Omar Khaled", department: "Engineering", jobTitle: "DevOps Engineer", status: "Active" },
  { userID: "U006", userName: "Lina Yousef", department: "Marketing", jobTitle: "Marketing Specialist", status: "Active" },
  { userID: "U007", userName: "David Smith", department: "Security", jobTitle: "Security Officer", status: "Active" },
  { userID: "U008", userName: "Noor Amin", department: "Engineering", jobTitle: "QA Engineer", status: "Inactive" },
  { userID: "U009", userName: "Khalid Raza", department: "IT", jobTitle: "System Admin", status: "Active" },
  { userID: "U010", userName: "Maria Lopez", department: "Operations", jobTitle: "Coordinator", status: "Active" },
  { userID: "U011", userName: "Tariq Hussain", department: "Finance", jobTitle: "Financial Analyst", status: "Active" },
  { userID: "U012", userName: "Aisha Binte", department: "HR", jobTitle: "Recruiter", status: "Inactive" },
];

export const devices: Device[] = [
  { deviceID: "D001", deviceName: "Main Entrance", ipAddress: "192.168.1.101", serialNumber: "BT-SN-4001", lastSeen: new Date(), status: "Online" },
  { deviceID: "D002", deviceName: "Parking Gate", ipAddress: "192.168.1.102", serialNumber: "BT-SN-4002", lastSeen: new Date(), status: "Online" },
  { deviceID: "D003", deviceName: "Server Room", ipAddress: "192.168.1.103", serialNumber: "BT-SN-4003", lastSeen: new Date(), status: "Online" },
  { deviceID: "D004", deviceName: "Floor 2 Entry", ipAddress: "192.168.1.104", serialNumber: "BT-SN-4004", lastSeen: new Date(), status: "Online" },
  { deviceID: "D005", deviceName: "Warehouse", ipAddress: "192.168.1.105", serialNumber: "BT-SN-4005", lastSeen: new Date(Date.now() - 3600000), status: "Offline" },
  { deviceID: "D006", deviceName: "Cafeteria", ipAddress: "192.168.1.106", serialNumber: "BT-SN-4006", lastSeen: new Date(), status: "Online" },
];

// ─── Historical seed logs ────────────────────────────────────────
let logCounter = 0;
const eventTypes: EventType[] = ["Access Granted", "Access Denied", "Attendance"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLog(dateTime?: Date): AttendanceLog {
  logCounter++;
  const user = randomItem(users.filter((u) => u.status === "Active"));
  const device = randomItem(devices);
  const now = dateTime || new Date();
  return {
    logID: `L${String(logCounter).padStart(6, "0")}`,
    userID: user.userID,
    userName: user.userName,
    deviceID: device.deviceID,
    deviceName: device.deviceName,
    deviceIP: device.ipAddress,
    eventType: Math.random() > 0.05 ? (Math.random() > 0.3 ? "Attendance" : "Access Granted") : "Access Denied",
    eventDateTime: now,
    eventStatus: device.status === "Online" ? "Real-time" : "Offline",
    terminalSerial: device.serialNumber,
    receivedAt: new Date(now.getTime() + Math.floor(Math.random() * 500)),
  };
}

// Generate 200 historical logs spread over the past 7 days
export function generateHistoricalLogs(): AttendanceLog[] {
  const logs: AttendanceLog[] = [];
  const now = Date.now();
  for (let i = 0; i < 200; i++) {
    const offset = Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
    logs.push(generateLog(new Date(now - offset)));
  }
  return logs.sort((a, b) => b.eventDateTime.getTime() - a.eventDateTime.getTime());
}

// Generate a single new real-time log
export function generateNewLog(): AttendanceLog {
  return generateLog(new Date());
}
