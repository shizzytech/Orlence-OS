import React, { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Check, 
  X, 
  Sliders, 
  HelpCircle, 
  Key, 
  Globe, 
  Webhook, 
  Radio, 
  Play, 
  Mail, 
  Activity,
  Bot
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

  const toggleConnection = (id: string) => {
    setIntegrations(prev => prev.map(integration => {
      if (integration.id === id) {
        const isConnected = integration.status === 'connected';
        return {
          ...integration,
          status: isConnected ? 'disconnected' : 'connected',
          lastSync: isConnected ? undefined : new Date().toLocaleString()
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
          lastSync: new Date().toLocaleString()
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

  // Simulating an incoming Paystack / Shopify webhook
  const triggerSimulation = (type: 'paystack' | 'shopify') => {
    setSimulating(type);
    
    setTimeout(() => {
      // 1. Generate a random transaction amount and customer name
      const nigerianFirstNames = ["Adebayo", "Funmilayo", "Tunde", "Uche", "Ngozi", "Efe", "Damilola"];
      const nigerianLastNames = ["Okonkwo", "Balogun", "Adeyemi", "Eze", "Nwachukwu", "Olatunji"];
      const ghanianFirstNames = ["Kofi", "Ama", "Kwame", "Yaa", "Ekow", "Abena"];
      const ghanianLastNames = ["Mensah", "Osei", "Appiah", "Gyasi", "Boateng"];
      
      const isSartorial = businessData.businessName === "Sartorial Africa";
      const isKigali = businessData.businessName === "Kigali Coffee Co.";
      
      let customerName = "";
      let country = "Nigeria";
      
      if (isKigali) {
        customerName = `${ghanianFirstNames[Math.floor(Math.random() * ghanianFirstNames.length)]} ${ghanianLastNames[Math.floor(Math.random() * ghanianLastNames.length)]}`;
        country = "Ghana";
      } else {
        customerName = `${nigerianFirstNames[Math.floor(Math.random() * nigerianFirstNames.length)]} ${nigerianLastNames[Math.floor(Math.random() * nigerianLastNames.length)]}`;
      }
      
      const customerEmail = `${customerName.toLowerCase().replace(/\s+/g, '.')}@cloudweb.com`;
      
      // Select a random product from inventory
      const randomProduct = businessData.products[Math.floor(Math.random() * businessData.products.length)];
      if (!randomProduct) return;

      const orderRef = `${type === 'paystack' ? 'T-PAY' : 'ORD-SHPF'}-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderAmount = randomProduct.price;

      // 2. Insert order into active memory
      const newOrder: Order = {
        id: orderRef,
        date: "2026-07-15", // Today
        customerName,
        customerEmail,
        products: [randomProduct.name],
        amount: orderAmount,
        paymentMethod: type === 'paystack' ? 'Paystack' : 'Shopify Gateway',
        status: 'Paid'
      };

      // 3. Update customer or create one
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
          country,
          totalSpent: orderAmount,
          totalOrders: 1,
          lastActive: "2026-07-15"
        };
        updatedCustomers.push(newCustomer);
      }

      // 4. Increment product sales and decrement stock if available
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

      // Register live connected sync sync date
      setIntegrations(prev => prev.map(i => {
        if (i.id === type) {
          return { ...i, status: 'connected', lastSync: new Date().toLocaleString() };
        }
        return i;
      }));

      addLog(`SIMULATOR: Inbound Webhook Verified. Created order ${orderRef} for ${customerName} (${businessData.currency}${orderAmount.toLocaleString()})`);
      setSimulating(null);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="integrations-view">
      {/* Integrations Catalog */}
      <div className="lg:col-span-2 space-y-5" id="integrations-list">
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414]">Integrations Control Panel</h4>
          <p className="text-[10px] uppercase text-slate-500 mt-1">
            FounderGPT supports seamless background pipeline relays. Connect webhooks to sync transactions in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="integrations-grid">
          {integrations.map((integration) => {
            const isEditing = editingId === integration.id;
            const isConnected = integration.status === 'connected';

            return (
              <div 
                key={integration.id}
                className={`bg-white rounded-none border p-5 transition-all flex flex-col justify-between ${
                  isConnected 
                    ? 'border-2 border-[#141414]' 
                    : 'border-[#141414]'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-500 bg-[#F0EFED] border border-[#141414] px-2 py-0.5 rounded-none">
                      {integration.type}
                    </span>
                    <button 
                      onClick={() => toggleConnection(integration.id)}
                      className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 border rounded-none transition-all cursor-pointer ${
                        isConnected 
                          ? 'bg-green-100 text-green-800 border-[#141414]' 
                          : 'bg-slate-100 text-slate-500 border-[#141414]/30 hover:bg-[#141414] hover:text-[#E4E3E0]'
                      }`}
                    >
                      {isConnected ? '● Connected' : '○ Offline'}
                    </button>
                  </div>

                  <h5 className="font-bold text-[#141414] text-sm flex items-center gap-1.5">
                    {integration.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{integration.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 space-y-3">
                  {isEditing ? (
                    <div className="space-y-2.5 text-[10px] font-mono uppercase">
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">Private API Token / Key</label>
                        <div className="flex gap-2 items-center">
                          <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <input 
                            type="password" 
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="sk_live_..."
                            className="w-full bg-white border border-[#141414] rounded-none p-1.5 outline-none focus:bg-[#F0EFED] text-xs font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-slate-500 block mb-1">
                          {integration.id === 'sheets' ? 'Spreadsheet URL' : 'Domain / Callback URL'}
                        </label>
                        <div className="flex gap-2 items-center">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <input 
                            type="text" 
                            value={domainInput}
                            onChange={(e) => setDomainInput(e.target.value)}
                            placeholder={integration.id === 'sheets' ? 'https://docs.google.com/spreadsheets/...' : 'myshop.myshopify.com'}
                            className="w-full bg-white border border-[#141414] rounded-none p-1.5 outline-none focus:bg-[#F0EFED] text-xs"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1 font-mono uppercase text-[9px]">
                        <button 
                          onClick={() => handleSaveConfig(integration.id)}
                          className="w-full bg-[#141414] text-[#E4E3E0] font-bold py-1.5 rounded-none border border-[#141414] hover:bg-black cursor-pointer"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => setEditingId(null)}
                          className="w-full bg-white text-[#141414] font-bold py-1.5 rounded-none border border-[#141414] hover:bg-[#F0EFED] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[9px] font-mono uppercase text-slate-400">
                      <span>{integration.lastSync ? `Sync: ${integration.lastSync.split(',')[1]}` : 'Never synchronized'}</span>
                      <button 
                        onClick={() => handleEdit(integration)}
                        className="text-[#141414] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Settings className="w-3 h-3" /> Setup Keys
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Webhook & Sandbox simulator right panel */}
      <div className="space-y-6" id="integrations-simulation-hub">
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none flex flex-col justify-between min-h-64">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414] flex items-center gap-1.5">
              <Webhook className="w-4 h-4 text-[#141414]" /> Merchant Webhook Simulator
            </h4>
            <p className="text-[10px] uppercase text-slate-500 mt-2 leading-relaxed">
              Trigger a test webhook below to simulate commerce events on Paystack and Shopify. Simulated data updates are instantly parsed and rendered.
            </p>

            <div className="space-y-2.5 mt-5" id="simulators-actions">
              <button
                disabled={simulating !== null}
                onClick={() => triggerSimulation('paystack')}
                className="w-full bg-white hover:bg-[#F0EFED] border border-[#141414] text-[#141414] text-[10px] font-mono uppercase font-bold p-3 rounded-none flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Trigger Paystack Webhook
                </span>
                <span className="text-[9px] bg-[#141414] text-[#E4E3E0] border border-[#141414] px-2 py-0.5 rounded-none font-bold">
                  {simulating === 'paystack' ? 'Syncing...' : 'Card Sale'}
                </span>
              </button>

              <button
                disabled={simulating !== null}
                onClick={() => triggerSimulation('shopify')}
                className="w-full bg-white hover:bg-[#F0EFED] border border-[#141414] text-[#141414] text-[10px] font-mono uppercase font-bold p-3 rounded-none flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Play className="w-3.5 h-3.5" /> Trigger Shopify Order Webhook
                </span>
                <span className="text-[9px] bg-[#141414] text-[#E4E3E0] border border-[#141414] px-2 py-0.5 rounded-none font-bold">
                  {simulating === 'shopify' ? 'Syncing...' : 'Cart Checkout'}
                </span>
              </button>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-200 text-[9px] font-mono uppercase text-slate-500 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shrink-0"></span>
            <span>Listening for merchant event webhooks...</span>
          </div>
        </div>

        {/* Console logs */}
        <div className="bg-[#141414] rounded-none p-4.5 border border-[#141414] shadow-none">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#E4E3E0] mb-3 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-sky-400" /> Webhook Log Stream
          </h4>
          
          <div className="h-32 overflow-y-auto space-y-2 text-[9px] font-mono scrollbar-none" id="log-console">
            {webhookLogs.length === 0 ? (
              <p className="text-slate-500 italic uppercase">No incoming requests captured yet. Trigger a simulator above to initialize stream logs.</p>
            ) : (
              webhookLogs.map((log, idx) => (
                <div key={idx} className="text-[#E4E3E0] leading-normal truncate border-b border-[#E4E3E0]/10 pb-1.5">
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
