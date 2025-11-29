
import { User, UserRole, Project, Task, Notification, FormTemplate, Plan, FieldIssue, RFI, PlanFolder } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Marcus Jensen',
  role: UserRole.FOREMAN,
  avatar: 'https://picsum.photos/id/1012/200/200'
};

export const PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Eaglewood Retail Center',
    location: '290 S Orchard Dr, North Salt Lake, UT 84054',
    status: 'ACTIVE',
    budget: 2800000,
    spent: 1820000,
    progress: 65,
    startDate: '2024-06-01',
    endDate: '2025-04-30'
  },
  {
    id: 'p2',
    name: 'Orchard Plaza East Renovation',
    location: '20-50 S Orchard Dr, North Salt Lake, UT 84054',
    status: 'ACTIVE',
    budget: 1450000,
    spent: 319000,
    progress: 22,
    startDate: '2024-09-15',
    endDate: '2025-08-20'
  },
  {
    id: 'p3',
    name: 'Legacy Parkway Trail Extension',
    location: 'Legacy Parkway & Center St, North Salt Lake, UT',
    status: 'PLANNING',
    budget: 4200000,
    spent: 84000,
    progress: 5,
    startDate: '2025-03-01',
    endDate: '2026-06-30'
  }
];

export const PLAN_FOLDERS: PlanFolder[] = [
  { id: 'arch', name: 'Architectural', count: 14 },
  { id: 'struct', name: 'Structural', count: 8 },
  { id: 'elec', name: 'Electrical', count: 5 },
  { id: 'mech', name: 'Mechanical', count: 6 },
];

export const PLANS: Plan[] = [
  {
    id: 'pl1',
    projectId: 'p1',
    folderId: 'arch',
    name: 'A-101 Retail Ground Floor Plan',
    version: 'v2.1',
    imageUrl: 'https://images.unsplash.com/photo-1599700403969-fcc35f4f04c5?q=80&w=2574&auto=format&fit=crop',
    uploadDate: '2024-10-10'
  },
  {
    id: 'pl2',
    projectId: 'p1',
    folderId: 'elec',
    name: 'E-201 Electrical Rough-in',
    version: 'v1.0',
    imageUrl: 'https://images.unsplash.com/photo-1630327773229-9e8e25d6b4a3?q=80&w=2670&auto=format&fit=crop',
    uploadDate: '2024-10-12'
  }
];

export const FIELD_ISSUES: FieldIssue[] = [
  {
    id: 'fi1',
    planId: 'pl1',
    x: 45,
    y: 30,
    status: 'OPEN',
    priority: 'HIGH',
    category: 'Quality',
    description: 'HVAC supply duct conflicts with steel beam at Grid C-4. Coordinate with Hughes GC for resolution.',
    assignedTo: 'Derek Sorensen',
    dueDate: '2024-12-15'
  },
  {
    id: 'fi2',
    planId: 'pl1',
    x: 72,
    y: 65,
    status: 'RESOLVED',
    priority: 'MEDIUM',
    category: 'Punch List',
    description: 'Missing 20A outlet at drive-thru window per tenant specs.',
    assignedTo: 'Cody Rasmussen'
  }
];

export const RFIS: RFI[] = [
  {
    id: 'rfi1',
    projectId: 'p1',
    number: '007',
    subject: 'Fire Sprinkler Head Spacing in Suite 102',
    question: 'Drawing FP-201 shows sprinkler heads at 12\' spacing but the tenant improvement plans for Eaglewood Retail Suite 102 include a dropped ceiling at 9\'. Please clarify if additional heads are required per Davis County Fire Authority standards.',
    status: 'OPEN',
    costImpact: 'Potential $4,200',
    scheduleImpact: '3 Days',
    assignedTo: 'Brent Kimball, PE - Spectrum Engineers',
    dueDate: '2024-12-10'
  },
  {
    id: 'rfi2',
    projectId: 'p1',
    number: '006',
    subject: 'ADA Ramp Slope at Main Entrance',
    question: 'Civil drawings show 8.5% slope on the ADA ramp approach from the Orchard Drive sidewalk. Utah accessibility code requires max 8.33%. Confirm if regrading is required or if variance has been obtained from North Salt Lake Building Dept.',
    status: 'CLOSED',
    costImpact: '$1,800',
    scheduleImpact: '1 Day',
    assignedTo: 'Civil West Engineering',
    dueDate: '2024-11-20'
  }
];

export const TASKS: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    name: 'Structural Steel Erection',
    startDate: '2024-11-15',
    durationDays: 14,
    progress: 80,
    assignedCrew: 5,
    requiredCrew: 6,
    budget: 185000,
    spent: 156000
  },
  {
    id: 't2',
    projectId: 'p1',
    name: 'Concrete Slab - Building B',
    startDate: '2024-11-25',
    durationDays: 5,
    progress: 20,
    assignedCrew: 8,
    requiredCrew: 8,
    budget: 72000,
    spent: 14400
  },
  {
    id: 't3',
    projectId: 'p1',
    name: 'Metal Stud Framing',
    startDate: '2024-12-05',
    durationDays: 20,
    progress: 0,
    assignedCrew: 0,
    requiredCrew: 10,
    budget: 94000,
    spent: 0
  },
  {
    id: 't4',
    projectId: 'p1',
    name: 'Storefront Glazing Installation',
    startDate: '2024-12-20',
    durationDays: 12,
    progress: 0,
    assignedCrew: 0,
    requiredCrew: 4,
    budget: 128000,
    spent: 0
  }
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'ALERT', message: 'Davis County inspection scheduled for Dec 5th - prep required', timestamp: '2h ago' },
  { id: 'n2', type: 'INFO', message: 'Snow forecast Wednesday - Concrete pour may need rescheduling', timestamp: '5h ago' },
  { id: 'n3', type: 'SUCCESS', message: 'PO #8847 approved by Acme Construction procurement', timestamp: '1d ago' },
  { id: 'n4', type: 'ALERT', message: 'Staker Parson delivery arriving 7:00 AM - Orchard Dr access', timestamp: '3h ago' }
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
      { id: 'm3', type: 'yesno', label: 'Damaged Goods?', required: true },
      { id: 'm4', type: 'text', label: 'PO Number', required: true }
    ]
  },
  {
    id: 'f3',
    title: 'Concrete Pour Report',
    fields: [
      { id: 'c1', type: 'text', label: 'Pour Location / Grid', required: true },
      { id: 'c2', type: 'number', label: 'Cubic Yards Placed', required: true },
      { id: 'c3', type: 'text', label: 'Concrete Supplier', required: true },
      { id: 'c4', type: 'text', label: 'Batch Ticket Numbers', required: true },
      { id: 'c5', type: 'photo', label: 'Slump Test Photo', required: true },
      { id: 'c6', type: 'signature', label: 'QC Inspector Signature', required: true }
    ]
  }
];
