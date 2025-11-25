import React from 'react';
import { DollarSign, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { PROJECTS } from '../constants';

export const Financials: React.FC = () => {
  return (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job Costing Overview</h2>

       {/* Top Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <p className="text-sm text-slate-500 font-medium uppercase">Total Active Budget</p>
             <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">$3.7M</h3>
             <div className="flex items-center gap-1 text-green-600 text-sm mt-2">
                <TrendingUp size={14} /> +12% vs last quarter
             </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <p className="text-sm text-slate-500 font-medium uppercase">Current Burn Rate</p>
             <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">$42k<span className="text-lg text-slate-400 font-normal">/week</span></h3>
             <div className="flex items-center gap-1 text-amber-600 text-sm mt-2">
                <TrendingUp size={14} /> Slightly elevated
             </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
             <p className="text-sm text-slate-500 font-medium uppercase">At-Risk Profit</p>
             <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">$120k</h3>
             <div className="flex items-center gap-1 text-red-600 text-sm mt-2">
                <AlertCircle size={14} /> 2 projects over budget
             </div>
          </div>
       </div>

       {/* Project Cards */}
       <div className="grid gap-6">
          {PROJECTS.filter(p => p.status === 'ACTIVE').map(project => {
             const percentSpent = Math.round((project.spent / project.budget) * 100);
             const isOver = percentSpent > project.progress + 10; // Simple logic: if spend % is > progress % + 10% buffer
             
             return (
               <div key={project.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{project.name}</h3>
                        <p className="text-sm text-slate-500">{project.location}</p>
                     </div>
                     <div className="mt-4 md:mt-0 text-right">
                        <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                           ${project.spent.toLocaleString()} <span className="text-sm text-slate-400 font-sans font-normal">/ ${project.budget.toLocaleString()}</span>
                        </p>
                     </div>
                  </div>

                  {/* Budget Bar */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-sm font-medium">
                        <span className={isOver ? "text-red-600" : "text-green-600"}>
                           {percentSpent}% Budget Consumed
                        </span>
                        <span className="text-slate-500">{project.progress}% Work Complete</span>
                     </div>
                     <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                        {/* Work Progress Marker (Ghost bar) */}
                        <div 
                           className="absolute top-0 bottom-0 bg-slate-200 dark:bg-slate-600 w-1 z-10" 
                           style={{ left: `${project.progress}%` }}
                           title="Physical Completion"
                        ></div>
                        
                        {/* Spend Bar */}
                        <div 
                           className={`h-full rounded-full transition-all duration-1000 ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
                           style={{ width: `${percentSpent}%` }}
                        ></div>
                     </div>
                     {isOver && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                           <AlertCircle size={12} /> Spending is outpacing progress. Investigate labor codes.
                        </p>
                     )}
                  </div>
               </div>
             );
          })}
       </div>
    </div>
  );
};