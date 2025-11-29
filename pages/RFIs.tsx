
import React, { useState } from 'react';
import { FileQuestion, Plus, Sparkles, Send, ChevronRight, Clock, AlertTriangle, DollarSign, X, Edit2, Trash2 } from 'lucide-react';
import { RFIS, PROJECTS } from '../constants';
import { generateRFI } from '../services/geminiService';
import { RFI } from '../types';

export const RFIs: React.FC = () => {
  const [rfis, setRfis] = useState<RFI[]>(RFIS);
  const [isDrafting, setIsDrafting] = useState(false);
  const [selectedRfiId, setSelectedRfiId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Draft Form State
  const [roughNotes, setRoughNotes] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState<Partial<RFI> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const selectedRfi = rfis.find(r => r.id === selectedRfiId);

  const handleGenerate = async () => {
     setIsGenerating(true);
     const result = await generateRFI(roughNotes, "Project: Eaglewood Retail Center, North Salt Lake UT. Current Phase: Structural Steel & Concrete.");
     setGeneratedDraft({
        subject: result.subject,
        question: result.question,
        impact: result.impact, // Flattening impact for simple display in demo
        projectId: 'p1',
        status: 'DRAFT'
     });
     setIsGenerating(false);
  };

  const handleSaveDraft = () => {
     if (generatedDraft) {
        const newRfi: RFI = {
           id: `rfi-${Date.now()}`,
           number: `00${rfis.length + 5}`,
           subject: generatedDraft.subject || 'New RFI',
           question: generatedDraft.question || '',
           status: 'OPEN',
           assignedTo: 'Architect',
           dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
           projectId: 'p1',
           costImpact: 'TBD',
           scheduleImpact: 'TBD'
        };
        setRfis([...rfis, newRfi]);
        setIsDrafting(false);
        setRoughNotes('');
        setGeneratedDraft(null);
     }
  };

  const handleUpdateRfi = (field: keyof RFI, value: string) => {
    if (!selectedRfiId) return;
    setRfis(prev => prev.map(rfi =>
      rfi.id === selectedRfiId ? { ...rfi, [field]: value } : rfi
    ));
  };

  const handleDeleteRfi = () => {
    if (!selectedRfiId) return;
    setRfis(prev => prev.filter(rfi => rfi.id !== selectedRfiId));
    setSelectedRfiId(null);
    setIsEditing(false);
  };

  const handleCloseRfi = () => {
    if (!selectedRfiId) return;
    setRfis(prev => prev.map(rfi =>
      rfi.id === selectedRfiId ? { ...rfi, status: 'CLOSED' } : rfi
    ));
  };

  const handleReopenRfi = () => {
    if (!selectedRfiId) return;
    setRfis(prev => prev.map(rfi =>
      rfi.id === selectedRfiId ? { ...rfi, status: 'OPEN' } : rfi
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white">RFIs & Submittals</h2>
           <p className="text-slate-500">Manage formal requests. Use AI to draft contract-safe language.</p>
        </div>
        <button 
           onClick={() => setIsDrafting(true)}
           className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-600 shadow-lg"
        >
           <Plus size={16} /> Draft New RFI
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
         {/* RFI List */}
         <div className="lg:col-span-2 space-y-4">
            {rfis.map(rfi => (
               <div
                 key={rfi.id}
                 onClick={() => { setSelectedRfiId(rfi.id); setIsEditing(false); }}
                 className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border cursor-pointer transition-all ${
                   selectedRfiId === rfi.id
                     ? 'border-primary-500 ring-2 ring-primary-500/20'
                     : 'border-slate-200 dark:border-slate-700 hover:border-primary-200'
                 }`}
               >
                  <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-slate-400">#{rfi.number}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                           rfi.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                           rfi.status === 'DRAFT' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                           'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>{rfi.status}</span>
                     </div>
                     <span className="text-xs text-slate-400">Due: {rfi.dueDate}</span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{rfi.subject}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">{rfi.question}</p>

                  <div className="flex gap-4 text-xs">
                     <div className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                        <DollarSign size={12} /> {rfi.costImpact || 'None'}
                     </div>
                     <div className="flex items-center gap-1 text-secondary-600 bg-secondary-50 dark:bg-secondary-900/20 px-2 py-1 rounded">
                        <Clock size={12} /> {rfi.scheduleImpact || 'None'}
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Draft / AI Panel / RFI Detail */}
         <div className="lg:col-span-1">
            {selectedRfi ? (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-6">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                     <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-500">#{selectedRfi.number}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                           selectedRfi.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                           selectedRfi.status === 'DRAFT' ? 'bg-slate-100 text-slate-600' :
                           'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>{selectedRfi.status}</span>
                     </div>
                     <div className="flex gap-1">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className={`p-1 rounded ${isEditing ? 'bg-primary-100 text-primary-600' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={handleDeleteRfi}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedRfiId(null); setIsEditing(false); }}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                        >
                          <X size={16} />
                        </button>
                     </div>
                  </div>

                  <div className="p-4 space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Subject</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={selectedRfi.subject}
                            onChange={(e) => handleUpdateRfi('subject', e.target.value)}
                            className="w-full font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 mt-1 focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        ) : (
                          <p className="font-bold text-slate-900 dark:text-white mt-1">{selectedRfi.subject}</p>
                        )}
                     </div>

                     <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Question</label>
                        {isEditing ? (
                          <textarea
                            value={selectedRfi.question}
                            onChange={(e) => handleUpdateRfi('question', e.target.value)}
                            className="w-full h-32 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 mt-1 focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        ) : (
                          <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{selectedRfi.question}</p>
                        )}
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-400 uppercase">Assigned To</label>
                           {isEditing ? (
                             <select
                               value={selectedRfi.assignedTo}
                               onChange={(e) => handleUpdateRfi('assignedTo', e.target.value)}
                               className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 mt-1"
                             >
                               <option value="Architect">Architect</option>
                               <option value="Engineer">Engineer</option>
                               <option value="Owner">Owner</option>
                               <option value="Contractor">Contractor</option>
                             </select>
                           ) : (
                             <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedRfi.assignedTo}</p>
                           )}
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-400 uppercase">Due Date</label>
                           {isEditing ? (
                             <input
                               type="date"
                               value={selectedRfi.dueDate}
                               onChange={(e) => handleUpdateRfi('dueDate', e.target.value)}
                               className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 mt-1"
                             />
                           ) : (
                             <p className="text-sm text-slate-900 dark:text-white mt-1">{selectedRfi.dueDate}</p>
                           )}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-bold text-slate-400 uppercase">Cost Impact</label>
                           {isEditing ? (
                             <input
                               type="text"
                               value={selectedRfi.costImpact || ''}
                               onChange={(e) => handleUpdateRfi('costImpact', e.target.value)}
                               placeholder="e.g., $5,000"
                               className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 mt-1"
                             />
                           ) : (
                             <p className="text-sm text-amber-600 mt-1">{selectedRfi.costImpact || 'None'}</p>
                           )}
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-400 uppercase">Schedule Impact</label>
                           {isEditing ? (
                             <input
                               type="text"
                               value={selectedRfi.scheduleImpact || ''}
                               onChange={(e) => handleUpdateRfi('scheduleImpact', e.target.value)}
                               placeholder="e.g., 3 days"
                               className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 mt-1"
                             />
                           ) : (
                             <p className="text-sm text-secondary-600 mt-1">{selectedRfi.scheduleImpact || 'None'}</p>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                     {selectedRfi.status === 'CLOSED' ? (
                       <button
                         onClick={handleReopenRfi}
                         className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg font-bold text-sm"
                       >
                         Reopen RFI
                       </button>
                     ) : (
                       <button
                         onClick={handleCloseRfi}
                         className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm"
                       >
                         Close RFI
                       </button>
                     )}
                  </div>
               </div>
            ) : isDrafting ? (
               <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-primary-100 dark:border-primary-900/20 overflow-hidden sticky top-6">
                  <div className="bg-primary-500 p-4 text-white flex justify-between items-center">
                     <h3 className="font-bold flex items-center gap-2"><Sparkles size={18} /> AI RFI Drafter</h3>
                     <button onClick={() => setIsDrafting(false)} className="hover:bg-white/10 p-1 rounded"><ChevronRight className="rotate-90" /></button>
                  </div>

                  <div className="p-4 space-y-4">
                     {!generatedDraft ? (
                        <>
                           <div>
                              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rough Notes / Voice Dictation</label>
                              <textarea
                                 value={roughNotes}
                                 onChange={(e) => setRoughNotes(e.target.value)}
                                 className="w-full h-32 p-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                 placeholder="e.g. The pipes in the hallway are hitting the structural beam. We need to know if we can drill through or need to move the pipes."
                              />
                           </div>
                           <button
                              onClick={handleGenerate}
                              disabled={!roughNotes || isGenerating}
                              className="w-full bg-secondary-900 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-secondary-800 disabled:opacity-50"
                           >
                              {isGenerating ? <span className="animate-spin">✨</span> : <Sparkles size={16} />}
                              {isGenerating ? 'Drafting...' : 'Generate Formal RFI'}
                           </button>
                        </>
                     ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                           <div>
                              <label className="text-xs font-bold text-slate-400 uppercase">Subject</label>
                              <input type="text" value={generatedDraft.subject} className="w-full font-bold text-slate-900 dark:text-white bg-transparent border-b border-slate-200 focus:border-primary-500 outline-none py-1" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-400 uppercase">Question</label>
                              <textarea className="w-full h-32 text-sm text-slate-700 dark:text-slate-300 bg-transparent border rounded p-2 mt-1" defaultValue={generatedDraft.question} />
                           </div>
                           <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-200 border border-amber-100 dark:border-amber-900/50">
                              <span className="font-bold flex items-center gap-1 mb-1"><AlertTriangle size={12} /> AI Impact Analysis</span>
                              {generatedDraft.impact}
                           </div>
                           <div className="flex gap-2 pt-2">
                              <button onClick={() => setGeneratedDraft(null)} className="flex-1 py-2 text-slate-500 text-sm hover:text-slate-800">Discard</button>
                              <button onClick={handleSaveDraft} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-green-700 flex items-center justify-center gap-2">
                                 <Send size={14} /> Send RFI
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="bg-secondary-800 rounded-xl p-6 text-white text-center">
                  <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                  <h3 className="font-bold text-lg mb-2">Need to write an RFI?</h3>
                  <p className="text-secondary-200 text-sm mb-4">Just type your rough notes or dictate the problem. Our AI will format it professionally and predict schedule impact.</p>
                  <button onClick={() => setIsDrafting(true)} className="bg-white text-secondary-800 px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                     Try AI Drafter
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
