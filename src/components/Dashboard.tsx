import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { BusinessData, Integration } from '../types';

interface DashboardProps {
  businessData: BusinessData;
  integrations: Integration[];
  onAskAi?: (prompt: string) => void;
}

export default function Dashboard({ businessData, integrations, onAskAi }: DashboardProps) {
  const { orders, products, customers, currency } = businessData;

  // Calculate metrics
  const totalRevenue = orders
    .filter(o => o.status === 'Paid')
    .reduce((sum, o) => sum + o.amount, 0);

  const averageOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const activeCustomersCount = customers.filter(c => c.totalOrders > 0).length;
  
  // Alert for low stock items
  const lowStockItems = products.filter(p => p.stock <= 5);

  // Group sales by date for AreaChart
  const salesByDate = React.useMemo(() => {
    const datesMap: Record<string, { date: string; sales: number; count: number }> = {};
    
    // Last 30 days template
    const dates = Array.from({ length: 15 }, (_, i) => {
      const d = new Date(2026, 6, 15 - i); // Starting July 15, 2026 backwards
      return d.toISOString().split('T')[0];
    }).reverse();

    dates.forEach(date => {
      datesMap[date] = { date: formatDate(date), sales: 0, count: 0 };
    });

    orders.forEach(o => {
      if (o.status === 'Paid' && datesMap[o.date]) {
        datesMap[o.date].sales += o.amount;
        datesMap[o.date].count += 1;
      }
    });

    return Object.values(datesMap);
  }, [orders]);

  // Group sales by date for 30-day Sparkline
  const sparklineSalesData = React.useMemo(() => {
    const datesMap: Record<string, { date: string; sales: number }> = {};
    
    // Last 30 days template
    const dates = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(2026, 6, 15 - i); // Starting July 15, 2026 backwards
      return d.toISOString().split('T')[0];
    }).reverse();

    dates.forEach(date => {
      datesMap[date] = { date, sales: 0 };
    });

    orders.forEach(o => {
      if (o.status === 'Paid' && datesMap[o.date]) {
        datesMap[o.date].sales += o.amount;
      }
    });

    return Object.values(datesMap);
  }, [orders]);

  // Group sales by category for PieChart
  const salesByCategory = React.useMemo(() => {
    const categories: Record<string, number> = {};
    products.forEach(p => {
      categories[p.category] = (categories[p.category] || 0) + (p.salesCount * p.price);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Get Top Products for BarChart
  const topProducts = React.useMemo(() => {
    return [...products]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
  }, [products]);

  // Active integrations count
  const activeIntegrationsCount = integrations.filter(i => i.status === 'connected').length;

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  }

  const COLORS = ['#141414', '#3b82f6', '#10b981', '#f59e0b', '#64748b'];

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard-container">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5" id="kpi-grid">
        {/* Revenue Card */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none flex flex-col justify-between" id="kpi-revenue">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Total Revenue</p>
              <h3 className="text-3xl font-bold text-[#141414] mt-1.5 tracking-tighter font-mono">
                {currency}{totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="p-1.5 bg-[#141414] text-[#E4E3E0] border border-[#141414]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          {/* Sparkline Trend */}
          <div className="h-10 w-full my-3" id="revenue-sparkline">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineSalesData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id="colorSparkline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip
                  formatter={(value: any) => [`${currency}${value.toLocaleString()}`, 'Revenue']}
                  labelFormatter={(label: any) => formatDate(label)}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #141414', 
                    borderRadius: '0px', 
                    fontSize: '9px', 
                    fontFamily: 'monospace', 
                    textTransform: 'uppercase',
                    padding: '4px 8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#141414" 
                  strokeWidth={1.5} 
                  fillOpacity={1} 
                  fill="url(#colorSparkline)" 
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between mt-2 border-t border-dashed border-[#141414]/15 pt-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-green-700 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
            {onAskAi && (
              <button 
                onClick={() => onAskAi(`Explain our total net revenue performance of ${currency}${totalRevenue.toLocaleString()}. What key products or dates drove this performance, and what should we optimize next?`)}
                className="text-[9px] font-mono font-bold uppercase text-[#141414] hover:underline flex items-center gap-1 cursor-pointer bg-[#F0EFED] border border-[#141414]/20 px-2.5 py-0.5"
              >
                ✨ Explain
              </button>
            )}
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none flex flex-col justify-between" id="kpi-orders">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Total Orders</p>
              <h3 className="text-3xl font-bold text-[#141414] mt-1.5 tracking-tighter font-mono">{orders.length}</h3>
            </div>
            <div className="p-1.5 bg-[#141414] text-[#E4E3E0] border border-[#141414]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-dashed border-[#141414]/15 pt-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-sky-700 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+8.2%</span>
              <span className="text-slate-400 font-normal">vs last week</span>
            </div>
            {onAskAi && (
              <button 
                onClick={() => onAskAi(`Explain our order trends. We have ${orders.length} total orders. How does this volume distribute across days and what triggers peak volume?`)}
                className="text-[9px] font-mono font-bold uppercase text-[#141414] hover:underline flex items-center gap-1 cursor-pointer bg-[#F0EFED] border border-[#141414]/20 px-2.5 py-0.5"
              >
                ✨ Explain
              </button>
            )}
          </div>
        </div>

        {/* Customers Card */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none flex flex-col justify-between" id="kpi-customers">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Active Customers</p>
              <h3 className="text-3xl font-bold text-[#141414] mt-1.5 tracking-tighter font-mono">{activeCustomersCount}</h3>
            </div>
            <div className="p-1.5 bg-[#141414] text-[#E4E3E0] border border-[#141414]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-dashed border-[#141414]/15 pt-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-indigo-700 font-bold">
              <span>{activeCustomersCount} Active Clients</span>
              <span className="text-slate-400 font-normal ml-1">waiting</span>
            </div>
            {onAskAi && (
              <button 
                onClick={() => onAskAi(`Analyze our customers list. Tell me who our high-value VIP customers are, and draft a plan to convert the ${customers.length - activeCustomersCount} waiting leads.`)}
                className="text-[9px] font-mono font-bold uppercase text-[#141414] hover:underline flex items-center gap-1 cursor-pointer bg-[#F0EFED] border border-[#141414]/20 px-2.5 py-0.5"
              >
                ✨ Explain
              </button>
            )}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none flex flex-col justify-between" id="kpi-aov">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Average Order (AOV)</p>
              <h3 className="text-3xl font-bold text-[#141414] mt-1.5 tracking-tighter font-mono">
                {currency}{averageOrderValue.toLocaleString()}
              </h3>
            </div>
            <div className="p-1.5 bg-[#141414] text-[#E4E3E0] border border-[#141414]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 border-t border-dashed border-[#141414]/15 pt-2.5">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-green-700 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+5.1%</span>
              <span className="text-slate-400 font-normal">organic trend</span>
            </div>
            {onAskAi && (
              <button 
                onClick={() => onAskAi(`Explain our Average Order Value of ${currency}${averageOrderValue.toLocaleString()}. How does it compare to product prices and what are some actionable bundle strategies to raise it?`)}
                className="text-[9px] font-mono font-bold uppercase text-[#141414] hover:underline flex items-center gap-1 cursor-pointer bg-[#F0EFED] border border-[#141414]/20 px-2.5 py-0.5"
              >
                ✨ Explain
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-grid">
        
        {/* Sales Trend Line Chart */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none lg:col-span-2 flex flex-col justify-between" id="chart-sales-trend">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#141414]/10 pb-4 mb-4 gap-2">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414]">Sales Velocity & Trend</h4>
              <p className="text-[10px] uppercase text-slate-500 mt-1">Live updates from active payment webhooks</p>
            </div>
            <span className="text-[10px] font-mono uppercase border border-[#141414] bg-[#F0EFED] text-[#141414] px-2.5 py-1 font-semibold flex items-center gap-1.5 rounded-none">
              <Clock className="w-3.5 h-3.5" /> Updated Live
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDate}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#141414" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#141414" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#141414" strokeOpacity={0.15} />
                <XAxis dataKey="date" stroke="#141414" strokeOpacity={0.6} fontSize={10} tickLine={false} />
                <YAxis 
                  stroke="#141414" 
                  strokeOpacity={0.6}
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${currency}${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
                />
                <Tooltip 
                  formatter={(value: any) => [`${currency}${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #141414', borderRadius: '0px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#141414" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution Pie Chart */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none flex flex-col justify-between" id="chart-category-distribution">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414] border-b border-[#141414]/10 pb-4 mb-2">Revenue by Category</h4>
          <div className="h-56 flex-1 relative flex items-center justify-center">
            {salesByCategory.length === 0 ? (
              <p className="text-xs text-slate-400">No category sales recorded yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `${currency}${value.toLocaleString()}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #141414', borderRadius: '0px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-mono uppercase pt-3 border-t border-[#141414]/10" id="pie-chart-legend">
            {salesByCategory.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 border border-[#141414]" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-500 truncate max-w-[85px]">{item.name}</span>
                <span className="font-bold text-[#141414] ml-auto">{currency}{Math.round(item.value / 1000)}k</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-operations-grid">
        {/* Top Products Bar Chart */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none lg:col-span-2 flex flex-col justify-between" id="chart-top-products">
          <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414] border-b border-[#141414]/10 pb-4 mb-4">Top Selling Products</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="2 2" horizontal={false} stroke="#141414" strokeOpacity={0.15} />
                <XAxis type="number" stroke="#141414" strokeOpacity={0.6} fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#141414" strokeOpacity={0.6} fontSize={10} tickLine={false} width={120} />
                <Tooltip 
                  formatter={(value: any) => [value, 'Units Sold']}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #141414', borderRadius: '0px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
                <Bar dataKey="salesCount" fill="#141414" radius={[0, 0, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Inventory & Integrations Alert Centre */}
        <div className="bg-white p-5 border border-[#141414] rounded-none shadow-none flex flex-col justify-between" id="dashboard-alerts">
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414] border-b border-[#141414]/10 pb-4 mb-4">Urgent Actions Required</h4>
            
            <div className="space-y-4" id="alerts-list">
              {/* Stock Alerts */}
              {lowStockItems.length === 0 ? (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-[#141414] text-[#141414] rounded-none text-xs">
                  <CheckCircle className="w-4 h-4 text-[#141414] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px] font-mono">Inventory Healthy</span>
                    All catalog products are currently stocked within parameters.
                  </div>
                </div>
              ) : (
                lowStockItems.slice(0, 2).map(item => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-[#141414] text-[#141414] rounded-none text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-bold block uppercase tracking-wider text-[10px] font-mono">{item.name}</span>
                      {item.stock === 0 ? (
                        <span className="text-red-600 font-bold font-mono uppercase tracking-wider text-[9px] block mt-0.5">⚠️ Out of Stock</span>
                      ) : (
                        <span className="font-mono text-[10px]">Restock suggested: Only {item.stock} units left</span>
                      )}
                      <span className="block text-slate-500 text-[9px] font-mono uppercase tracking-wider mt-1">SKU: {item.sku} · Cost: {currency}{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}

              {/* Integration Alert */}
              {activeIntegrationsCount === 0 ? (
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-[#141414] text-[#141414] rounded-none text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px] font-mono">Integrations Offline</span>
                    Hook up your Paystack, Shopify, or Google Sheets callbacks to stream events directly into state.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-[#141414] text-[#141414] rounded-none text-xs">
                  <CheckCircle className="w-4 h-4 text-[#141414] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px] font-mono">{activeIntegrationsCount} Connected Pipelines</span>
                    Listening to incoming commerce events from {integrations.filter(i => i.status === 'connected').map(i => i.name).join(', ')}.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#141414]/15 text-center text-[10px] font-mono uppercase text-slate-500">
            Copilot Query: <span className="text-[#141414] underline block mt-1 cursor-pointer">"Draft Restock Order for low inventory"</span>
          </div>
        </div>
      </div>
    </div>
  );
}
