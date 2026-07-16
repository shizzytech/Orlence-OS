import { BusinessData } from '../types';

export const SAMPLES: Record<string, BusinessData> = {
  sartorial_africa: {
    businessName: "Sartorial Africa",
    currency: "₦",
    products: [
      { id: "P01", name: "Agbada Elite Set", sku: "AGB-ELT-001", price: 150000, stock: 4, category: "Native Wear", salesCount: 14 },
      { id: "P02", name: "Ankara Casual Shirt", sku: "ANK-CSL-002", price: 35000, stock: 25, category: "Casual", salesCount: 38 },
      { id: "P03", name: "Senator Suit Classic", sku: "SEN-CLS-003", price: 85000, stock: 2, category: "Formal Wear", salesCount: 22 },
      { id: "P04", name: "Aso Oke Cap Handwoven", sku: "ASO-CAP-004", price: 20000, stock: 45, category: "Accessories", salesCount: 65 },
      { id: "P05", name: "Adire Silk Kaftan", sku: "ADR-SLK-005", price: 95000, stock: 0, category: "Native Wear", salesCount: 19 },
      { id: "P06", name: "Kente Blazer", sku: "KEN-BLZ-006", price: 110000, stock: 8, category: "Formal Wear", salesCount: 7 }
    ],
    customers: [
      { id: "C01", name: "Olumide Awosika", email: "olumide@awosikacapital.com", phone: "+234 803 111 2222", country: "Nigeria", totalSpent: 385000, totalOrders: 3, lastActive: "2026-07-14" },
      { id: "C02", name: "Chioma Nze", email: "chioma.nze@lhl.ng", phone: "+234 812 345 6789", country: "Nigeria", totalSpent: 265000, totalOrders: 2, lastActive: "2026-07-13" },
      { id: "C03", name: "Babajide Soyinka", email: "jide.soyinka@gmail.com", phone: "+234 905 555 1234", country: "Nigeria", totalSpent: 170000, totalOrders: 1, lastActive: "2026-06-15" },
      { id: "C04", name: "Fatima Yusuf", email: "fatima.y@yusufgroup.ng", phone: "+234 809 999 8888", country: "Nigeria", totalSpent: 415000, totalOrders: 4, lastActive: "2026-07-15" },
      { id: "C05", name: "Kofi Mensah", email: "kofi@mensahlegal.gh", phone: "+233 24 455 6677", country: "Ghana", totalSpent: 110000, totalOrders: 1, lastActive: "2026-07-10" },
      { id: "C06", name: "Adebayo Adesina", email: "adesina.adebayo@outlook.com", phone: "+234 802 777 9999", country: "Nigeria", totalSpent: 55000, totalOrders: 2, lastActive: "2026-07-02" },
      { id: "C07", name: "Nneka Okafor", email: "nneka@okaforboutique.com", phone: "+234 803 888 7777", country: "Nigeria", totalSpent: 0, totalOrders: 0, lastActive: "2026-05-10" } // Inactive for >30 days
    ],
    orders: [
      { id: "ORD-1001", date: "2026-07-15", customerName: "Fatima Yusuf", customerEmail: "fatima.y@yusufgroup.ng", products: ["Agbada Elite Set", "Aso Oke Cap Handwoven"], amount: 170000, paymentMethod: "Paystack", status: "Paid" },
      { id: "ORD-1002", date: "2026-07-14", customerName: "Olumide Awosika", customerEmail: "olumide@awosikacapital.com", products: ["Senator Suit Classic", "Ankara Casual Shirt"], amount: 120000, paymentMethod: "Paystack", status: "Paid" },
      { id: "ORD-1003", date: "2026-07-13", customerName: "Chioma Nze", customerEmail: "chioma.nze@lhl.ng", products: ["Adire Silk Kaftan", "Ankara Casual Shirt"], amount: 130000, paymentMethod: "Paystack", status: "Paid" },
      { id: "ORD-1004", date: "2026-07-12", customerName: "Babajide Soyinka", customerEmail: "jide.soyinka@gmail.com", products: ["Agbada Elite Set", "Aso Oke Cap Handwoven"], amount: 170000, paymentMethod: "Bank Transfer", status: "Paid" },
      { id: "ORD-1005", date: "2026-07-10", customerName: "Kofi Mensah", customerEmail: "kofi@mensahlegal.gh", products: ["Kente Blazer"], amount: 110000, paymentMethod: "Flutterwave", status: "Paid" },
      { id: "ORD-1006", date: "2026-07-08", customerName: "Olumide Awosika", customerEmail: "olumide@awosikacapital.com", products: ["Ankara Casual Shirt", "Aso Oke Cap Handwoven"], amount: 55000, paymentMethod: "Paystack", status: "Paid" },
      { id: "ORD-1007", date: "2026-07-05", customerName: "Chioma Nze", customerEmail: "chioma.nze@lhl.ng", products: ["Adire Silk Kaftan", "Aso Oke Cap Handwoven"], amount: 135000, paymentMethod: "Bank Transfer", status: "Paid" },
      { id: "ORD-1008", date: "2026-07-02", customerName: "Adebayo Adesina", customerEmail: "adesina.adebayo@outlook.com", products: ["Ankara Casual Shirt", "Aso Oke Cap Handwoven"], amount: 55000, paymentMethod: "Cash", status: "Paid" },
      { id: "ORD-1009", date: "2026-06-28", customerName: "Fatima Yusuf", customerEmail: "fatima.y@yusufgroup.ng", products: ["Senator Suit Classic", "Ankara Casual Shirt", "Aso Oke Cap Handwoven"], amount: 140000, paymentMethod: "Paystack", status: "Paid" },
      { id: "ORD-1010", date: "2026-06-25", customerName: "Olumide Awosika", customerEmail: "olumide@awosikacapital.com", products: ["Agbada Elite Set", "Aso Oke Cap Handwoven"], amount: 210000, paymentMethod: "Paystack", status: "Paid" },
      { id: "ORD-1011", date: "2026-06-20", customerName: "Fatima Yusuf", customerEmail: "fatima.y@yusufgroup.ng", products: ["Ankara Casual Shirt"], amount: 105000, paymentMethod: "Paystack", status: "Paid" }
    ]
  },
  kigali_coffee: {
    businessName: "Kigali Coffee Co.",
    currency: "RWF",
    products: [
      { id: "K01", name: "Arabica Medium Roast 1kg", sku: "KIG-ARA-MED", price: 18000, stock: 120, category: "Whole Beans", salesCount: 210 },
      { id: "K02", name: "Peaberry Single Origin 500g", sku: "KIG-PBY-SGL", price: 12000, stock: 15, category: "Whole Beans", salesCount: 95 },
      { id: "K03", name: "French Press Classic", sku: "KIG-EQP-FRP", price: 25000, stock: 3, category: "Equipment", salesCount: 40 },
      { id: "K04", name: "Drip Brew Pack (x10)", sku: "KIG-DRP-PK10", price: 7500, stock: 85, category: "Drip Coffee", salesCount: 140 },
      { id: "K05", name: "Commercial Burr Grinder", sku: "KIG-EQP-GRD", price: 320000, stock: 1, category: "Equipment", salesCount: 4 }
    ],
    customers: [
      { id: "KC01", name: "Marie Claire", email: "marie@kigalibites.rw", phone: "+250 788 123 456", country: "Rwanda", totalSpent: 536000, totalOrders: 4, lastActive: "2026-07-15" },
      { id: "KC02", name: "Jean-Paul Nkurunziza", email: "jp.nku@rubavulodging.rw", phone: "+250 783 999 888", country: "Rwanda", totalSpent: 320000, totalOrders: 1, lastActive: "2026-07-11" },
      { id: "KC03", name: "Sonia Gakwerere", email: "sonia@gakwerere.rw", phone: "+250 785 444 333", country: "Rwanda", totalSpent: 85000, totalOrders: 2, lastActive: "2026-07-01" },
      { id: "KC04", name: "David Peterson", email: "david@expateats.rw", phone: "+250 782 555 666", country: "Rwanda", totalSpent: 45000, totalOrders: 3, lastActive: "2026-06-10" } // >30 days inactive
    ],
    orders: [
      { id: "KC-4001", date: "2026-07-15", customerName: "Marie Claire", customerEmail: "marie@kigalibites.rw", products: ["Arabica Medium Roast 1kg", "French Press Classic"], amount: 115000, paymentMethod: "Flutterwave", status: "Paid" },
      { id: "KC-4002", date: "2026-07-13", customerName: "Marie Claire", customerEmail: "marie@kigalibites.rw", products: ["Arabica Medium Roast 1kg", "Peaberry Single Origin 500g"], amount: 156000, paymentMethod: "Flutterwave", status: "Paid" },
      { id: "KC-4003", date: "2026-07-11", customerName: "Jean-Paul Nkurunziza", customerEmail: "jp.nku@rubavulodging.rw", products: ["Commercial Burr Grinder"], amount: 320000, paymentMethod: "Bank Transfer", status: "Paid" },
      { id: "KC-4004", date: "2026-07-08", customerName: "Marie Claire", customerEmail: "marie@kigalibites.rw", products: ["Arabica Medium Roast 1kg"], amount: 180000, paymentMethod: "Flutterwave", status: "Paid" },
      { id: "KC-4005", date: "2026-07-05", customerName: "Sonia Gakwerere", customerEmail: "sonia@gakwerere.rw", products: ["Peaberry Single Origin 500g", "Drip Brew Pack (x10)"], amount: 60000, paymentMethod: "Cash", status: "Paid" },
      { id: "KC-4006", date: "2026-07-01", customerName: "Sonia Gakwerere", customerEmail: "sonia@gakwerere.rw", products: ["Drip Brew Pack (x10)"], amount: 25000, paymentMethod: "Flutterwave", status: "Paid" },
      { id: "KC-4007", date: "2026-06-25", customerName: "David Peterson", customerEmail: "david@expateats.rw", products: ["Arabica Medium Roast 1kg"], amount: 18000, paymentMethod: "Flutterwave", status: "Paid" }
    ]
  },
  afrobeats_tech: {
    businessName: "AfroBeats Tech",
    currency: "$",
    products: [
      { id: "T01", name: "Premium Noise-Cancelling Earbuds", sku: "ABT-EAR-001", price: 85, stock: 50, category: "Audio", salesCount: 142 },
      { id: "T02", name: "Fast Charge GaN Charger 65W", sku: "ABT-CHG-002", price: 30, stock: 120, category: "Accessories", salesCount: 310 },
      { id: "T03", name: "MagSafe Wooden Desk Stand", sku: "ABT-SND-003", price: 45, stock: 0, category: "Desk Setup", salesCount: 54 },
      { id: "T04", name: "Mechanical Bluetooth Keyboard", sku: "ABT-KEY-004", price: 110, stock: 18, category: "Peripherals", salesCount: 88 },
      { id: "T05", name: "Ultra-Wide RGB Desk Mat", sku: "ABT-MAT-005", price: 25, stock: 75, category: "Desk Setup", salesCount: 195 }
    ],
    customers: [
      { id: "TC01", name: "Nnamdi Kanu", email: "nnamdi.kanu@techcreatives.io", phone: "+234 811 555 6666", country: "Nigeria", totalSpent: 360, totalOrders: 3, lastActive: "2026-07-14" },
      { id: "TC02", name: "Farah Abdi", email: "farah@abdistudios.ke", phone: "+254 722 000 111", country: "Kenya", totalSpent: 220, totalOrders: 2, lastActive: "2026-07-15" },
      { id: "TC03", name: "Elowen Vance", email: "evance@siliconvalley.co", phone: "+1 415 555 0192", country: "United States", totalSpent: 110, totalOrders: 1, lastActive: "2026-07-05" },
      { id: "TC04", name: "Kwame Appiah", email: "kwame.appiah@accrahub.com", phone: "+233 20 123 4567", country: "Ghana", totalSpent: 55, totalOrders: 2, lastActive: "2026-06-11" } // >30 days inactive
    ],
    orders: [
      { id: "ABT-9001", date: "2026-07-15", customerName: "Farah Abdi", customerEmail: "farah@abdistudios.ke", products: ["Premium Noise-Cancelling Earbuds", "Fast Charge GaN Charger 65W"], amount: 115, paymentMethod: "Shopify Gateway", status: "Paid" },
      { id: "ABT-9002", date: "2026-07-14", customerName: "Nnamdi Kanu", customerEmail: "nnamdi.kanu@techcreatives.io", products: ["Mechanical Bluetooth Keyboard", "Ultra-Wide RGB Desk Mat"], amount: 135, paymentMethod: "Paystack", status: "Paid" },
      { id: "ABT-9003", date: "2026-07-10", customerName: "Farah Abdi", customerEmail: "farah@abdistudios.ke", products: ["Mechanical Bluetooth Keyboard"], amount: 110, paymentMethod: "Shopify Gateway", status: "Paid" },
      { id: "ABT-9004", date: "2026-07-08", customerName: "Nnamdi Kanu", customerEmail: "nnamdi.kanu@techcreatives.io", products: ["Premium Noise-Cancelling Earbuds"], amount: 85, paymentMethod: "Paystack", status: "Paid" },
      { id: "ABT-9005", date: "2026-07-05", customerName: "Elowen Vance", customerEmail: "evance@siliconvalley.co", products: ["Mechanical Bluetooth Keyboard"], amount: 110, paymentMethod: "Shopify Gateway", status: "Paid" },
      { id: "ABT-9006", date: "2026-07-02", customerName: "Nnamdi Kanu", customerEmail: "nnamdi.kanu@techcreatives.io", products: ["Fast Charge GaN Charger 65W", "Ultra-Wide RGB Desk Mat"], amount: 55, paymentMethod: "Paystack", status: "Paid" },
      { id: "ABT-9007", date: "2026-06-25", customerName: "Kwame Appiah", customerEmail: "kwame.appiah@accrahub.com", products: ["Fast Charge GaN Charger 65W"], amount: 30, paymentMethod: "Flutterwave", status: "Paid" }
    ]
  }
};
