export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  products: string[];
  amount: number;
  paymentMethod: 'Paystack' | 'Flutterwave' | 'Bank Transfer' | 'Cash' | 'Shopify Gateway';
  status: 'Paid' | 'Pending' | 'Refunded';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  totalSpent: number;
  totalOrders: number;
  lastActive: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  salesCount: number;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'configuring';
  apiKey?: string;
  webhookUrl?: string;
  lastSync?: string;
  type: 'Commerce' | 'Payments' | 'Communication' | 'Accounting' | 'CRM' | 'Documents';
  unlocks: string[];
  stats?: {
    products?: number;
    orders?: number;
    customers?: number;
    revenue?: string;
  };
  memory?: string;
  health?: {
    status: 'Healthy' | 'Degraded' | 'Offline';
    webhook: 'Listening' | 'Offline';
    api: 'Connected' | 'Disconnected';
    rateLimit: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'download_report' | 'generate_invoice' | 'view_inventory';
    payload: any;
    label: string;
  };
}

export interface BusinessData {
  businessName: string;
  currency: string;
  orders: Order[];
  customers: Customer[];
  products: Product[];
}
