import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Integration, BusinessData, Order, Customer } from '../types';

interface IntegrationsProps {
  businessData: BusinessData;
  setBusinessData: React.Dispatch<React.SetStateAction<BusinessData>>;
  integrations: Integration[];
  setIntegrations: React.Dispatch<React.SetStateAction<Integration[]>>;
}

export default function Integrations({ businessData, setBusinessData, integrations, setIntegrations }: IntegrationsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);
  const [simulating, setSimulating] = useState<string | null>(null);

  const categories = ['Commerce', 'Payments', 'Communication', 'Accounting', 'CRM', 'Documents'];

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const isConnected = integration.status === 'connected';
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

    const integrationName = integrations.find(i => i.id === id)?.name;
    const isConnecting = integrations.find(i => i.id === id)?.status !== 'connected';
    addLog(`System updated: ${integrationName} ${isConnecting ? 'Connected 🟢' : 'Disconnected 🔴'}`);
  };

  const handleEdit = (integration: Integration) => {
    setEditingId(integration.id);
    setApiKeyInput(integration.apiKey || '');
    setDomainInput(integration.webhookUrl || '');
  };

  const handleSaveConfig = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        return {
          ...integration,
          apiKey: apiKeyInput,
          webhookUrl: domainInput,
          status: 'connected',
          lastSync: 'Just now',
          stats: { products: 0, orders: 0, customers: 0, revenue: '₦0' },
          memory: 'Initializing...',
          health: { status: 'Healthy', webhook: 'Listening', api: 'Connected', rateLimit: '100%' }
        };
      }
      return integration;
    }));
    setEditingId(null);
    const integrationName = integrations.find(i => i.id === id)?.name;
    addLog(`Configuration updated: ${integrationName} keys registered and verified.`);
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setWebhookLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 8));
  };

  // Simulating an incoming webhook
  const triggerSimulation = (type: 'paystack' | 'shopify' | 'bumpa') => {
    setSimulating(type);
    
    setTimeout(() => {
      const nigerianFirstNames = ["Adebayo", "Funmilayo", "Tunde", "Uche", "Ngozi", "Efe", "Damilola"];
      const nigerianLastNames = ["Okonkwo", "Balogun", "Adeyemi", "Eze", "Nwachukwu", "Olatunji"];
      
      let customerName = `${nigerianFirstNames[Math.floor(Math.random() * nigerianFirstNames.length)]} ${nigerianLastNames[Math.floor(Math.random() * nigerianLastNames.length)]}`;
      const customerEmail = `${customerName.toLowerCase().replace(/\s+/g, '.')}@cloudweb.com`;
      
      const randomProduct = businessData.products[Math.floor(Math.random() * businessData.products.length)];
      if (!randomProduct) return;

      const orderRef = `${type.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderAmount = randomProduct.price;

      const newOrder: Order = {
        id: orderRef,
        date: "2026-07-15",
        customerName,
        customerEmail,
        products: [randomProduct.name],
        amount: orderAmount,
        paymentMethod: type === 'paystack' ? 'Paystack' : (type === 'bumpa' ? 'Cash' : 'Shopify Gateway'),
        status: 'Paid'
      };

      const existingCustIdx = businessData.customers.findIndex(c => c.email === customerEmail);
      let updatedCustomers = [...businessData.customers];

      if (existingCustIdx >= 0) {
        updatedCustomers[existingCustIdx].totalSpent += orderAmount;
        updatedCustomers[existingCustIdx].totalOrders += 1;
        updatedCustomers[existingCustIdx].lastActive = "2026-07-15";
      } else {
        const newCustomer: Customer = {
          id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
          name: customerName,
          email: customerEmail,
          phone: `+234 812 ${Math.floor(1000000 + Math.random() * 9000000)}`,
          country: 'Nigeria',
          totalSpent: orderAmount,
          totalOrders: 1,
          lastActive: "2026-07-15"
        };
        updatedCustomers.push(newCustomer);
      }

      const updatedProducts = businessData.products.map(p => {
        if (p.id === randomProduct.id) {
          return {
            ...p,
            stock: Math.max(0, p.stock - 1),
            salesCount: p.salesCount + 1
          };
        }
        return p;
      });

      setBusinessData(prev => ({
        ...prev,
        orders: [newOrder, ...prev.orders],
        customers: updatedCustomers,
        products: updatedProducts
      }));

      setIntegrations(prev => prev.map(i => {
        if (i.id === type) {
          const currentRevenue = i.stats?.revenue ? parseInt(i.stats.revenue.replace(/[^0-9]/g, '')) * (i.stats.revenue.includes('M') ? 1000000 : 1) : 0;
          const newRevenue = currentRevenue + orderAmount;
          const formattedRev = newRevenue > 1000000 ? `₦${(newRevenue / 1000000).toFixed(1)}M` : `₦${newRevenue.toLocaleString()}`;

          return { 
            ...i, 
            status: 'connected', 
            lastSync: 'Just now',
            stats: {
              products: (i.stats?.products || 0),
              orders: (i.stats?.orders || 0) + 1,
              customers: (i.stats?.customers || 0) + (existingCustIdx >= 0 ? 0 : 1),
              revenue: formattedRev
            }
          };
        }
        return i;
      }));

      addLog(`SIMULATOR: Inbound Webhook Verified. Created order ${orderRef} for ${customerName} (${businessData.currency}${orderAmount.toLocaleString()})`);
      
      if (type === 'bumpa') {
        addLog(`🧠 ORLENCE AI: New Business Intelligence Generated! Native Wear is best-selling category. Average spend ₦17,300. 63% buy twice. 12 dead stock products found.`);
      }

      setSimulating(null);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in" id="integrations-view">
      {/* Integrations Catalog */}
      <div className="lg:col-span-3 space-y-10" id="integrations-list">
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none">
          <h4 className="text-sm font-mono uppercase tracking-widest text-[#141414] font-bold">Integration Control Panel</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Orlence is the intelligence layer for your business. Connect your operational systems to unlock AI capabilities, real-time syncs, and intelligent forecasting.
          </p>
        </div>

        {categories.map(category => {
          const categoryIntegrations = integrations.filter(i => i.type === category);
          if (categoryIntegrations.length === 0) return null;

          return (
            <div key={category} className="space-y-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-[#141414] border-b border-[#141414] pb-2">
                {category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {categoryIntegrations.map((integration) => {
                  const isEditing = editingId === integration.id;
                  const isConnected = integration.status === 'connected';

                  return (
                    <div 
                      key={integration.id}
                      className={`bg-white rounded-none border transition-all flex flex-col justify-between ${
                        isConnected 
                          ? 'border-2 border-[#141414] shadow-[4px_4px_0_0_rgba(20,20,20,1)]' 
                          : 'border-[#141414] hover:shadow-[4px_4px_0_0_rgba(20,20,20,0.1)]'
                      }`}
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <h5 className="font-bold text-[#141414] text-lg flex items-center gap-1.5">
                            {integration.name}
                          </h5>
                          {isConnected && (
                            <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-1 bg-green-100 text-green-800 border border-[#141414]">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed min-h-[40px]">{integration.description}</p>
                      </div>

                      {/* Disconnected State - Show Capabilities */}
                      {!isConnected && !isEditing && (
                        <div className="mt-2 border-t border-[#141414]/10 bg-slate-50/50 p-5">
                          <p className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-3">Unlocks Capabilities</p>
                          <ul className="space-y-2">
                            {integration.unlocks.map((unlock, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-[#141414]">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                {unlock}
                              </li>
                            ))}
                          </ul>
                          <button 
                            onClick={() => toggleConnection(integration.id)}
                            className="w-full mt-5 bg-[#141414] text-[#E4E3E0] font-bold py-2.5 rounded-none border border-[#141414] hover:bg-black transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                          >
                            Connect <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Connected State - Show Stats and Health */}
                      {isConnected && !isEditing && (
                        <div className="border-t border-[#141414]">
                          {/* Sync Status Header */}
                          <div className="bg-slate-100 px-5 py-3 border-b border-[#141414]/10 flex justify-between items-center text-[10px] font-mono uppercase tracking-wider">
                            <span className="text-slate-500">Last Sync</span>
                            <span className="font-bold text-[#141414]">{integration.lastSync}</span>
                          </div>

                          {/* Imported Stats */}
                          {integration.stats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#141414]/10 border-b border-[#141414]/10">
                              <div className="bg-white p-3 text-center">
                                <p className="text-[9px] uppercase font-mono text-slate-400">Products</p>
                                <p className="font-bold text-[#141414] text-sm mt-1">{integration.stats.products}</p>
                              </div>
                              <div className="bg-white p-3 text-center">
                                <p className="text-[9px] uppercase font-mono text-slate-400">Orders</p>
                                <p className="font-bold text-[#141414] text-sm mt-1">{integration.stats.orders}</p>
                              </div>
                              <div className="bg-white p-3 text-center">
                                <p className="text-[9px] uppercase font-mono text-slate-400">Customers</p>
                                <p className="font-bold text-[#141414] text-sm mt-1">{integration.stats.customers}</p>
                              </div>
                              <div className="bg-white p-3 text-center">
                                <p className="text-[9px] uppercase font-mono text-slate-400">Revenue</p>
                                <p className="font-bold text-emerald-600 text-sm mt-1">{integration.stats.revenue}</p>
                              </div>
                            </div>
                          )}

                          {/* AI Memory Badge */}
                          {integration.memory && (
                            <div className="px-5 py-4 border-b border-[#141414]/10 bg-indigo-50/50 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                                <span className="text-[10px] font-mono font-bold text-indigo-900 uppercase">Business Memory</span>
                              </div>
                              <span className="text-xs font-bold text-indigo-600">{integration.memory}</span>
                            </div>
                          )}

                          {/* Connection Health */}
                          {integration.health && (
                            <div className="px-5 py-4 bg-slate-50 space-y-2">
                              <p className="text-[9px] font-mono font-bold text-slate-400 uppercase mb-2">Connection Health</p>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">Status</span>
                                <span className="font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{integration.health.status}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">Webhook</span>
                                <span className="font-medium text-[#141414]">{integration.health.webhook}</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-600">Rate Limit</span>
                                <span className="font-medium text-[#141414]">{integration.health.rateLimit}</span>
                              </div>
                            </div>
                          )}

                          <div className="px-5 py-3 border-t border-[#141414]/10 flex justify-between gap-3">
                            <button 
                              onClick={() => handleEdit(integration)}
                              className="text-[10px] font-mono font-bold uppercase text-slate-500 hover:text-[#141414] flex items-center gap-1.5"
                            >
                              <Settings className="w-3.5 h-3.5" /> Configure
                            </button>
                            <button 
                              onClick={() => toggleConnection(integration.id)}
                              className="text-[10px] font-mono font-bold uppercase text-rose-500 hover:text-rose-700"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Editing State */}
                      {isEditing && (
                        <div className="border-t border-[#141414] p-5 bg-slate-50 space-y-4">
                          <div className="space-y-3 text-[10px] font-mono uppercase">
                            <div>
                              <label className="font-bold text-slate-500 block mb-1">Private API Token / Key</label>
                              <div className="flex gap-2 items-center">
                                <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <input 
                                  type="password" 
                                  value={apiKeyInput}
                                  onChange={(e) => setApiKeyInput(e.target.value)}
                                  placeholder="sk_live_..."
                                  className="w-full bg-white border border-[#141414] rounded-none p-2 outline-none focus:bg-[#F0EFED] text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="font-bold text-slate-500 block mb-1">
                                {integration.type === 'Documents' ? 'Document URL' : 'Domain / Callback URL'}
                              </label>
                              <div className="flex gap-2 items-center">
                                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <input 
                                  type="text" 
                                  value={domainInput}
                                  onChange={(e) => setDomainInput(e.target.value)}
                                  placeholder="your-domain.com"
                                  className="w-full bg-white border border-[#141414] rounded-none p-2 outline-none focus:bg-[#F0EFED] text-xs"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-2 font-mono uppercase text-[10px]">
                            <button 
                              onClick={() => handleSaveConfig(integration.id)}
                              className="w-full bg-[#141414] text-[#E4E3E0] font-bold py-2 rounded-none border border-[#141414] hover:bg-black cursor-pointer"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="w-full bg-white text-[#141414] font-bold py-2 rounded-none border border-[#141414] hover:bg-[#F0EFED] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Webhook & Sandbox simulator right panel */}
      <div className="space-y-6 lg:col-span-1" id="integrations-simulation-hub">
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-[4px_4px_0_0_rgba(20,20,20,1)] flex flex-col justify-between min-h-64">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414] font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" /> Live Events Simulator
            </h4>
            <p className="text-[10px] uppercase text-slate-500 mt-3 leading-relaxed">
              Trigger a test webhook below to simulate real-world commerce events. Watch Orlence automatically sync and generate intelligence.
            </p>

            <div className="space-y-3 mt-6" id="simulators-actions">
              <button
                disabled={simulating !== null}
                onClick={() => triggerSimulation('bumpa')}
                className="w-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-900/20 text-indigo-900 text-[10px] font-mono uppercase font-bold p-3 rounded-none flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Trigger Bumpa Order
                </span>
                <span className="text-[9px] bg-indigo-900 text-white px-2 py-0.5 rounded-none font-bold">
                  {simulating === 'bumpa' ? 'Syncing...' : 'Simulate'}
                </span>
              </button>

              <button
                disabled={simulating !== null}
                onClick={() => triggerSimulation('paystack')}
                className="w-full bg-white hover:bg-[#F0EFED] border border-[#141414] text-[#141414] text-[10px] font-mono uppercase font-bold p-3 rounded-none flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Trigger Paystack
                </span>
                <span className="text-[9px] bg-[#141414] text-[#E4E3E0] px-2 py-0.5 rounded-none font-bold">
                  {simulating === 'paystack' ? 'Syncing...' : 'Card'}
                </span>
              </button>

              <button
                disabled={simulating !== null}
                onClick={() => triggerSimulation('shopify')}
                className="w-full bg-white hover:bg-[#F0EFED] border border-[#141414] text-[#141414] text-[10px] font-mono uppercase font-bold p-3 rounded-none flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Trigger Shopify
                </span>
                <span className="text-[9px] bg-[#141414] text-[#E4E3E0] px-2 py-0.5 rounded-none font-bold">
                  {simulating === 'shopify' ? 'Syncing...' : 'Cart'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 text-[9px] font-mono uppercase text-slate-500 flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Listening for webhooks...</span>
          </div>
        </div>

        {/* Console logs */}
        <div className="bg-[#141414] rounded-none p-5 border border-[#141414] shadow-[4px_4px_0_0_rgba(20,20,20,0.3)]">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#E4E3E0] font-bold mb-4 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-400" /> Intelligence Stream
          </h4>
          
          <div className="h-64 overflow-y-auto space-y-3 text-[9px] font-mono scrollbar-none" id="log-console">
            {webhookLogs.length === 0 ? (
              <p className="text-slate-500 italic uppercase">No incoming streams captured yet. Trigger a simulator above to initialize data intake.</p>
            ) : (
              webhookLogs.map((log, idx) => (
                <div key={idx} className={`leading-relaxed pb-2 border-b border-[#E4E3E0]/10 ${log.includes('ORLENCE AI') ? 'text-indigo-400 font-bold' : 'text-[#E4E3E0]'}`}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
