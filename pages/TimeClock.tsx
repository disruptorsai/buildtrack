import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Camera, AlertOctagon, Check, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { PROJECTS } from '../constants';

type ClockState = 'OUT' | 'VERIFYING' | 'IN';

export const TimeClock: React.FC = () => {
  const [status, setStatus] = useState<ClockState>('OUT');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer for duration when clocked in
  useEffect(() => {
    let interval: any;
    if (status === 'IN') {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClockAction = () => {
    if (status === 'OUT') {
      setStatus('VERIFYING');
      // Simulate GPS Lock
      setTimeout(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setAccuracy(pos.coords.accuracy);
            setStatus('IN');
          },
          (err) => {
            console.error(err);
            // Fallback for demo if permission denied or desktop
            setLocation({ lat: 33.4484, lng: -112.0740 });
            setAccuracy(12);
            setStatus('IN');
          },
          { enableHighAccuracy: true }
        );
      }, 1500);
    } else {
      setStatus('OUT');
      setTimeElapsed(0);
      setLocation(null);
    }
  };

  return (
    <div className="max-w-md mx-auto h-full flex flex-col justify-center py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {status === 'IN' ? 'You are Clocked In' : 'Ready to Work?'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          {status === 'IN' ? 'Tracking time for project:' : 'Select a project and verify location.'}
        </p>
      </div>

      {/* Project Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Select Project / Cost Code
        </label>
        <select 
          disabled={status === 'IN'}
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-shadow disabled:opacity-60"
        >
          <option value="">-- Select Project --</option>
          {PROJECTS.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Main Button Container */}
      <div className="flex justify-center mb-8 relative">
        {/* Pulse Effect */}
        {status === 'VERIFYING' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-primary-500/20 rounded-full animate-ping"></div>
          </div>
        )}

        <button
          onClick={handleClockAction}
          disabled={status === 'VERIFYING' || (status === 'OUT' && !selectedProject)}
          className={clsx(
            "w-56 h-56 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 border-8 relative z-10",
            status === 'OUT' ? "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary-100 group" : 
            status === 'VERIFYING' ? "bg-slate-100 dark:bg-slate-800 border-primary-500 animate-pulse" :
            "bg-primary-500 border-primary-600"
          )}
        >
          {status === 'OUT' && (
            <>
              <Clock size={48} className="text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest">Clock In</span>
            </>
          )}
          
          {status === 'VERIFYING' && (
            <>
              <MapPin size={48} className="text-primary-500 mb-2 animate-bounce" />
              <span className="text-sm font-medium text-slate-500">Acquiring GPS...</span>
            </>
          )}

          {status === 'IN' && (
            <>
              <div className="text-4xl font-mono font-bold text-white mb-1 tracking-wider">
                {formatTime(timeElapsed)}
              </div>
              <span className="text-primary-100 font-medium uppercase text-sm tracking-widest">Clock Out</span>
            </>
          )}
        </button>
      </div>

      {/* Status Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <MapPin size={16} />
            <span>GPS Location</span>
          </div>
          {location ? (
             <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
               <ShieldCheck size={14} /> Verified (±{accuracy ? Math.round(accuracy) : 10}m)
             </span>
          ) : (
            <span className="text-slate-400 italic">Waiting for fix...</span>
          )}
        </div>
        
        {location && (
          <div className="text-xs text-slate-400 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded">
            {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-center">
          <button className="flex items-center gap-2 text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline">
            <Camera size={16} />
            Add Job Site Photo
          </button>
        </div>
      </div>
    </div>
  );
};