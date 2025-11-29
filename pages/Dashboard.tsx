import React, { useEffect, useState } from 'react';
import { MapPin, Clock, AlertTriangle, CheckCircle2, DollarSign, TrendingUp, Calendar, ArrowRight, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CURRENT_USER, NOTIFICATIONS, PROJECTS } from '../constants';
import { predictProjectRisks } from '../services/geminiService';

export const Dashboard: React.FC = () => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    // Simulate fetching an AI insight on mount
    setLoadingInsight(true);
    predictProjectRisks("Project Phoenix is 65% complete but running 10% over budget on steel materials. Crew availability is tight next week.")
      .then(res => {
        setInsight(res);
        setLoadingInsight(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Good Morning, {CURRENT_USER.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening on your sites today.
          </p>
        </div>
        <Link to="/time" className="inline-flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg shadow-primary-500/30 transition-all transform hover:scale-105 active:scale-95">
          <Clock size={20} />
          <span>Clock In Now</span>
        </Link>
      </div>

      {/* Critical Alerts Strip */}
      {NOTIFICATIONS.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {NOTIFICATIONS.map((note) => (
            <div key={note.id} className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${
              note.type === 'ALERT' ? 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-200' :
              note.type === 'INFO' ? 'bg-blue-50 border-blue-100 text-blue-900 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-200' :
              'bg-green-50 border-green-100 text-green-900 dark:bg-green-900/20 dark:border-green-900/50 dark:text-green-200'
            }`}>
              {note.type === 'ALERT' && <AlertTriangle className="shrink-0 mt-0.5" size={18} />}
              {note.type === 'INFO' && <Calendar className="shrink-0 mt-0.5" size={18} />}
              {note.type === 'SUCCESS' && <CheckCircle2 className="shrink-0 mt-0.5" size={18} />}
              <div>
                <p className="text-sm font-semibold">{note.message}</p>
                <p className="text-xs opacity-80 mt-1">{note.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Project Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Active Projects</h2>
              <Link to="/schedule" className="text-sm text-primary-600 dark:text-primary-400 font-medium hover:underline">View Schedule</Link>
            </div>
            
            <div className="space-y-6">
              {PROJECTS.filter(p => p.status === 'ACTIVE').map(project => (
                <div key={project.id} className="group">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary-500 transition-colors">{project.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <MapPin size={12} />
                        {project.location}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        project.progress > 50 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="relative h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-secondary-500 rounded-full transition-all duration-1000"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span>{project.progress}% Complete</span>
                    <span>Deadline: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight Card */}
          <div className="bg-secondary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-3 opacity-10">
                <TrendingUp size={120} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl">✨</span>
                  </div>
                  <h2 className="text-lg font-bold">Gemini Project Intelligence</h2>
                </div>
                {loadingInsight ? (
                   <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-4 bg-white/20 rounded w-1/2"></div>
                   </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: insight?.replace(/\n/g, '<br/>') || '' }} />
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Quick Stats & Activity */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Weekly Hours</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">34.5</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center">
                   <TrendingUp size={12} className="mr-1" /> On Track
                </div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Budget Health</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">92%</div>
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center">
                   <AlertTriangle size={12} className="mr-1" /> Tight
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <UserIcon size={14} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">
                      <span className="font-medium">Sarah Jenkins</span> uploaded a safety inspection for <span className="font-medium">Phoenix Medical</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center gap-1">
              View All Activity <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};