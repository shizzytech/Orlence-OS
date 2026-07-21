import React, { useState, useMemo } from 'react';
import { 
  Settings, 
  Key, 
  Globe, 
  Webhook, 
  Play, 
  Activity,
  Bot,
  CheckCircle2,
  Zap,
  BrainCircuit,
  Database,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  LineChart,
  Users,
  Box,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { Integration, BusinessData } from '../types';

interface IntegrationsProps {
  businessData: BusinessData;
  setBusinessData: React.Dispatch<React.SetStateAction<BusinessData>>;
  integrations: Integration[];
  setIntegrations: React.Dispatch<React.SetStateAction<Integration[]>>;
}

const MODULES = [
  {
    id: 'commerce',
    name: 'Commerce Intelligence',
    icon: Box,
    types: ['Commerce'],
    color: 'emerald',
    description: 'Watches orders, inventory, and product trends.'
  },
  {
    id: 'finance',
    name: 'Finance Intelligence',
    icon: CreditCard,
    types: ['Payments', 'Accounting'],
    color: 'blue',
    description: 'Watches revenue, cashflow, and detects fraud.'
  },
  {
    id: 'marketing',
    name: 'Marketing Intelligence',
    icon: MessageSquare,
    types: ['Communication'],
    color: 'rose',
    description: 'Watches leads, conversion, and engagement.'
  },
  {
    id: 'customer',
    name: 'Customer Intelligence',
    icon: Users,
    types: ['CRM'],
    color: 'purple',
    description: 'Watches lifetime value, churn, and retention.'
  },
  {
    id: 'operations',
    name: 'Operations Intelligence',
    icon: LineChart,
    types: ['Documents'],
    color: 'amber',
    description: 'Watches supply chain, logistics, and manual records.'
  }
];

export default function Integrations({ businessData, integrations, setIntegrations }: IntegrationsProps) {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  // AI Import State
  const [isDragging, setIsDragging] = useState(false);
  const [importingState, setImportingState] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [importLogs, setImportLogs] = useState<string[]>([]);
  
  // Sync Feed State
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "[10:42 AM] Paystack: Processed 14 new successful transactions.",
    "[10:41 AM] Shopify: Synced 3 new orders. Inventory updated.",
    "[10:35 AM] AI: Noticed unusual dip in conversion rate. Alert queued."
  ]);

  const addSyncLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSyncLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 10));
  };

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const isConnected = integration.status === 'connected';
        if (!isConnected) {
          addSyncLog(`[System] Activated agent for ${integration.name}. Status: Learning...`);
          setTimeout(() => addSyncLog(`[System] ${integration.name} agent escalated to: Watching live data.`), 3000);
        } else {
          addSyncLog(`[System] Deactivated agent for ${integration.name}.`);
        }
        return {
          ...integration,
          status: isConnected ? 'disconnected' : 'connected',
          lastSync: isConnected ? undefined : 'Just now',
          stats: isConnected ? undefined : { products: 0, orders: 0, customers: 0, revenue: '₦0' },
          memory: isConnected ? undefined : 'Initializing...',
          health: isConnected ? undefined : { status: 'Healthy', webhook: 'Listening', api: 'Connected', rateLimit: '100%' }
        };
      }
      return integration;
    }));
  };

  const handleSaveConfig = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        return {
          ...integration,
          apiKey: apiKeyInput,
          status: 'connected',
          lastSync: 'Just now',
          health: { status: 'Healthy', webhook: 'Listening', api: 'Connected', rateLimit: '100%' }
        };
      }
      return integration;
    }));
    setEditingId(null);
    const integrationName = integrations.find(i => i.id === id)?.name;
    addSyncLog(`[System] Secured connection to ${integrationName}. Agent is now Watching.`);
  };

  const simulateAIImport = () => {
    setImportingState('analyzing');
    setImportLogs(["Parsing document structures...", "Extracting tabular data...", "Mapping fields to business memory..."]);
    
    setTimeout(() => {
      setImportingState('done');
      setImportLogs([
        "✅ Imported 328 products.",
        "⚠️ Found 7 duplicate SKUs.",
        "⚠️ 12 products have no selling price.",
        "⚠️ 18 products are below reorder level."
      ]);
      addSyncLog("[Operations Agent] Manually ingested 328 products from Excel import.");
    }, 2500);
  };

  // Calculate Health Scores
  const moduleScores = useMemo(() => {
    const scores: Record<string, number> = {};
    MODULES.forEach(mod => {
      const relevant = integrations.filter(i => mod.types.includes(i.type));
      const connected = relevant.filter(i => i.status === 'connected').length;
      scores[mod.id] = relevant.length === 0 ? 0 : Math.min(100, Math.round((connected / Math.min(2, relevant.length)) * 100));
    });
    return scores;
  }, [integrations]);

  const overallScore = Math.round(Object.values(moduleScores).reduce((a, b) => a + b, 0) / MODULES.length);

  // --- OVERVIEW RENDER ---
  if (!activeModuleId) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-indigo-600" /> Connect Your Business
            </h1>
            <p className="text-slate-500 text-lg">Activate intelligence modules to let Orlence watch, learn, and automate your operations.</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-6 shrink-0 min-w-[300px]">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={overallScore >= 80 ? '#10b981' : overallScore >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(overallScore / 100) * 251.2} 251.2`} className="transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{overallScore}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Health</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 mb-1">Intelligence Coverage</h3>
              <p className="text-xs text-slate-500 mb-3">Overall systemic awareness</p>
              <div className="flex text-amber-500 text-sm">
                {'★'.repeat(Math.round(overallScore / 20))}{'☆'.repeat(5 - Math.round(overallScore / 20))}
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Bars */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Domain Coverage</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {MODULES.map(mod => {
              const score = moduleScores[mod.id] || 0;
              return (
                <div key={mod.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-700">{mod.name.replace(' Intelligence', '')}</span>
                    <span className="text-xs font-black text-slate-400">{score}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-${mod.color}-500 transition-all duration-1000`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligence Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODULES.map(mod => {
            const ModIcon = mod.icon;
            const score = moduleScores[mod.id] || 0;
            const relevant = integrations.filter(i => mod.types.includes(i.type));
            const connected = relevant.filter(i => i.status === 'connected');
            
            let statusBadge = "Disconnected";
            let statusColor = "bg-slate-100 text-slate-500";
            if (score > 80) { statusBadge = "Automating..."; statusColor = "bg-emerald-100 text-emerald-700"; }
            else if (score > 50) { statusBadge = "Predicting..."; statusColor = "bg-blue-100 text-blue-700"; }
            else if (score > 0) { statusBadge = "Watching..."; statusColor = "bg-amber-100 text-amber-700"; }

            return (
              <div 
                key={mod.id} 
                onClick={() => setActiveModuleId(mod.id)}
                className={`bg-white rounded-2xl border ${score > 0 ? `border-${mod.color}-200 shadow-md` : 'border-slate-200 shadow-sm opacity-80'} p-6 cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all group flex flex-col`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${mod.color}-100 text-${mod.color}-600 flex items-center justify-center`}>
                    <ModIcon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusColor}`}>
                    {statusBadge}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{mod.name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1">{mod.description}</p>
                
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Data Sources</div>
                  {connected.length > 0 ? (
                    connected.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <CheckCircle2 className={`w-4 h-4 text-${mod.color}-500`} /> {c.name}
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-400 italic">No sources connected</div>
                  )}
                  {connected.length < relevant.length && (
                    <button className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Connect more sources <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Sync Feed Card */}
          <div className="bg-slate-900 rounded-2xl p-6 text-slate-300 shadow-xl flex flex-col">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Live Brain Sync
            </h3>
            <div className="flex-1 font-mono text-[10px] sm:text-xs space-y-3 overflow-hidden opacity-80">
              {syncLogs.map((log, i) => (
                <div key={i} className="animate-in slide-in-from-left-2">{log}</div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- MODULE DETAIL RENDER ---
  const activeModule = MODULES.find(m => m.id === activeModuleId);
  if (!activeModule) return null;

  const relevantIntegrations = integrations.filter(i => activeModule.types.includes(i.type));

  return (
    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 fade-in pb-20">
      
      <button 
        onClick={() => setActiveModuleId(null)}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Intelligence Hub
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className={`w-16 h-16 rounded-2xl bg-${activeModule.color}-100 text-${activeModule.color}-600 flex items-center justify-center shrink-0`}>
          <activeModule.icon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black">{activeModule.name}</h1>
          <p className="text-slate-500 text-lg">Enable this agent to unlock powerful automations and insights.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Connect API / Apps */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-400" /> Supported Apps & Platforms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relevantIntegrations.map(integration => {
              const isConnected = integration.status === 'connected';
              const isEditing = editingId === integration.id;

              return (
                <div key={integration.id} className={`bg-white border ${isConnected ? `border-${activeModule.color}-400 shadow-md` : 'border-slate-200'} rounded-2xl p-6 transition-all`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg">{integration.name}</h3>
                    {isConnected ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">What you'll unlock</p>
                    <ul className="space-y-2">
                      {integration.unlocks.map(u => (
                        <li key={u} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                          <Check className={`w-4 h-4 mt-0.5 ${isConnected ? `text-${activeModule.color}-500` : 'text-slate-300'}`} /> {u}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-slate-100 pt-5 mt-auto">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Secret API Key</label>
                          <input 
                            type="password" 
                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500" 
                            placeholder={`sk_live_...`}
                            value={apiKeyInput}
                            onChange={e => setApiKeyInput(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleSaveConfig(integration.id)}
                            className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Verify & Connect
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="px-4 bg-slate-100 text-slate-600 font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : isConnected ? (
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-500">
                          <p>Last sync: <span className="font-bold text-slate-700">{integration.lastSync}</span></p>
                        </div>
                        <button 
                          onClick={() => toggleConnection(integration.id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          if (integration.id === 'shopify' || integration.id === 'google') {
                            // Simulate OAuth
                            toggleConnection(integration.id);
                          } else {
                            // Fallback to API Key UI
                            setEditingId(integration.id);
                            setApiKeyInput('');
                          }
                        }}
                        className={`w-full bg-${activeModule.color}-600 text-white font-bold py-2.5 rounded-xl hover:bg-${activeModule.color}-700 transition-colors shadow-sm flex justify-center items-center gap-2`}
                      >
                        Enable {integration.name}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex items-center py-6">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 font-medium text-sm italic">OR</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* AI Import / Manual Upload */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bot className="w-5 h-5 text-slate-400" /> AI Document Import
            </h2>
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">Universal Fallback</span>
          </div>
          <p className="text-slate-500 text-sm">Don't use any of the tools above? Upload your raw Excel files, CSVs, PDF invoices, or bank statements. Orlence AI will read them and extract the intelligence automatically.</p>
          
          <div 
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (importingState === 'idle') simulateAIImport(); }}
          >
            {importingState === 'idle' ? (
              <div className="flex flex-col items-center cursor-pointer" onClick={simulateAIImport}>
                <div className="flex gap-4 mb-4 text-slate-400">
                  <FileSpreadsheet className="w-8 h-8" />
                  <FileText className="w-8 h-8" />
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-700 mb-1">Drag and drop files here</h3>
                <p className="text-sm text-slate-500 mb-6">Supports .xlsx, .csv, .pdf, .png, .jpg</p>
                <button className="bg-white border border-slate-200 text-slate-700 font-bold py-2 px-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  Browse Files
                </button>
              </div>
            ) : importingState === 'analyzing' ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-6" />
                <div className="space-y-2 text-sm font-medium text-slate-600">
                  {importLogs.map((log, i) => (
                    <p key={i} className="animate-in fade-in slide-in-from-bottom-2">{log}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 text-left w-full max-w-sm mx-auto">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 self-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-4 text-center">Import Complete</h3>
                <div className="bg-white p-4 rounded-xl border border-slate-200 w-full space-y-3">
                  {importLogs.map((log, i) => (
                    <div key={i} className="flex gap-2 text-sm font-medium text-slate-700">
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => { setImportingState('idle'); setImportLogs([]); }}
                  className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700 self-center"
                >
                  Upload another file
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
