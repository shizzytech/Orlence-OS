import React, { useState } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Database, 
  Check, 
  Download, 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  Users,
  Briefcase
} from 'lucide-react';
import { BusinessData, Order, Customer, Product } from '../types';
import { SAMPLES } from '../data/samples';

interface DataManagerProps {
  businessData: BusinessData;
  setBusinessData: React.Dispatch<React.SetStateAction<BusinessData>>;
  onPresetChanged: () => void;
}

export default function DataManager({ businessData, setBusinessData, onPresetChanged }: DataManagerProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'view_tables'>('presets');
  const [dragActive, setDragActive] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCSVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCSVFile(e.target.files[0]);
    }
  };

  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const rows = parseCSV(text);
        if (rows.length === 0) throw new Error("CSV file appears to be empty.");

        // Detect CSV type based on headers
        const firstRow = rows[0];
        const headers = Object.keys(firstRow).map(h => h.toLowerCase());

        if (headers.includes('amount') || headers.includes('paymentmethod')) {
          // Parse as Orders
          const newOrders: Order[] = rows.map((r, idx) => ({
            id: r.id || r.orderid || `ORD-UP-${1000 + idx}`,
            date: r.date || r.orderdate || new Date().toISOString().split('T')[0],
            customerName: r.customername || r.name || r.customer || "Unknown Customer",
            customerEmail: r.customeremail || r.email || "no-email@business.com",
            products: r.products ? r.products.split(';').map((p: string) => p.trim()) : ["Custom Upload Product"],
            amount: parseFloat(r.amount || r.total || "0") || 1000,
            paymentMethod: (r.paymentmethod || "Paystack") as any,
            status: (r.status || "Paid") as any
          }));

          setBusinessData(prev => ({
            ...prev,
            orders: [...newOrders, ...prev.orders].slice(0, 50) // Cap to keep responsive
          }));
          setUploadMessage({ type: 'success', text: `Successfully parsed and imported ${newOrders.length} transaction orders!` });
        } else if (headers.includes('totalspent') || headers.includes('email') && headers.includes('phone')) {
          // Parse as Customers
          const newCustomers: Customer[] = rows.map((r, idx) => ({
            id: r.id || r.customerid || `CUST-UP-${1000 + idx}`,
            name: r.name || r.customername || "Valued Lead",
            email: r.email || r.customeremail || `lead-${idx}@upload.com`,
            phone: r.phone || r.telephone || "+234 800 000 0000",
            country: r.country || "Nigeria",
            totalSpent: parseFloat(r.totalspent || r.spent || "0") || 0,
            totalOrders: parseInt(r.totalorders || r.orders || "0") || 0,
            lastActive: r.lastactive || r.active || new Date().toISOString().split('T')[0]
          }));

          setBusinessData(prev => ({
            ...prev,
            customers: [...newCustomers, ...prev.customers].slice(0, 50)
          }));
          setUploadMessage({ type: 'success', text: `Successfully parsed and imported ${newCustomers.length} customer profiles!` });
        } else if (headers.includes('sku') || headers.includes('stock')) {
          // Parse as Products / Inventory
          const newProducts: Product[] = rows.map((r, idx) => ({
            id: r.id || r.productid || `PROD-UP-${1000 + idx}`,
            name: r.name || r.productname || "Custom Merch",
            sku: r.sku || `SKU-UP-${100 + idx}`,
            price: parseFloat(r.price || "0") || 5000,
            stock: parseInt(r.stock || r.quantity || "0") || 0,
            category: r.category || "General",
            salesCount: parseInt(r.salescount || r.sold || "0") || 0
          }));

          setBusinessData(prev => ({
            ...prev,
            products: [...newProducts, ...prev.products]
          }));
          setUploadMessage({ type: 'success', text: `Successfully parsed and updated ${newProducts.length} product inventories!` });
        } else {
          throw new Error("Could not detect CSV layout. Please ensure headers contain 'amount' (for orders), 'phone' (for customers), or 'sku' (for inventory).");
        }
      } catch (err: any) {
        setUploadMessage({ type: 'error', text: err.message || "An error occurred parsing the CSV. Please verify formatting." });
      }
    };
    reader.readAsText(file);
  };

  // Simple CSV text parser supporting quoted cells
  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/);
    if (lines.length === 0 || !lines[0].trim()) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const results: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quotes with commas inside them correctly
      const row: string[] = [];
      let inQuotes = false;
      let currentCell = '';

      for (let charIdx = 0; charIdx < line.length; charIdx++) {
        const char = line[charIdx];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentCell.trim().replace(/^["']|["']$/g, ''));
          currentCell = '';
        } else {
          currentCell += char;
        }
      }
      row.push(currentCell.trim().replace(/^["']|["']$/g, ''));

      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        if (header) {
          obj[header] = row[index] || '';
        }
      });
      results.push(obj);
    }
    return results;
  };

  const handleSelectPreset = (key: string) => {
    setBusinessData(SAMPLES[key]);
    setUploadMessage({ type: 'success', text: `Switched business workspace to ${SAMPLES[key].businessName}!` });
    onPresetChanged();
  };

  // Create downloadable template CSV
  const downloadTemplate = (type: 'orders' | 'customers' | 'products') => {
    let headers = '';
    let rows = '';
    
    if (type === 'orders') {
      headers = 'id,date,customerName,customerEmail,products,amount,paymentMethod,status';
      rows = 'ORD-2001,2026-07-15,Adebisi Kunle,adebisi@kunle.com,"Agbada Elite Set; Aso Oke Cap",170000,Paystack,Paid\nORD-2002,2026-07-14,Amina Bello,amina@belloboutique.ng,"Ankara Casual Shirt",35000,Paystack,Paid';
    } else if (type === 'customers') {
      headers = 'id,name,email,phone,country,totalSpent,totalOrders,lastActive';
      rows = 'C-309,Isioma Cole,isioma@coledigital.ng,+234 803 211 4455,Nigeria,220000,3,2026-07-15\nC-310,Kofi Mensah,kofi@mensahlegal.gh,+233 24 455 6677,Ghana,110000,1,2026-07-10';
    } else {
      headers = 'id,name,sku,price,stock,category,salesCount';
      rows = 'P-501,Luxury Lace Kaftan,LAC-KFT-01,95000,14,Native Wear,8\nP-502,Senator Set Classic,SEN-SET-02,85000,3,Formal Wear,15';
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-[#141414] rounded-none shadow-none overflow-hidden animate-fade-in" id="data-manager-panel">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#141414] bg-[#F0EFED]" id="data-tabs">
        <button
          onClick={() => { setActiveTab('presets'); setUploadMessage(null); }}
          className={`px-6 py-4 text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'presets' 
              ? 'border-[#141414] text-[#141414] bg-white font-black' 
              : 'border-transparent text-slate-500 hover:text-[#141414]'
          }`}
        >
          <Database className="w-4 h-4" /> Core Presets (African MVP)
        </button>
        <button
          onClick={() => { setActiveTab('upload'); setUploadMessage(null); }}
          className={`px-6 py-4 text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'upload' 
              ? 'border-[#141414] text-[#141414] bg-white font-black' 
              : 'border-transparent text-slate-500 hover:text-[#141414]'
          }`}
        >
          <Upload className="w-4 h-4" /> CSV Ingress
        </button>
        <button
          onClick={() => { setActiveTab('view_tables'); setUploadMessage(null); }}
          className={`px-6 py-4 text-xs font-mono uppercase font-bold tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'view_tables' 
              ? 'border-[#141414] text-[#141414] bg-white font-black' 
              : 'border-transparent text-slate-500 hover:text-[#141414]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Memory Tables
        </button>
      </div>

      <div className="p-6">
        {/* Status Alerts */}
        {uploadMessage && (
          <div className={`p-4 mb-6 rounded-none text-xs flex items-center gap-3 border border-[#141414] font-mono ${
            uploadMessage.type === 'success' 
              ? 'bg-green-50 text-[#141414]' 
              : 'bg-amber-50 text-[#141414]'
          }`}>
            <span className="font-bold uppercase tracking-wider">{uploadMessage.type}:</span>
            <span>{uploadMessage.text}</span>
          </div>
        )}

        {/* 1. PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414]">Select Sandbox Workspace</h4>
              <p className="text-[11px] text-slate-500 uppercase mt-1">
                Orlence OS supports immediate dataset hot-swapping. Change your sector focus to repopulate active memory banks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Presets Loops */}
              {Object.entries(SAMPLES).map(([key, data]) => {
                const isActive = businessData.businessName === data.businessName;
                return (
                  <div 
                    key={key}
                    onClick={() => handleSelectPreset(key)}
                    className={`p-5 rounded-none border cursor-pointer transition-all flex flex-col justify-between h-56 relative ${
                      isActive 
                        ? 'border-2 border-[#141414] bg-[#F0EFED]' 
                        : 'border-[#141414] hover:bg-[#F0EFED]/30 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">{key === 'sartorial_africa' ? '🇳🇬' : key === 'kigali_coffee' ? '🇷🇼' : '🇰🇪'}</span>
                        {isActive && (
                          <span className="bg-[#141414] text-[#E4E3E0] p-1 border border-[#141414] rounded-none">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-[#141414] text-base mt-3">{data.businessName}</h5>
                      <p className="text-xs text-slate-500 mt-1">
                        {key === 'sartorial_africa' ? 'Lagos Luxury Native & Formal Wear Store.' : key === 'kigali_coffee' ? 'Kigali Gourmet Whole-Bean & Equipment Wholesale.' : 'Nairobi Online Gadget and Accessory E-Commerce Store.'}
                      </p>
                    </div>

                    <div className="border-t border-[#141414]/15 pt-3 flex justify-between items-center text-[10px] font-mono uppercase text-slate-500">
                      <span>{data.orders.length} Orders</span>
                      <span>·</span>
                      <span>{data.products.length} Products</span>
                      <span>·</span>
                      <span className="font-bold text-[#141414]">{data.currency}{(data.orders.reduce((sum, o) => sum + o.amount, 0)).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#F0EFED] p-4.5 rounded-none border border-[#141414] flex items-start gap-3.5">
              <Sparkles className="w-5 h-5 text-[#141414] shrink-0 mt-0.5 animate-pulse" />
              <div className="text-xs leading-relaxed text-[#141414]">
                <span className="font-bold text-[10px] font-mono uppercase block mb-1">Sandbox Persistence Model</span>
                Orlence OS operates as a real-time reactive sandbox. Before executing webhooks or live merchant OAuth credentials, founders can load simulated workspaces or ingest raw CSV logs. This provides safe analytical testing environments instantly.
              </div>
            </div>
          </div>
        )}

        {/* 2. UPLOAD CSV TAB */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414]">Manual CSV Spreadsheet Ingress</h4>
              <p className="text-[11px] text-slate-500 uppercase mt-1">
                Drag-and-drop or select transaction, customer, or inventory logs exported from Stripe, Paystack, Flutterwave, or custom spreadsheets.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border border-dashed rounded-none p-10 text-center flex flex-col items-center justify-center transition-all min-h-64 ${
                dragActive 
                  ? 'border-[#141414] bg-[#F0EFED]' 
                  : 'border-[#141414] hover:bg-[#F0EFED]/20 bg-white'
              }`}
            >
              <div className="p-4 bg-white rounded-none border border-[#141414] text-[#141414] mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-xs font-mono uppercase tracking-wider font-bold text-[#141414]">Drag and drop your exported CSV files here</p>
              <p className="text-[10px] uppercase text-slate-500 mt-2 max-w-sm font-mono">
                System auto-detects Ledger format based on column keys (e.g. 'amount', 'sku', 'phone')
              </p>
              
              <label className="mt-5 cursor-pointer bg-[#141414] hover:bg-black text-[#E4E3E0] font-mono uppercase text-[10px] px-4 py-2.5 rounded-none border border-[#141414] tracking-wider transition-all flex items-center gap-1.5">
                Browse Files
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>

            {/* Template Downloads */}
            <div className="space-y-3">
              <h5 className="text-xs font-mono uppercase tracking-widest text-[#141414]">Starter Templates</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => downloadTemplate('orders')}
                  className="p-3 bg-white border border-[#141414] rounded-none hover:bg-[#F0EFED] transition-colors flex justify-between items-center text-[10px] font-mono uppercase text-slate-600 cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-bold text-[#141414]">
                    <ShoppingBag className="w-4 h-4" /> Orders_Ledger.csv
                  </span>
                  <Download className="w-4 h-4 text-[#141414]" />
                </button>
                <button 
                  onClick={() => downloadTemplate('customers')}
                  className="p-3 bg-white border border-[#141414] rounded-none hover:bg-[#F0EFED] transition-colors flex justify-between items-center text-[10px] font-mono uppercase text-slate-600 cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-bold text-[#141414]">
                    <Users className="w-4 h-4" /> Customers_Directory.csv
                  </span>
                  <Download className="w-4 h-4 text-[#141414]" />
                </button>
                <button 
                  onClick={() => downloadTemplate('products')}
                  className="p-3 bg-white border border-[#141414] rounded-none hover:bg-[#F0EFED] transition-colors flex justify-between items-center text-[10px] font-mono uppercase text-slate-600 cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-bold text-[#141414]">
                    <Briefcase className="w-4 h-4" /> Inventory_SKUs.csv
                  </span>
                  <Download className="w-4 h-4 text-[#141414]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. VIEW ACTIVE TABLES TAB */}
        {activeTab === 'view_tables' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#141414]">Active Memory Database Preview</h4>
                <p className="text-[11px] text-slate-500 uppercase mt-1">
                  Viewing live registers for <span className="font-bold text-[#141414]">{businessData.businessName}</span>.
                </p>
              </div>
            </div>

            {/* Inventory Register */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[#141414]" /> Products Catalog ({businessData.products.length} records)
              </h5>
              <div className="overflow-x-auto border border-[#141414] rounded-none">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F0EFED] border-b border-[#141414] text-slate-700 font-mono text-[10px] uppercase font-bold">
                      <th className="p-3">SKU</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">In Stock</th>
                      <th className="p-3 text-right">Units Sold</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[#141414] font-mono">
                    {businessData.products.slice(0, 5).map(item => (
                      <tr key={item.id} className="hover:bg-[#F0EFED]/20">
                        <td className="p-3 font-semibold">{item.sku}</td>
                        <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="p-3 text-slate-500 uppercase text-[10px]">{item.category}</td>
                        <td className="p-3 text-right">{businessData.currency}{item.price.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span className={`px-2 py-0.5 border border-[#141414] font-bold text-[9px] ${item.stock <= 5 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'}`}>
                            {item.stock}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">{item.salesCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Ledger Preview */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#141414]" /> Recent Order Transactions ({businessData.orders.length} records)
              </h5>
              <div className="overflow-x-auto border border-[#141414] rounded-none">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#F0EFED] border-b border-[#141414] text-slate-700 font-mono text-[10px] uppercase font-bold">
                      <th className="p-3">Tx Ref</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Items Included</th>
                      <th className="p-3 text-right">Total Amount</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[#141414] font-mono">
                    {businessData.orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-[#F0EFED]/20">
                        <td className="p-3 font-semibold">{order.id}</td>
                        <td className="p-3 text-slate-400 font-normal">{order.date}</td>
                        <td className="p-3">
                          <span className="font-bold block text-[#141414]">{order.customerName}</span>
                          <span className="text-[9px] text-slate-400 font-normal">{order.customerEmail}</span>
                        </td>
                        <td className="p-3 max-w-xs truncate text-slate-500" title={order.products.join(', ')}>{order.products.join(', ')}</td>
                        <td className="p-3 text-right font-bold">{businessData.currency}{order.amount.toLocaleString()}</td>
                        <td className="p-3 text-slate-500 uppercase text-[10px]">{order.paymentMethod}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 border border-[#141414] font-bold text-[9px] uppercase ${order.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
