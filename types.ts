
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

export type ScheduleTaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DELAYED' | 'COMPLETED' | 'ON_HOLD';
export type DependencyType = 'FS' | 'FF' | 'SS' | 'SF'; // Finish-to-Start, Finish-to-Finish, Start-to-Start, Start-to-Finish

export interface TaskDependency {
  taskId: string;
  type: DependencyType;
  lagDays?: number; // positive = delay, negative = overlap
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
  // New scheduling fields
  status: ScheduleTaskStatus;
  predecessors: TaskDependency[];
  isMilestone: boolean;
  phase?: string; // e.g., "Foundation", "Framing", "MEP", "Finishes"
  actualStartDate?: string;
  actualEndDate?: string;
  notes?: string;
  priority: TaskPriority;
  // Critical path fields (calculated)
  isOnCriticalPath?: boolean;
  slack?: number; // days of float
  earlyStart?: string;
  earlyFinish?: string;
  lateStart?: string;
  lateFinish?: string;
}

export interface PlanFolder {
  id: string;
  name: string;
  count: number;
}

export interface Plan {
  id: string;
  projectId: string;
  folderId: string;
  name: string;
  version: string;
  imageUrl: string;
  uploadDate: string;
}

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'VERIFIED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface FieldIssue {
  id: string;
  planId: string;
  x: number; // Percentage 0-100 relative to plan image
  y: number; // Percentage 0-100 relative to plan image
  status: TaskStatus;
  priority: TaskPriority;
  description: string;
  assignedTo?: string;
  category?: 'Safety' | 'Quality' | 'Punch List';
  dueDate?: string;
}

export interface RFI {
  id: string;
  projectId: string;
  number: string;
  subject: string;
  question: string;
  status: 'DRAFT' | 'OPEN' | 'CLOSED';
  costImpact?: string;
  scheduleImpact?: string;
  assignedTo: string;
  dueDate: string;
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
