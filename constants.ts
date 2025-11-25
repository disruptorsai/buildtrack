import { User, UserRole, Project, Task, Notification, FormTemplate } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Tim MacIntyre',
  role: UserRole.FOREMAN,
  avatar: 'https://picsum.photos/id/1005/200/200'
};

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Phoenix Medical Center',
    location: '1200 N Central Ave',
    status: 'ACTIVE',
    budget: 1500000,
    spent: 980000,
    progress: 65,
    startDate: '2023-09-01',
    endDate: '2024-06-30'
  },
  {
    id: 'p2',
    name: 'Skyline Lofts Phase 2',
    location: '450 E Jefferson St',
    status: 'ACTIVE',
    budget: 2200000,
    spent: 450000,
    progress: 22,
    startDate: '2024-01-15',
    endDate: '2024-11-20'
  },
  {
    id: 'p3',
    name: 'Westside Highway Expansion',
    location: 'I-10 Mile marker 145',
    status: 'PLANNING',
    budget: 5500000,
    spent: 50000,
    progress: 5,
    startDate: '2024-06-01',
    endDate: '2025-12-31'
  }
];

export const TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    name: 'Structural Steel',
    startDate: '2024-05-01',
    durationDays: 14,
    progress: 80,
    assignedCrew: 5,
    requiredCrew: 6,
    budget: 50000,
    spent: 48000
  },
  {
    id: 't2',
    projectId: 'p1',
    name: 'Concrete Pour L2',
    startDate: '2024-05-10',
    durationDays: 5,
    progress: 20,
    assignedCrew: 8,
    requiredCrew: 8,
    budget: 25000,
    spent: 5000
  },
  {
    id: 't3',
    projectId: 'p1',
    name: 'Framing & Drywall',
    startDate: '2024-05-18',
    durationDays: 20,
    progress: 0,
    assignedCrew: 0,
    requiredCrew: 10,
    budget: 80000,
    spent: 0
  }
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'ALERT', message: 'DOT Medical Card expires in 14 days', timestamp: '2h ago' },
  { id: 'n2', type: 'INFO', message: 'Rain forecast for Thursday - Schedule review needed', timestamp: '5h ago' },
  { id: 'n3', type: 'SUCCESS', message: 'PO #4492 approved by Procurement', timestamp: '1d ago' }
];

export const FORM_TEMPLATES: FormTemplate[] = [
  {
    id: 'f1',
    title: 'Daily Safety Inspection',
    fields: [
      { id: 'fl1', type: 'text', label: 'Inspector Name', required: true },
      { id: 'fl2', type: 'yesno', label: 'PPE Check Passed?', required: true },
      { id: 'fl3', type: 'photo', label: 'Site Overview Photo', required: true },
      { id: 'fl4', type: 'text', label: 'Hazards Identified', required: false },
      { id: 'fl5', type: 'signature', label: 'Foreman Signature', required: true }
    ]
  },
  {
    id: 'f2',
    title: 'Material Delivery Log',
    fields: [
      { id: 'm1', type: 'text', label: 'Vendor Name', required: true },
      { id: 'm2', type: 'photo', label: 'Packing Slip', required: true },
      { id: 'm3', type: 'yesno', label: 'Damaged Goods?', required: true }
    ]
  }
];