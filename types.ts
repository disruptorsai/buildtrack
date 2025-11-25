export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  FOREMAN = 'FOREMAN',
  PM = 'PM',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PLANNING';
  budget: number;
  spent: number;
  progress: number; // 0-100
  startDate: string;
  endDate: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  durationDays: number;
  progress: number;
  assignedCrew: number;
  requiredCrew: number;
  budget: number;
  spent: number;
}

export interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  clockIn: string;
  clockOut?: string;
  gpsLocationIn?: { lat: number; lng: number };
  gpsLocationOut?: { lat: number; lng: number };
  status: 'PENDING' | 'APPROVED';
}

export interface DriverLog {
  id: string;
  date: string;
  vehicleId: string;
  status: 'OFF_DUTY' | 'SLEEPER' | 'DRIVING' | 'ON_DUTY';
  inspectionPassed: boolean;
  notes?: string;
  hosRemaining: number; // minutes
}

export interface FormTemplate {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'date' | 'select' | 'photo' | 'signature' | 'yesno';
  label: string;
  required: boolean;
  options?: string[];
}

export interface Notification {
  id: string;
  type: 'ALERT' | 'INFO' | 'SUCCESS';
  message: string;
  timestamp: string;
}