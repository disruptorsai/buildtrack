import React, { useState } from 'react';
import { Truck, ShieldAlert, FileText, CheckSquare, Lock, X, Mail, Download, Eye } from 'lucide-react';
import { CURRENT_USER } from '../constants';

// DVIR Report Data
const DVIR_REPORT = {
  date: new Date().toLocaleDateString(),
  time: '06:45 AM',
  truck: { id: '#402', model: 'Ford F-450', status: 'Pass' },
  trailer: { id: '#T-10', type: 'Flatbed', status: 'Pass' },
  items: [
    { name: 'Brakes', status: 'OK' },
    { name: 'Lights', status: 'OK' },
    { name: 'Tires', status: 'OK' },
    { name: 'Mirrors', status: 'OK' },
    { name: 'Horn', status: 'OK' },
    { name: 'Windshield', status: 'OK' },
    { name: 'Wipers', status: 'OK' },
    { name: 'Steering', status: 'OK' },
    { name: 'Coupling Devices', status: 'OK' },
    { name: 'Emergency Equipment', status: 'OK' },
  ],
  notes: 'No defects found. Vehicle ready for operation.',
  signature: CURRENT_USER.name,
};

function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export const DriverLog: React.FC = () => {
  const [mode, setMode] = useState<'DRIVER' | 'INSPECTION'>('DRIVER');
  const [status, setStatus] = useState('ON_DUTY');
  const [showDVIR, setShowDVIR] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailLogs = () => {
    setShowEmailModal(true);
  };

  const sendEmail = () => {
    // Simulate sending email
    setTimeout(() => {
      setEmailSent(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSent(false);
      }, 2000);
    }, 1500);
  };

  const downloadPDF = () => {
    // Create a simple text representation for download
    const logContent = `
DRIVER'S DAILY LOG
==================
Company: Acme Construction - North Salt Lake
USDOT #: 2847193
Date: ${new Date().toLocaleDateString()}
Driver: ${CURRENT_USER.name}
License: UT-284719-CDL

SUMMARY
-------
Distance Driven: 142 miles
Driving Hours: 4.5
On Duty Hours: 6.2

VEHICLE
-------
Unit ID: TRK-042
Defects Found: None

I certify that these entries are true and correct.
Signed: ${CURRENT_USER.name}
    `;

    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driver-log-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // DVIR Modal
  const DVIRModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDVIR(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pre-Trip Inspection Report</h2>
          <button onClick={() => setShowDVIR(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 dark:text-slate-400">Date</p>
              <p className="font-medium text-slate-900 dark:text-white">{DVIR_REPORT.date}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Time</p>
              <p className="font-medium text-slate-900 dark:text-white">{DVIR_REPORT.time}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Truck</p>
              <p className="font-medium text-slate-900 dark:text-white">{DVIR_REPORT.truck.id} - {DVIR_REPORT.truck.model}</p>
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400">Trailer</p>
              <p className="font-medium text-slate-900 dark:text-white">{DVIR_REPORT.trailer.id} - {DVIR_REPORT.trailer.type}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">Inspection Items</h3>
            <div className="grid grid-cols-2 gap-2">
              {DVIR_REPORT.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className="text-green-600 text-xs font-medium">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Notes</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{DVIR_REPORT.notes}</p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Certified by:</p>
            <p className="font-script text-2xl text-slate-900 dark:text-white">{DVIR_REPORT.signature}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Email Modal
  const EmailModal = () => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => !emailSent && setShowEmailModal(false)}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Logs</h2>
          {!emailSent && (
            <button onClick={() => setShowEmailModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <X size={20} className="text-slate-500" />
            </button>
          )}
        </div>
        <div className="p-4">
          {emailSent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} />
              </div>
              <p className="text-lg font-medium text-slate-900 dark:text-white">Logs Sent Successfully!</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Email sent to dispatch and safety department</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Send your driver logs to the following recipients:
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">dispatch@acmeconstruction.com</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">safety@acmeconstruction.com</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadPDF}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={sendEmail}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  <Mail size={18} />
                  Send Email
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

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

            {/* Grid Graph */}
            <div className="mb-8">
              <h3 className="font-bold mb-2 text-sm uppercase">24-Hour Grid</h3>
              <div className="h-32 border border-slate-300 bg-slate-50 relative grid grid-cols-24">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border-r border-slate-200 h-full text-[10px] text-slate-400 p-1">{i}</div>
                ))}
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

          <div className="max-w-4xl mx-auto mt-6 flex justify-center gap-4">
            <button
              onClick={downloadPDF}
              className="bg-slate-200 text-slate-800 px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-slate-300"
            >
              <Download size={20} /> Download PDF
            </button>
            <button
              onClick={handleEmailLogs}
              className="bg-primary-500 text-white px-8 py-4 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-primary-600"
            >
              <FileText size={20} /> Email / Transfer Logs
            </button>
          </div>
        </div>

        {showEmailModal && <EmailModal />}
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
          className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:hover:bg-red-900/30"
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

      {/* DVIR Checklist */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare size={18} className="text-primary-500" /> Pre-Trip Inspection
          </h3>
          <span className="text-xs font-mono bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">COMPLETE {DVIR_REPORT.time}</span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300 mb-2">
            <span>Truck: {DVIR_REPORT.truck.id} ({DVIR_REPORT.truck.model})</span>
            <span className="text-green-600 flex items-center gap-1"><Check size={14} /> {DVIR_REPORT.truck.status}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Trailer: {DVIR_REPORT.trailer.id} ({DVIR_REPORT.trailer.type})</span>
            <span className="text-green-600 flex items-center gap-1"><Check size={14} /> {DVIR_REPORT.trailer.status}</span>
          </div>
          <button
            onClick={() => setShowDVIR(true)}
            className="w-full mt-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <Eye size={16} /> View Full Report
          </button>
        </div>
      </div>

      {showDVIR && <DVIRModal />}
      {showEmailModal && <EmailModal />}
    </div>
  );
};
