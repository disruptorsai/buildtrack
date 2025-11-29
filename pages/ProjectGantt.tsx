import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Users, DollarSign, Calendar, X } from 'lucide-react';
import { TASKS, PROJECTS } from '../constants';
import { Task } from '../types';

export const ProjectGantt: React.FC = () => {
  const [zoom, setZoom] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    name: '',
    startDate: '2024-05-15',
    durationDays: 5,
    requiredCrew: 4,
    budget: 10000
  });
  
  // Simple layout calculations for demo
  const DAY_WIDTH = zoom === 'WEEK' ? 60 : 20;
  const HEADER_HEIGHT = 40;
  const ROW_HEIGHT = 60;
  const START_DATE = new Date('2024-05-01');
  const DAYS_TO_SHOW = 30;

  const getX = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffTime = Math.abs(d.getTime() - START_DATE.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays * DAY_WIDTH;
  };

  const dates = Array.from({ length: DAYS_TO_SHOW }, (_, i) => {
    const d = new Date(START_DATE);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handleAddTask = () => {
    if (!newTask.name.trim()) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      projectId: 'p1',
      name: newTask.name,
      startDate: newTask.startDate,
      durationDays: newTask.durationDays,
      progress: 0,
      assignedCrew: 0,
      requiredCrew: newTask.requiredCrew,
      budget: newTask.budget,
      spent: 0
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      name: '',
      startDate: '2024-05-15',
      durationDays: 5,
      requiredCrew: 4,
      budget: 10000
    });
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="text-primary-500" />
          Project Schedule: Eaglewood Retail
        </h2>
        <div className="flex bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-1">
          <button 
            onClick={() => setZoom('WEEK')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${zoom === 'WEEK' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Week View
          </button>
          <button 
            onClick={() => setZoom('MONTH')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${zoom === 'MONTH' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Month View
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
        {/* Timeline Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900">
          <div className="w-64 shrink-0 p-4 border-r border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Task Name</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 p-1 rounded"
              title="Add Task"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex" style={{ width: DAYS_TO_SHOW * DAY_WIDTH }}>
              {dates.map((d, i) => (
                <div 
                  key={i} 
                  className={`border-r border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-xs text-slate-500 dark:text-slate-400 uppercase`}
                  style={{ width: DAY_WIDTH, height: HEADER_HEIGHT }}
                >
                  <span className="font-bold">{d.getDate()}</span>
                  {zoom === 'WEEK' && <span>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gantt Body */}
        <div className="flex-1 overflow-auto">
          <div className="flex relative">
            {/* Sidebar Columns */}
            <div className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 sticky left-0">
              {tasks.map((task) => (
                <div key={task.id} className="h-[60px] border-b border-slate-100 dark:border-slate-700 px-4 flex flex-col justify-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{task.name}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                     <span className="flex items-center gap-1"><Users size={12} /> {task.assignedCrew}/{task.requiredCrew}</span>
                     <span className={`flex items-center gap-1 ${task.spent > task.budget ? 'text-red-500' : 'text-green-500'}`}>
                       <DollarSign size={12} /> {Math.round((task.spent/task.budget)*100)}%
                     </span>
                  </div>
                </div>
              ))}
              {/* Add empty rows for visual fill */}
              {Array.from({length: 5}).map((_, i) => (
                 <div key={i} className="h-[60px] border-b border-slate-100 dark:border-slate-700"></div>
              ))}
            </div>

            {/* Chart Area */}
            <div className="relative" style={{ width: DAYS_TO_SHOW * DAY_WIDTH }}>
              {/* Vertical Grid Lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {dates.map((_, i) => (
                  <div key={i} className="border-r border-slate-100 dark:border-slate-700/50 h-full" style={{ width: DAY_WIDTH }}></div>
                ))}
              </div>
              
              {/* Today Marker */}
              <div className="absolute top-0 bottom-0 border-l-2 border-red-500 z-20" style={{ left: getX('2024-05-15') }}>
                 <div className="bg-red-500 text-white text-[10px] px-1 py-0.5 rounded absolute -top-0 -left-6">TODAY</div>
              </div>

              {/* Task Bars */}
              <div className="relative pt-0">
                {tasks.map((task, i) => {
                  const x = getX(task.startDate);
                  const w = task.durationDays * DAY_WIDTH;
                  const isOverBudget = (task.spent / task.budget) > (task.progress / 100);
                  
                  return (
                    <div key={task.id} className="h-[60px] relative w-full border-b border-transparent">
                      <div 
                        className="absolute top-3 h-8 rounded-md bg-secondary-200 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-600 shadow-sm cursor-pointer hover:brightness-110 transition-all group overflow-hidden"
                        style={{ left: x, width: w }}
                      >
                        {/* Progress Fill */}
                        <div 
                          className="h-full bg-secondary-500 relative"
                          style={{ width: `${task.progress}%` }}
                        >
                          {/* Striped Pattern Overlay */}
                          <div className="absolute inset-0 opacity-20 bg-white/10"></div>
                        </div>

                        {/* Budget Health Strip */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}></div>

                        {/* Tooltip on Hover */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                          {task.progress}% Complete • ${task.spent.toLocaleString()} spent
                        </div>
                      </div>

                      {/* Warnings */}
                      {task.assignedCrew < task.requiredCrew && (
                        <div className="absolute top-4 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-sm z-30 animate-pulse" style={{ left: x + w + 5 }}>
                          <Users size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Task Name</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Install HVAC Ductwork"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Duration (days)</label>
                  <input
                    type="number"
                    value={newTask.durationDays}
                    onChange={(e) => setNewTask(prev => ({ ...prev, durationDays: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Required Crew</label>
                  <input
                    type="number"
                    value={newTask.requiredCrew}
                    onChange={(e) => setNewTask(prev => ({ ...prev, requiredCrew: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={newTask.budget}
                    onChange={(e) => setNewTask(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    min="0"
                    step="1000"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.name.trim()}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-bold"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};