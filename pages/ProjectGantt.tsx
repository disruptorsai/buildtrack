import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, Users, DollarSign, Calendar, X,
  Search, Filter, Download, ZoomIn, ZoomOut, Target, AlertTriangle,
  CheckCircle2, Clock, Pause, Flag, Link2, Edit3, Trash2, ChevronDown,
  ChevronUp, Diamond, ArrowRight, Maximize2, RefreshCw, FileDown, Image
} from 'lucide-react';
import { TASKS, PROJECTS } from '../constants';
import { Task, ScheduleTaskStatus, TaskPriority, TaskDependency } from '../types';

// Phase colors for visual distinction
const PHASE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Site Work': { bg: 'bg-amber-200 dark:bg-amber-800', border: 'border-amber-400', text: 'text-amber-800 dark:text-amber-200' },
  'Foundation': { bg: 'bg-stone-300 dark:bg-stone-700', border: 'border-stone-500', text: 'text-stone-800 dark:text-stone-200' },
  'Structure': { bg: 'bg-blue-200 dark:bg-blue-800', border: 'border-blue-400', text: 'text-blue-800 dark:text-blue-200' },
  'Framing': { bg: 'bg-yellow-200 dark:bg-yellow-800', border: 'border-yellow-400', text: 'text-yellow-800 dark:text-yellow-200' },
  'MEP': { bg: 'bg-purple-200 dark:bg-purple-800', border: 'border-purple-400', text: 'text-purple-800 dark:text-purple-200' },
  'Exterior': { bg: 'bg-teal-200 dark:bg-teal-800', border: 'border-teal-400', text: 'text-teal-800 dark:text-teal-200' },
  'Finishes': { bg: 'bg-pink-200 dark:bg-pink-800', border: 'border-pink-400', text: 'text-pink-800 dark:text-pink-200' },
  'Closeout': { bg: 'bg-green-200 dark:bg-green-800', border: 'border-green-400', text: 'text-green-800 dark:text-green-200' },
};

const STATUS_CONFIG: Record<ScheduleTaskStatus, { icon: React.ReactNode; color: string; label: string }> = {
  'NOT_STARTED': { icon: <Clock size={12} />, color: 'text-slate-400', label: 'Not Started' },
  'IN_PROGRESS': { icon: <RefreshCw size={12} className="animate-spin" />, color: 'text-blue-500', label: 'In Progress' },
  'DELAYED': { icon: <AlertTriangle size={12} />, color: 'text-red-500', label: 'Delayed' },
  'COMPLETED': { icon: <CheckCircle2 size={12} />, color: 'text-green-500', label: 'Completed' },
  'ON_HOLD': { icon: <Pause size={12} />, color: 'text-amber-500', label: 'On Hold' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string }> = {
  'LOW': { color: 'bg-slate-200 text-slate-700', label: 'Low' },
  'MEDIUM': { color: 'bg-blue-200 text-blue-700', label: 'Medium' },
  'HIGH': { color: 'bg-orange-200 text-orange-700', label: 'High' },
  'CRITICAL': { color: 'bg-red-200 text-red-700', label: 'Critical' },
};

type ViewMode = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER';

export const ProjectGantt: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('WEEK');
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ScheduleTaskStatus | 'ALL'>('ALL');
  const [filterPhase, setFilterPhase] = useState<string | 'ALL'>('ALL');
  const [showCriticalPath, setShowCriticalPath] = useState(true);
  const [showDependencies, setShowDependencies] = useState(true);
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Find the earliest and latest dates to determine the timeline range
  const { minDate, maxDate } = useMemo(() => {
    let min = new Date(tasks[0]?.startDate || '2024-11-01');
    let max = new Date(tasks[0]?.startDate || '2024-11-01');

    tasks.forEach(task => {
      const start = new Date(task.startDate);
      const end = new Date(task.startDate);
      end.setDate(end.getDate() + task.durationDays);

      if (start < min) min = start;
      if (end > max) max = end;
    });

    // Add some buffer days
    min.setDate(min.getDate() - 7);
    max.setDate(max.getDate() + 14);

    return { minDate: min, maxDate: max };
  }, [tasks]);

  const [startDate, setStartDate] = useState(minDate);

  // Calculate timeline width based on view mode
  const DAY_WIDTH = useMemo(() => {
    switch (viewMode) {
      case 'DAY': return 80;
      case 'WEEK': return 40;
      case 'MONTH': return 12;
      case 'QUARTER': return 4;
    }
  }, [viewMode]);

  const ROW_HEIGHT = 48;

  // Calculate days to show
  const daysToShow = useMemo(() => {
    const diffTime = maxDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 7;
  }, [startDate, maxDate]);

  const getX = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffTime = d.getTime() - startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays * DAY_WIDTH;
  };

  const dates = useMemo(() => {
    return Array.from({ length: daysToShow }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [startDate, daysToShow]);

  // Filter tasks based on search, status, and phase
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
      const matchesPhase = filterPhase === 'ALL' || task.phase === filterPhase;
      return matchesSearch && matchesStatus && matchesPhase;
    });
  }, [tasks, searchQuery, filterStatus, filterPhase]);

  // Group tasks by phase
  const tasksByPhase = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    filteredTasks.forEach(task => {
      const phase = task.phase || 'Other';
      if (!groups[phase]) groups[phase] = [];
      groups[phase].push(task);
    });
    return groups;
  }, [filteredTasks]);

  // Get unique phases
  const phases = useMemo(() => {
    const uniquePhases = new Set(tasks.map(t => t.phase).filter(Boolean));
    return Array.from(uniquePhases) as string[];
  }, [tasks]);

  // Today's date marker
  const today = new Date();
  const todayX = getX(today.toISOString().split('T')[0]);

  // Calculate summary metrics
  const metrics = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const criticalTasks = tasks.filter(t => t.isOnCriticalPath).length;
    const delayedTasks = tasks.filter(t => t.status === 'DELAYED').length;
    const totalBudget = tasks.reduce((sum, t) => sum + t.budget, 0);
    const totalSpent = tasks.reduce((sum, t) => sum + t.spent, 0);
    const totalCrew = tasks.reduce((sum, t) => sum + t.requiredCrew, 0);
    const assignedCrew = tasks.reduce((sum, t) => sum + t.assignedCrew, 0);

    return {
      totalTasks,
      completedTasks,
      criticalTasks,
      delayedTasks,
      totalBudget,
      totalSpent,
      totalCrew,
      assignedCrew,
      progressPercent: Math.round((completedTasks / totalTasks) * 100),
      budgetPercent: Math.round((totalSpent / totalBudget) * 100),
    };
  }, [tasks]);

  const togglePhaseCollapse = (phase: string) => {
    setCollapsedPhases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(phase)) {
        newSet.delete(phase);
      } else {
        newSet.add(phase);
      }
      return newSet;
    });
  };

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      const newStart = new Date();
      newStart.setDate(newStart.getDate() - 7);
      setStartDate(newStart);
    } else {
      const days = viewMode === 'DAY' ? 7 : viewMode === 'WEEK' ? 14 : viewMode === 'MONTH' ? 30 : 90;
      const newStart = new Date(startDate);
      newStart.setDate(newStart.getDate() + (direction === 'next' ? days : -days));
      setStartDate(newStart);
    }
  };

  const [newTask, setNewTask] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    durationDays: 5,
    requiredCrew: 4,
    budget: 10000,
    phase: 'Foundation',
    priority: 'MEDIUM' as TaskPriority,
    isMilestone: false,
    predecessors: [] as string[],
  });

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      projectId: 'p1',
      name: newTask.name,
      startDate: newTask.startDate,
      durationDays: newTask.isMilestone ? 1 : newTask.durationDays,
      progress: 0,
      assignedCrew: 0,
      requiredCrew: newTask.isMilestone ? 0 : newTask.requiredCrew,
      budget: newTask.isMilestone ? 0 : newTask.budget,
      spent: 0,
      status: 'NOT_STARTED',
      predecessors: newTask.predecessors.map(id => ({ taskId: id, type: 'FS' as const, lagDays: 0 })),
      isMilestone: newTask.isMilestone,
      phase: newTask.phase,
      priority: newTask.priority,
      isOnCriticalPath: false,
      slack: 0,
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      durationDays: 5,
      requiredCrew: 4,
      budget: 10000,
      phase: 'Foundation',
      priority: 'MEDIUM',
      isMilestone: false,
      predecessors: [],
    });
    setShowAddModal(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setSelectedTask(null);
    }
  };

  const handleExport = (format: 'png' | 'csv') => {
    if (format === 'csv') {
      const headers = ['Task Name', 'Phase', 'Start Date', 'Duration', 'Progress', 'Status', 'Budget', 'Spent', 'Crew'];
      const rows = tasks.map(t => [
        t.name,
        t.phase || '',
        t.startDate,
        t.durationDays,
        `${t.progress}%`,
        t.status,
        t.budget,
        t.spent,
        `${t.assignedCrew}/${t.requiredCrew}`
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule-export.csv';
      a.click();
    }
  };

  // Render dependency lines
  const renderDependencyLines = () => {
    if (!showDependencies) return null;

    const lines: JSX.Element[] = [];
    let taskIndex = 0;

    Object.entries(tasksByPhase).forEach(([phase, phaseTasks]) => {
      if (collapsedPhases.has(phase)) {
        taskIndex++;
        return;
      }

      phaseTasks.forEach((task) => {
        const taskY = (taskIndex + 1) * ROW_HEIGHT + ROW_HEIGHT / 2;
        const taskEndX = getX(task.startDate) + (task.durationDays * DAY_WIDTH);

        task.predecessors?.forEach(pred => {
          const predTask = tasks.find(t => t.id === pred.taskId);
          if (!predTask) return;

          // Find predecessor index
          let predIndex = 0;
          let found = false;
          Object.entries(tasksByPhase).forEach(([pPhase, pPhaseTasks]) => {
            if (found) return;
            if (collapsedPhases.has(pPhase)) {
              predIndex++;
              return;
            }
            pPhaseTasks.forEach(pt => {
              if (found) return;
              if (pt.id === predTask.id) {
                found = true;
                return;
              }
              predIndex++;
            });
          });

          if (!found) return;

          const predY = (predIndex + 1) * ROW_HEIGHT + ROW_HEIGHT / 2;
          const predEndX = getX(predTask.startDate) + (predTask.durationDays * DAY_WIDTH);
          const taskStartX = getX(task.startDate);

          // Draw dependency line (finish-to-start)
          const midX = predEndX + 10;

          lines.push(
            <g key={`dep-${task.id}-${pred.taskId}`}>
              <path
                d={`M ${predEndX} ${predY}
                    L ${midX} ${predY}
                    L ${midX} ${taskY}
                    L ${taskStartX - 5} ${taskY}`}
                fill="none"
                stroke={task.isOnCriticalPath && showCriticalPath ? '#ef4444' : '#94a3b8'}
                strokeWidth={task.isOnCriticalPath && showCriticalPath ? 2 : 1}
                strokeDasharray={task.isOnCriticalPath && showCriticalPath ? '' : '4,2'}
              />
              <polygon
                points={`${taskStartX - 5},${taskY - 4} ${taskStartX - 5},${taskY + 4} ${taskStartX},${taskY}`}
                fill={task.isOnCriticalPath && showCriticalPath ? '#ef4444' : '#94a3b8'}
              />
            </g>
          );
        });

        taskIndex++;
      });
    });

    return lines;
  };

  // Count visible tasks for SVG height
  const visibleTaskCount = useMemo(() => {
    let count = 0;
    Object.entries(tasksByPhase).forEach(([phase, phaseTasks]) => {
      count++; // phase header
      if (!collapsedPhases.has(phase)) {
        count += phaseTasks.length;
      }
    });
    return count;
  }, [tasksByPhase, collapsedPhases]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Progress</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{metrics.progressPercent}%</div>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: `${metrics.progressPercent}%` }}></div>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">{metrics.completedTasks}/{metrics.totalTasks} tasks</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Budget</div>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-xl font-bold text-slate-900 dark:text-white">{metrics.budgetPercent}%</div>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${metrics.budgetPercent > 100 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(metrics.budgetPercent, 100)}%` }}></div>
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-1">${(metrics.totalSpent / 1000).toFixed(0)}K / ${(metrics.totalBudget / 1000).toFixed(0)}K</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Critical Path</div>
          <div className="text-xl font-bold text-red-500 mt-1">{metrics.criticalTasks}</div>
          <div className="text-xs text-slate-400 mt-1">tasks on critical path</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Delayed</div>
          <div className="text-xl font-bold text-amber-500 mt-1">{metrics.delayedTasks}</div>
          <div className="text-xs text-slate-400 mt-1">tasks behind schedule</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Crew Utilization</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">{metrics.assignedCrew}/{metrics.totalCrew}</div>
          <div className="text-xs text-slate-400 mt-1">workers assigned</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 dark:text-slate-400">Milestones</div>
          <div className="text-xl font-bold text-purple-500 mt-1">{tasks.filter(t => t.isMilestone).length}</div>
          <div className="text-xs text-slate-400 mt-1">{tasks.filter(t => t.isMilestone && t.status === 'COMPLETED').length} completed</div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="text-primary-500" />
            Project Schedule
          </h2>

          {/* Navigation */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1">
            <button
              onClick={() => handleNavigate('prev')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => handleNavigate('today')}
              className="px-2 py-1 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Today
            </button>
            <button
              onClick={() => handleNavigate('next')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-48"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${showFilters ? 'bg-primary-100 text-primary-700 border-primary-300 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Filter size={14} />
            Filters
          </button>

          {/* View Mode */}
          <div className="flex bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1">
            {(['DAY', 'WEEK', 'MONTH', 'QUARTER'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${viewMode === mode ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Toggle Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCriticalPath(!showCriticalPath)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${showCriticalPath ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
              title="Toggle Critical Path"
            >
              <Target size={14} />
              CP
            </button>
            <button
              onClick={() => setShowDependencies(!showDependencies)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors ${showDependencies ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
              title="Toggle Dependencies"
            >
              <Link2 size={14} />
            </button>
          </div>

          {/* Export */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
              <Download size={14} />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 w-full">
                <FileDown size={14} /> Export CSV
              </button>
            </div>
          </div>

          {/* Add Task */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium"
          >
            <Plus size={14} />
            Add Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ScheduleTaskStatus | 'ALL')}
              className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
            >
              <option value="ALL">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DELAYED">Delayed</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Phase:</label>
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1"
            >
              <option value="ALL">All Phases</option>
              {phases.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { setFilterStatus('ALL'); setFilterPhase('ALL'); setSearchQuery(''); }}
            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Gantt Chart */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Timeline Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900">
          <div className="w-72 shrink-0 p-3 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="text-sm">Task Name</span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Duration</span>
            </div>
          </div>
          <div className="flex-1 overflow-x-auto hide-scrollbar" ref={chartRef}>
            <div className="flex relative" style={{ width: daysToShow * DAY_WIDTH }}>
              {/* Month headers */}
              {viewMode !== 'DAY' && (
                <div className="absolute top-0 left-0 right-0 flex h-5 border-b border-slate-200 dark:border-slate-700">
                  {dates.reduce((acc: { month: string; startX: number; width: number }[], d, i) => {
                    const monthStr = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    if (acc.length === 0 || acc[acc.length - 1].month !== monthStr) {
                      acc.push({ month: monthStr, startX: i * DAY_WIDTH, width: DAY_WIDTH });
                    } else {
                      acc[acc.length - 1].width += DAY_WIDTH;
                    }
                    return acc;
                  }, []).map((m, i) => (
                    <div
                      key={i}
                      className="absolute text-xs font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 px-2"
                      style={{ left: m.startX, width: m.width }}
                    >
                      {m.month}
                    </div>
                  ))}
                </div>
              )}

              {/* Day headers */}
              <div className={`flex ${viewMode !== 'DAY' ? 'mt-5' : ''}`}>
                {dates.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = d.toDateString() === today.toDateString();
                  return (
                    <div
                      key={i}
                      className={`border-r border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-xs ${isWeekend ? 'bg-slate-100 dark:bg-slate-800/50' : ''} ${isToday ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                      style={{ width: DAY_WIDTH, height: viewMode === 'DAY' ? 40 : 25 }}
                    >
                      {viewMode === 'DAY' && (
                        <>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{d.getDate()}</span>
                          <span className="text-slate-400">{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                        </>
                      )}
                      {viewMode === 'WEEK' && (
                        <span className={`font-medium ${isToday ? 'text-primary-600' : 'text-slate-500 dark:text-slate-400'}`}>{d.getDate()}</span>
                      )}
                      {(viewMode === 'MONTH' || viewMode === 'QUARTER') && d.getDate() === 1 && (
                        <span className="text-slate-500 dark:text-slate-400">{d.getDate()}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Body */}
        <div className="flex-1 overflow-auto">
          <div className="flex relative">
            {/* Sidebar */}
            <div className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 sticky left-0">
              {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => {
                const phaseColor = PHASE_COLORS[phase] || PHASE_COLORS['Site Work'];
                const isCollapsed = collapsedPhases.has(phase);

                return (
                  <React.Fragment key={phase}>
                    {/* Phase Header */}
                    <div
                      className={`h-[${ROW_HEIGHT}px] flex items-center gap-2 px-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700 ${phaseColor.bg}`}
                      onClick={() => togglePhaseCollapse(phase)}
                      style={{ height: ROW_HEIGHT }}
                    >
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                      <span className={`font-semibold text-sm ${phaseColor.text}`}>{phase}</span>
                      <span className="text-xs text-slate-500 ml-auto">({phaseTasks.length})</span>
                    </div>

                    {/* Tasks in Phase */}
                    {!isCollapsed && phaseTasks.map((task) => {
                      const statusConfig = STATUS_CONFIG[task.status];
                      const isSelected = selectedTask?.id === task.id;

                      return (
                        <div
                          key={task.id}
                          className={`flex items-center gap-2 px-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${isSelected ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                          style={{ height: ROW_HEIGHT }}
                          onClick={() => setSelectedTask(task)}
                        >
                          {/* Milestone/Task Icon */}
                          {task.isMilestone ? (
                            <Diamond size={14} className="text-purple-500 shrink-0" />
                          ) : (
                            <div className={`w-3 h-3 rounded-sm ${phaseColor.bg} ${phaseColor.border} border shrink-0`}></div>
                          )}

                          {/* Task Name */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`font-medium text-sm truncate ${task.isOnCriticalPath ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {task.name}
                              </span>
                              {task.isOnCriticalPath && showCriticalPath && (
                                <Flag size={10} className="text-red-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className={statusConfig.color}>{statusConfig.icon}</span>
                              {!task.isMilestone && (
                                <>
                                  <span>{task.durationDays}d</span>
                                  <span className="flex items-center gap-0.5">
                                    <Users size={10} />
                                    {task.assignedCrew}/{task.requiredCrew}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          {!task.isMilestone && (
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 w-10 text-right">
                              {task.progress}%
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Empty rows for visual fill */}
              {Array.from({ length: Math.max(0, 8 - visibleTaskCount) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ height: ROW_HEIGHT }} className="border-b border-slate-100 dark:border-slate-700"></div>
              ))}
            </div>

            {/* Chart Area */}
            <div className="relative overflow-x-auto" style={{ width: daysToShow * DAY_WIDTH }}>
              {/* Grid Background */}
              <div className="absolute inset-0 flex pointer-events-none">
                {dates.map((d, i) => {
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={`border-r border-slate-100 dark:border-slate-700/50 h-full ${isWeekend ? 'bg-slate-50 dark:bg-slate-800/30' : ''}`}
                      style={{ width: DAY_WIDTH }}
                    ></div>
                  );
                })}
              </div>

              {/* Today Marker */}
              {todayX >= 0 && todayX <= daysToShow * DAY_WIDTH && (
                <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: todayX }}>
                  <div className="absolute -top-0 -left-6 bg-primary-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">TODAY</div>
                  <div className="w-0.5 h-full bg-primary-500"></div>
                </div>
              )}

              {/* SVG for Dependency Lines */}
              <svg
                ref={svgRef}
                className="absolute inset-0 pointer-events-none z-10"
                style={{ width: daysToShow * DAY_WIDTH, height: visibleTaskCount * ROW_HEIGHT + 200 }}
              >
                {renderDependencyLines()}
              </svg>

              {/* Task Bars */}
              <div className="relative">
                {Object.entries(tasksByPhase).map(([phase, phaseTasks]) => {
                  const isCollapsed = collapsedPhases.has(phase);
                  const phaseColor = PHASE_COLORS[phase] || PHASE_COLORS['Site Work'];

                  return (
                    <React.Fragment key={phase}>
                      {/* Phase Row (empty) */}
                      <div style={{ height: ROW_HEIGHT }} className="border-b border-slate-100 dark:border-slate-700">
                        {/* Phase summary bar could go here */}
                      </div>

                      {/* Task Bars */}
                      {!isCollapsed && phaseTasks.map((task) => {
                        const x = getX(task.startDate);
                        const w = task.durationDays * DAY_WIDTH;
                        const isOverBudget = task.budget > 0 && (task.spent / task.budget) > (task.progress / 100);
                        const isSelected = selectedTask?.id === task.id;

                        if (task.isMilestone) {
                          // Render milestone as diamond
                          return (
                            <div key={task.id} style={{ height: ROW_HEIGHT }} className="relative border-b border-transparent">
                              <div
                                className={`absolute top-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-110' : ''}`}
                                style={{ left: x - 8 }}
                                onClick={() => setSelectedTask(task)}
                              >
                                <div className={`w-4 h-4 rotate-45 ${task.status === 'COMPLETED' ? 'bg-green-500' : task.isOnCriticalPath ? 'bg-red-500' : 'bg-purple-500'} border-2 border-white dark:border-slate-800 shadow-md`}></div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={task.id} style={{ height: ROW_HEIGHT }} className="relative border-b border-transparent">
                            <div
                              className={`absolute top-2 rounded-md shadow-sm cursor-pointer hover:brightness-105 transition-all group overflow-hidden ${isSelected ? 'ring-2 ring-primary-500' : ''} ${task.isOnCriticalPath && showCriticalPath ? 'ring-1 ring-red-400' : ''}`}
                              style={{
                                left: x,
                                width: Math.max(w, 20),
                                height: ROW_HEIGHT - 16,
                              }}
                              onClick={() => setSelectedTask(task)}
                            >
                              {/* Background */}
                              <div className={`absolute inset-0 ${phaseColor.bg} ${phaseColor.border} border`}></div>

                              {/* Progress Fill */}
                              <div
                                className={`absolute inset-y-0 left-0 ${task.status === 'COMPLETED' ? 'bg-green-500' : task.status === 'DELAYED' ? 'bg-red-400' : 'bg-secondary-500'} opacity-80`}
                                style={{ width: `${task.progress}%` }}
                              >
                                {/* Striped Pattern */}
                                <div className="absolute inset-0 opacity-20" style={{
                                  backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)'
                                }}></div>
                              </div>

                              {/* Task Label (if wide enough) */}
                              {w > 60 && (
                                <div className="absolute inset-0 flex items-center px-2 z-10">
                                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate drop-shadow-sm">
                                    {task.name}
                                  </span>
                                </div>
                              )}

                              {/* Budget Health Strip */}
                              <div className={`absolute bottom-0 left-0 right-0 h-1 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}></div>

                              {/* Tooltip */}
                              <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                                <div className="font-semibold mb-1">{task.name}</div>
                                <div className="flex items-center gap-3 text-slate-300">
                                  <span>{task.progress}% complete</span>
                                  <span>${task.spent.toLocaleString()} spent</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-300">
                                  <span>{task.durationDays} days</span>
                                  {task.slack !== undefined && task.slack > 0 && <span>{task.slack}d float</span>}
                                </div>
                              </div>
                            </div>

                            {/* Crew Warning */}
                            {task.assignedCrew < task.requiredCrew && task.status !== 'COMPLETED' && (
                              <div
                                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-sm z-30 animate-pulse"
                                style={{ left: x + w + 4 }}
                                title={`Needs ${task.requiredCrew - task.assignedCrew} more crew`}
                              >
                                <Users size={10} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Empty rows */}
                {Array.from({ length: Math.max(0, 8 - visibleTaskCount) }).map((_, i) => (
                  <div key={`empty-chart-${i}`} style={{ height: ROW_HEIGHT }} className="border-b border-slate-100 dark:border-slate-700"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white">Task Details</h3>
            <button
              onClick={() => setSelectedTask(null)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            >
              <X size={18} className="text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Task Name & Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                {selectedTask.isMilestone && <Diamond size={16} className="text-purple-500" />}
                <h4 className="font-semibold text-lg text-slate-900 dark:text-white">{selectedTask.name}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_CONFIG[selectedTask.priority].color}`}>
                  {selectedTask.priority}
                </span>
                <span className={`flex items-center gap-1 text-sm ${STATUS_CONFIG[selectedTask.status].color}`}>
                  {STATUS_CONFIG[selectedTask.status].icon}
                  {STATUS_CONFIG[selectedTask.status].label}
                </span>
                {selectedTask.isOnCriticalPath && (
                  <span className="flex items-center gap-1 text-xs text-red-500">
                    <Flag size={12} /> Critical Path
                  </span>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">Start Date</div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {new Date(selectedTask.startDate).toLocaleDateString()}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <div className="text-xs text-slate-500 mb-1">End Date</div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {new Date(new Date(selectedTask.startDate).setDate(new Date(selectedTask.startDate).getDate() + selectedTask.durationDays)).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Progress */}
            {!selectedTask.isMilestone && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="font-medium text-slate-900 dark:text-white">{selectedTask.progress}%</span>
                </div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${selectedTask.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary-500'}`}
                    style={{ width: `${selectedTask.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Budget */}
            {!selectedTask.isMilestone && selectedTask.budget > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-slate-400">Budget</span>
                  <span className={`font-medium ${selectedTask.spent > selectedTask.budget ? 'text-red-500' : 'text-green-500'}`}>
                    ${selectedTask.spent.toLocaleString()} / ${selectedTask.budget.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${selectedTask.spent > selectedTask.budget ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min((selectedTask.spent / selectedTask.budget) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Crew */}
            {!selectedTask.isMilestone && selectedTask.requiredCrew > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Crew Assignment</span>
                  <span className={`text-sm font-medium ${selectedTask.assignedCrew < selectedTask.requiredCrew ? 'text-amber-500' : 'text-green-500'}`}>
                    {selectedTask.assignedCrew} / {selectedTask.requiredCrew} workers
                  </span>
                </div>
                {selectedTask.assignedCrew < selectedTask.requiredCrew && (
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Needs {selectedTask.requiredCrew - selectedTask.assignedCrew} more workers
                  </div>
                )}
              </div>
            )}

            {/* Dependencies */}
            {selectedTask.predecessors && selectedTask.predecessors.length > 0 && (
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Dependencies</div>
                <div className="space-y-1">
                  {selectedTask.predecessors.map(pred => {
                    const predTask = tasks.find(t => t.id === pred.taskId);
                    return predTask ? (
                      <div key={pred.taskId} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded px-2 py-1">
                        <ArrowRight size={12} />
                        <span>{predTask.name}</span>
                        <span className="text-xs text-slate-400">({pred.type}{pred.lagDays ? ` +${pred.lagDays}d` : ''})</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* Float/Slack */}
            {selectedTask.slack !== undefined && (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Float (Slack)</span>
                  <span className={`text-sm font-medium ${selectedTask.slack === 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {selectedTask.slack} days
                  </span>
                </div>
                {selectedTask.slack === 0 && (
                  <div className="mt-1 text-xs text-red-500">No flexibility - on critical path</div>
                )}
              </div>
            )}

            {/* Phase */}
            {selectedTask.phase && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Phase:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${PHASE_COLORS[selectedTask.phase]?.bg} ${PHASE_COLORS[selectedTask.phase]?.text}`}>
                  {selectedTask.phase}
                </span>
              </div>
            )}

            {/* Notes */}
            {selectedTask.notes && (
              <div>
                <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</div>
                <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded p-2">
                  {selectedTask.notes}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <button
              onClick={() => setEditingTask(selectedTask)}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium"
            >
              <Edit3 size={14} />
              Edit Task
            </button>
            <button
              onClick={() => handleDeleteTask(selectedTask.id)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {(showAddModal || editingTask) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowAddModal(false); setEditingTask(null); }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h2>
              <button onClick={() => { setShowAddModal(false); setEditingTask(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Task Name *</label>
                <input
                  type="text"
                  value={editingTask ? editingTask.name : newTask.name}
                  onChange={(e) => editingTask ? setEditingTask({ ...editingTask, name: e.target.value }) : setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Install HVAC Ductwork"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              {/* Milestone Toggle */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTask ? editingTask.isMilestone : newTask.isMilestone}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, isMilestone: e.target.checked }) : setNewTask(prev => ({ ...prev, isMilestone: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">This is a milestone</span>
                </label>
                <Diamond size={14} className="text-purple-500" />
              </div>

              {/* Phase & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phase</label>
                  <select
                    value={editingTask ? editingTask.phase || '' : newTask.phase}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, phase: e.target.value }) : setNewTask(prev => ({ ...prev, phase: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {Object.keys(PHASE_COLORS).map(phase => (
                      <option key={phase} value={phase}>{phase}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                  <select
                    value={editingTask ? editingTask.priority : newTask.priority}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority }) : setNewTask(prev => ({ ...prev, priority: e.target.value as TaskPriority }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date *</label>
                  <input
                    type="date"
                    value={editingTask ? editingTask.startDate : newTask.startDate}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, startDate: e.target.value }) : setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={editingTask ? editingTask.durationDays : newTask.durationDays}
                    onChange={(e) => editingTask ? setEditingTask({ ...editingTask, durationDays: parseInt(e.target.value) || 1 }) : setNewTask(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 1 }))}
                    min="1"
                    disabled={(editingTask?.isMilestone) || newTask.isMilestone}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Status (edit only) */}
              {editingTask && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                  <select
                    value={editingTask.status}
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as ScheduleTaskStatus })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Progress (edit only) */}
              {editingTask && !editingTask.isMilestone && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Progress: {editingTask.progress}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editingTask.progress}
                    onChange={(e) => setEditingTask({ ...editingTask, progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              {/* Crew & Budget */}
              {!((editingTask?.isMilestone) || newTask.isMilestone) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Required Crew</label>
                    <input
                      type="number"
                      value={editingTask ? editingTask.requiredCrew : newTask.requiredCrew}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, requiredCrew: parseInt(e.target.value) || 0 }) : setNewTask(prev => ({ ...prev, requiredCrew: parseInt(e.target.value) || 0 }))}
                      min="0"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Budget ($)</label>
                    <input
                      type="number"
                      value={editingTask ? editingTask.budget : newTask.budget}
                      onChange={(e) => editingTask ? setEditingTask({ ...editingTask, budget: parseInt(e.target.value) || 0 }) : setNewTask(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                      min="0"
                      step="1000"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Assigned Crew (edit only) */}
              {editingTask && !editingTask.isMilestone && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assigned Crew</label>
                  <input
                    type="number"
                    value={editingTask.assignedCrew}
                    onChange={(e) => setEditingTask({ ...editingTask, assignedCrew: parseInt(e.target.value) || 0 })}
                    min="0"
                    max={editingTask.requiredCrew}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              )}

              {/* Dependencies */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Predecessors</label>
                <select
                  multiple
                  value={editingTask ? editingTask.predecessors?.map(p => p.taskId) || [] : newTask.predecessors}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                    if (editingTask) {
                      setEditingTask({ ...editingTask, predecessors: selected.map(id => ({ taskId: id, type: 'FS' as const, lagDays: 0 })) });
                    } else {
                      setNewTask(prev => ({ ...prev, predecessors: selected }));
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none h-32"
                >
                  {tasks.filter(t => t.id !== editingTask?.id).map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => { setShowAddModal(false); setEditingTask(null); }}
                  className="flex-1 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editingTask ? handleUpdateTask(editingTask) : handleAddTask()}
                  disabled={!(editingTask?.name?.trim() || newTask.name.trim())}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-bold"
                >
                  {editingTask ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
