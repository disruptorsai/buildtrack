
import React, { useState, useRef, useEffect } from 'react';
import { 
  Map as MapIcon, Plus, ScanEye, MousePointer2, Move, Type, Cloud, Ruler, 
  ChevronRight, ChevronLeft, FolderOpen, Search, Filter, X,
  AlertCircle, CheckCircle2, Clock, Calendar, User, MoreVertical, Trash2
} from 'lucide-react';
import { PLANS, FIELD_ISSUES, PROJECTS, PLAN_FOLDERS } from '../constants';
import { analyzeBlueprint } from '../services/geminiService';
import { FieldIssue, TaskPriority, TaskStatus } from '../types';
import clsx from 'clsx';

type Tool = 'SELECT' | 'PAN' | 'PIN' | 'CLOUD' | 'MEASURE';

export const Plans: React.FC = () => {
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string>('arch');
  const [issues, setIssues] = useState<FieldIssue[]>(FIELD_ISSUES);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  // Canvas State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<Tool>('SELECT');

  // AI State
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const activePlan = PLANS.find(p => p.id === activePlanId);
  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  // --- Canvas Interaction Handlers ---

  const handleWheel = (e: React.WheelEvent) => {
    if (!activePlan) return;
    if (e.ctrlKey || e.metaKey) {
       // Zoom
       e.preventDefault();
       const zoomIntensity = 0.1;
       const direction = e.deltaY > 0 ? -1 : 1;
       const newScale = Math.min(Math.max(0.2, scale + direction * zoomIntensity), 5);
       setScale(newScale);
    } else {
       // Pan
       // Logic handled by CSS overflow usually, but if we want infinite canvas:
       setPosition(prev => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'PAN' || (activeTool === 'SELECT' && e.button === 1)) {
       setIsDragging(true);
       setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
       setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
       });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
     if (isDragging) return;
     if (activeTool === 'PIN' && activePlanId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        // Calculate percentage position relative to the image
        // We need to account for scale and position
        // This is a simplified demo approximation. 
        // In a real app, you'd matrix invert the coordinates.
        // For this demo, let's assume the click is directly on the image element if we attach handler there.
     }
  };

  const handleImageClick = (e: React.MouseEvent) => {
     if (activeTool === 'PIN' && activePlanId) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const newIssue: FieldIssue = {
           id: `fi-${Date.now()}`,
           planId: activePlanId,
           x,
           y,
           status: 'OPEN',
           priority: 'MEDIUM',
           category: 'Quality',
           description: 'New Issue',
           assignedTo: 'Unassigned',
           dueDate: new Date().toISOString().split('T')[0]
        };
        setIssues([...issues, newIssue]);
        setSelectedIssueId(newIssue.id);
        setActiveTool('SELECT'); // Switch back to select after pinning
     }
  };

  const handleAnalyze = async () => {
    if (!activePlan) return;
    setIsAnalyzing(true);
    const result = await analyzeBlueprint(activePlan.imageUrl);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  // --- Render Views ---

  if (activePlan) {
    return (
      <div className="flex h-full w-full bg-slate-100 dark:bg-slate-900 overflow-hidden relative">
        
        {/* Left Toolbar (Tools) */}
        <div className="w-16 flex flex-col items-center py-4 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-20 shadow-sm">
           <button onClick={() => setActivePlanId(null)} className="mb-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500">
              <ChevronLeft />
           </button>
           
           <div className="space-y-2 flex flex-col w-full px-2">
              <ToolButton icon={MousePointer2} label="Select" active={activeTool === 'SELECT'} onClick={() => setActiveTool('SELECT')} />
              <ToolButton icon={Move} label="Pan" active={activeTool === 'PAN'} onClick={() => setActiveTool('PAN')} />
              <ToolButton icon={MapIcon} label="Pin" active={activeTool === 'PIN'} onClick={() => setActiveTool('PIN')} />
              <ToolButton icon={Cloud} label="Cloud" active={activeTool === 'CLOUD'} onClick={() => setActiveTool('CLOUD')} />
              <ToolButton icon={Ruler} label="Measure" active={activeTool === 'MEASURE'} onClick={() => setActiveTool('MEASURE')} />
           </div>

           <div className="mt-auto">
              <button 
                onClick={handleAnalyze}
                className={`p-3 rounded-xl transition-all ${isAnalyzing ? 'bg-indigo-100 text-indigo-600 animate-pulse' : 'text-slate-400 hover:text-indigo-500'}`}
                title="AI Scan"
              >
                 <ScanEye />
              </button>
           </div>
        </div>

        {/* Center Canvas */}
        <div 
          className="flex-1 relative overflow-hidden bg-slate-200 dark:bg-black cursor-crosshair"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: activeTool === 'PAN' || isDragging ? 'grabbing' : activeTool === 'SELECT' ? 'default' : 'crosshair' }}
        >
           {/* Info Bar Overlay */}
           <div className="absolute top-4 left-4 right-4 h-12 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-10 pointer-events-none">
              <div>
                 <h2 className="font-bold text-slate-800 dark:text-white pointer-events-auto">{activePlan.name}</h2>
                 <span className="text-xs text-slate-500">{activePlan.version}</span>
              </div>
              <div className="flex items-center gap-4 pointer-events-auto">
                 <span className="text-xs font-mono text-slate-500">{Math.round(scale * 100)}%</span>
                 <button onClick={() => { setScale(1); setPosition({x:0, y:0}); }} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-200">Reset View</button>
              </div>
           </div>

           {/* Infinite Canvas Content */}
           <div 
              ref={canvasRef}
              className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out"
              style={{ 
                 transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                 transformOrigin: 'center center' 
              }}
           >
              <div className="relative shadow-2xl ring-1 ring-black/10">
                 <img 
                    src={activePlan.imageUrl} 
                    alt="Plan" 
                    className="max-w-none h-[1200px] select-none pointer-events-auto"
                    draggable={false}
                    onClick={handleImageClick}
                 />

                 {/* Render Pins */}
                 {issues.filter(i => i.planId === activePlanId).map(issue => (
                    <div 
                       key={issue.id}
                       onClick={(e) => { e.stopPropagation(); setSelectedIssueId(issue.id); }}
                       className="absolute w-0 h-0 pointer-events-auto cursor-pointer"
                       style={{ left: `${issue.x}%`, top: `${issue.y}%` }}
                    >
                       <div className={`transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-transform hover:scale-125 ${
                          selectedIssueId === issue.id ? 'ring-4 ring-primary-500/50 scale-110 z-20' : 'z-10'
                       } ${
                          issue.status === 'RESOLVED' ? 'bg-green-500 text-white' : 
                          issue.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                          issue.priority === 'HIGH' ? 'bg-orange-500 text-white' :
                          'bg-red-500 text-white'
                       }`}>
                          {issue.status === 'RESOLVED' ? <CheckCircle2 size={16} /> : <span className="font-bold text-xs">{issues.indexOf(issue) + 1}</span>}
                       </div>
                    </div>
                 ))}

                 {/* AI Overlay */}
                 {analysisResult && (
                    <div className="absolute top-10 right-10 max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur p-6 rounded-xl shadow-2xl border border-indigo-500 z-30 pointer-events-auto">
                       <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
                             <ScanEye size={20} /> Analysis Report
                          </h3>
                          <button onClick={() => setAnalysisResult(null)}><X size={16} /></button>
                       </div>
                       <div className="prose prose-sm prose-indigo dark:prose-invert">
                          <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br/>') }} />
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Right Sidebar (Task Detail) */}
        {selectedIssue && (
           <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-xl z-30 flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                 <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-500">#{issues.indexOf(selectedIssue) + 1}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                       selectedIssue.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>{selectedIssue.status}</span>
                 </div>
                 <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-200 rounded"><MoreVertical size={16} /></button>
                    <button onClick={() => setSelectedIssueId(null)} className="p-1 hover:bg-slate-200 rounded"><X size={16} /></button>
                 </div>
              </div>

              <div className="p-6 space-y-6 flex-1">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea 
                       className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 resize-none font-medium text-slate-900 dark:text-white" 
                       rows={3}
                       defaultValue={selectedIssue.description}
                    />
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                       <User size={18} className="text-slate-400" />
                       <div className="flex-1">
                          <p className="text-xs text-slate-500">Assignee</p>
                          <p className="text-sm font-medium">{selectedIssue.assignedTo || 'Unassigned'}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                       <Calendar size={18} className="text-slate-400" />
                       <div className="flex-1">
                          <p className="text-xs text-slate-500">Due Date</p>
                          <p className="text-sm font-medium">{selectedIssue.dueDate || 'Set Date'}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                       <div className={`w-4 h-4 rounded-full ${
                          selectedIssue.priority === 'HIGH' ? 'bg-orange-500' : 'bg-slate-400'
                       }`}></div>
                       <div className="flex-1">
                          <p className="text-xs text-slate-500">Priority</p>
                          <p className="text-sm font-medium">{selectedIssue.priority}</p>
                       </div>
                    </div>
                 </div>

                 {/* Photos Section Placeholder */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-xs font-bold text-slate-500 uppercase">Photos (0)</label>
                       <button className="text-primary-600 text-xs font-bold flex items-center gap-1"><Plus size={12} /> Add</button>
                    </div>
                    <div className="h-20 bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                       No photos attached
                    </div>
                 </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                 <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm shadow-sm transition-colors">
                    Mark as Resolved
                 </button>
              </div>
           </div>
        )}

      </div>
    );
  }

  // --- Folder / List View ---
  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Folder Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
         <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Plans</h2>
            <div className="relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search sheets..." 
                  className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" 
               />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto py-2">
            {PLAN_FOLDERS.map(folder => (
               <div 
                  key={folder.id}
                  onClick={() => setActiveFolderId(folder.id)}
                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                     activeFolderId === folder.id 
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-r-4 border-primary-500' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
               >
                  <div className="flex items-center gap-3">
                     <FolderOpen size={18} className={activeFolderId === folder.id ? 'text-primary-600' : 'text-slate-400'} />
                     <span className={`text-sm font-medium ${activeFolderId === folder.id ? 'text-primary-900 dark:text-primary-100' : 'text-slate-700 dark:text-slate-300'}`}>
                        {folder.name}
                     </span>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{folder.count}</span>
               </div>
            ))}
         </div>
         <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <button className="w-full bg-secondary-900 dark:bg-secondary-700 text-white py-2 rounded-lg text-sm font-bold shadow hover:bg-secondary-800 flex items-center justify-center gap-2">
               <Plus size={16} /> Upload Plans
            </button>
         </div>
      </div>

      {/* Plans Grid */}
      <div className="flex-1 overflow-y-auto p-6">
         <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
               {PLAN_FOLDERS.find(f => f.id === activeFolderId)?.name} Drawings
            </h1>
            <div className="flex gap-2">
               <button className="p-2 text-slate-500 hover:bg-white rounded-lg"><Filter size={18} /></button>
            </div>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {PLANS.filter(p => p.folderId === activeFolderId).length > 0 ? (
               PLANS.filter(p => p.folderId === activeFolderId).map(plan => (
                  <div 
                     key={plan.id} 
                     onClick={() => setActivePlanId(plan.id)}
                     className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-200 dark:border-slate-700 cursor-pointer transition-all hover:-translate-y-1"
                  >
                     <div className="h-40 bg-slate-100 relative overflow-hidden">
                        <img src={plan.imageUrl} alt={plan.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur">
                           {plan.version}
                        </div>
                     </div>
                     <div className="p-4">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm truncate" title={plan.name}>{plan.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{new Date(plan.uploadDate).toLocaleDateString()}</p>
                        
                        <div className="flex gap-2 mt-4">
                           <div className="flex-1 flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs py-1 rounded">
                              <AlertCircle size={10} /> 
                              {issues.filter(i => i.planId === plan.id && i.status === 'OPEN').length}
                           </div>
                           <div className="flex-1 flex items-center justify-center gap-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs py-1 rounded">
                              <CheckCircle2 size={10} />
                              {issues.filter(i => i.planId === plan.id && i.status === 'RESOLVED').length}
                           </div>
                        </div>
                     </div>
                  </div>
               ))
            ) : (
               <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <FolderOpen size={48} className="mb-4 opacity-20" />
                  <p>No plans found in this folder.</p>
                  <button className="mt-4 text-primary-600 text-sm font-medium hover:underline">Upload sheets to this folder</button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const ToolButton: React.FC<{ icon: React.ElementType, label?: string, active?: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
   <button 
      onClick={onClick}
      className={clsx(
         "p-3 rounded-xl flex flex-col items-center justify-center gap-1 w-full transition-all",
         active ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-primary-200 dark:ring-primary-800" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900"
      )}
      title={label}
   >
      <Icon size={20} />
   </button>
);
