import React, { useState } from 'react';
import { Plus, FileText, Camera, Send, ChevronRight } from 'lucide-react';
import { FORM_TEMPLATES, CURRENT_USER } from '../constants';

export const Forms: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  if (activeForm) {
    const template = FORM_TEMPLATES.find(f => f.id === activeForm);
    if (!template) return null;

    return (
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-secondary-500 p-4 text-white flex items-center gap-3">
          <button onClick={() => setActiveForm(null)} className="hover:bg-white/10 p-1 rounded">
             <ChevronRight className="rotate-180" />
          </button>
          <h2 className="font-bold text-lg">{template.title}</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {template.fields.map(field => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'text' && (
                <input type="text" className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none transition-all" />
              )}
              
              {field.type === 'yesno' && (
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={field.id} className="w-4 h-4 text-primary-500" /> 
                    <span className="text-slate-700 dark:text-slate-300">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={field.id} className="w-4 h-4 text-primary-500" /> 
                    <span className="text-slate-700 dark:text-slate-300">No</span>
                  </label>
                </div>
              )}

              {field.type === 'photo' && (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer">
                   <Camera size={24} className="mb-2" />
                   <span className="text-sm">Tap to capture or upload</span>
                </div>
              )}

              {field.type === 'signature' && (
                <div className="h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg flex items-center justify-center text-slate-400 italic">
                  Sign Here
                </div>
              )}
            </div>
          ))}

          <div className="pt-4">
             <button onClick={() => setActiveForm(null)} className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                <Send size={18} /> Submit Form
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Field Forms</h2>
          <button className="bg-secondary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-secondary-600">
             <Plus size={16} /> Create New
          </button>
       </div>

       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FORM_TEMPLATES.map(form => (
             <div 
               key={form.id} 
               onClick={() => setActiveForm(form.id)}
               className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-primary-500 transition-colors group"
             >
                <div className="w-10 h-10 bg-primary-50 dark:bg-slate-700 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                   <FileText size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">{form.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{form.fields.length} fields • Last used today</p>
             </div>
          ))}
       </div>

       <div className="mt-8">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Recent Submissions</h3>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
             {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">DS</div>
                      <div>
                         <p className="text-sm font-medium text-slate-900 dark:text-white">Daily Safety Inspection</p>
                         <p className="text-xs text-slate-500">Submitted by {CURRENT_USER.name} • 2 hours ago</p>
                      </div>
                   </div>
                   <button className="text-secondary-600 hover:underline text-sm font-medium">View PDF</button>
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};