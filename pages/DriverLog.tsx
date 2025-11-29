import React, { useState } from 'react';
import { Truck, ShieldAlert, FileText, CheckSquare, AlertTriangle, Lock } from 'lucide-react';
import { CURRENT_USER } from '../constants';

export const DriverLog: React.FC = () => {
  const [mode, setMode] = useState<'DRIVER' | 'INSPECTION'>('DRIVER');
  const [status, setStatus] = useState('ON_DUTY');

  // Roadside Inspection Mode View
  if (mode === 'INSPECTION') {
    return (
      <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col">
        <div className="bg-slate-900 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <ShieldAlert size={32} className="text-primary-500" />
                <div>
                   <h1 className="text-xl font-bold uppercase tracking-wider">DOT Inspection Mode</h1>
                   <p className="text-xs text-slate-400">FMCSA Compliant View • 49 CFR § 395.8</p>
                </div>
             </div>
             <button 
               onClick={() => setMode('DRIVER')}
               className="bg-slate-800 px-4 py-2 rounded text-sm text-slate-300 border border-slate-700 flex items-center gap-2"
             >
               <Lock size={14} /> Exit Mode
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 bg-white text-slate-900">
           <div className="max-w-4xl mx-auto border border-black p-8 font-mono">
              <div className="flex justify-between border-b-2 border-black pb-4 mb-6">
                 <div>
                    <h2 className="text-2xl font-bold mb-1">DRIVER'S DAILY LOG</h2>
                    <p>Acme Construction - North Salt Lake</p>
                    <p>USDOT #: 2847193</p>
                 </div>
                 <div className="text-right">
                    <p>Date: {new Date().toLocaleDateString()}</p>
                    <p>Driver: {CURRENT_USER.name}</p>
                    <p>Lic: UT-284719-CDL</p>
                 </div>
              </div>

              {/* Grid Graph Placeholder */}
              <div className="mb-8">
                 <h3 className="font-bold mb-2 text-sm uppercase">24-Hour Grid</h3>
                 <div className="h-32 border border-slate-300 bg-slate-50 relative grid grid-cols-24">
                    {Array.from({length: 24}).map((_, i) => (
                       <div key={i} className="border-r border-slate-200 h-full text-[10px] text-slate-400 p-1">{i}</div>
                    ))}
                    {/* SVG Line for Status would go here */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                       <path d="M0,80 L200,80 L200,40 L600,40 L600,80 L1000,80" fill="none" stroke="black" strokeWidth="2" />
                    </svg>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <h3 className="font-bold mb-2 uppercase border-b border-black">Summary</h3>
                    <div className="flex justify-between py-1 border-b border-slate-200"><span>Distance Driven:</span> <span>142 miles</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-200"><span>Driving Hrs:</span> <span>4.5</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-200"><span>On Duty Hrs:</span> <span>6.2</span></div>
                 </div>
                 <div>
                    <h3 className="font-bold mb-2 uppercase border-b border-black">Vehicle</h3>
                    <div className="flex justify-between py-1 border-b border-slate-200"><span>Unit ID:</span> <span>TRK-042</span></div>
                    <div className="flex justify-between py-1 border-b border-slate-200"><span>Defects Found:</span> <span>None</span></div>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t-2 border-black text-center">
                 <p className="text-xs italic">I certify that these entries are true and correct.</p>
                 <div className="font-script text-2xl mt-2">{CURRENT_USER.name}</div>
              </div>
           </div>

           <div className="max-w-4xl mx-auto mt-6 flex justify-center">
              <button className="bg-primary-500 text-white px-8 py-4 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-primary-600">
                 <FileText /> Email / Transfer Logs
              </button>
           </div>
        </div>
      </div>
    );
  }

  // Normal Driver View
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
         <h2 className="text-xl font-bold text-slate-900 dark:text-white">Driver's Log</h2>
         <button 
           onClick={() => setMode('INSPECTION')}
           className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-100"
         >
           <ShieldAlert size={16} /> Inspection Mode
         </button>
      </div>

      {/* HOS Clocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Drive Remaining', val: '06:30', color: 'text-green-600' },
           { label: 'Shift Remaining', val: '08:15', color: 'text-green-600' },
           { label: 'Cycle Remaining', val: '32:00', color: 'text-slate-600' },
           { label: 'Time Until Break', val: '03:45', color: 'text-amber-600' }
         ].map((clock, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
               <div className={`text-2xl font-bold font-mono ${clock.color}`}>{clock.val}</div>
               <div className="text-xs text-slate-500 uppercase mt-1">{clock.label}</div>
            </div>
         ))}
      </div>

      {/* Status Selector */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
         <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Current Status</h3>
         <div className="grid grid-cols-4 gap-3">
            {['OFF_DUTY', 'SLEEPER', 'DRIVING', 'ON_DUTY'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`py-4 rounded-lg font-bold text-sm md:text-base transition-all ${
                  status === s 
                    ? 'bg-secondary-500 text-white shadow-md scale-105' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
         </div>
         {status === 'DRIVING' && (
           <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg flex items-center gap-2 animate-pulse">
             <Truck size={16} />
             Driving detected via GPS (45 MPH)
           </div>
         )}
      </div>

      {/* DVIR Checklist Teaser */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
         <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare size={18} className="text-primary-500" /> Pre-Trip Inspection
            </h3>
            <span className="text-xs font-mono bg-green-100 text-green-800 px-2 py-1 rounded">COMPLETE 06:45 AM</span>
         </div>
         <div className="p-4">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 mb-2">
               <span>Truck: #402 (Ford F-450)</span>
               <span className="text-green-600 flex items-center gap-1"><Check size={14} /> Pass</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
               <span>Trailer: #T-10 (Flatbed)</span>
               <span className="text-green-600 flex items-center gap-1"><Check size={14} /> Pass</span>
            </div>
            <button className="w-full mt-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
               View Full Report
            </button>
         </div>
      </div>
    </div>
  );
};

function Check({ size }: {size: number}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg> }