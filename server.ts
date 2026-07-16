import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase JSON body limits for uploaded CSV payloads
app.use(express.json({ limit: "15mb" }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it to your secrets or .env file.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Full-stack API for FounderGPT conversation
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, businessData, integrations } = req.body;

    if (!businessData) {
      return res.status(400).json({ error: "No business data provided to FounderGPT analysis." });
    }

    const ai = getGeminiClient();

    // Context formatting for accurate data analysis
    const formattedProducts = businessData.products.map((p: any) => 
      `- ID: ${p.id}, Name: ${p.name}, SKU: ${p.sku}, Price: ${businessData.currency}${p.price.toLocaleString()}, Stock: ${p.stock}, Category: ${p.category}, Total Sales: ${p.salesCount}`
    ).join("\n");

    const formattedCustomers = businessData.customers.map((c: any) => 
      `- ID: ${c.id}, Name: ${c.name}, Email: ${c.email}, Phone: ${c.phone}, Country: ${c.country}, Total Spent: ${businessData.currency}${c.totalSpent.toLocaleString()}, Total Orders: ${c.totalOrders}, Last Active: ${c.lastActive}`
    ).join("\n");

    const formattedOrders = businessData.orders.map((o: any) => 
      `- ID: ${o.id}, Date: ${o.date}, Customer: ${o.customerName} (${o.customerEmail}), Products: [${o.products.join(", ")}], Amount: ${businessData.currency}${o.amount.toLocaleString()}, Payment: ${o.paymentMethod}, Status: ${o.status}`
    ).join("\n");

    const formattedIntegrations = integrations ? integrations.map((i: any) => 
      `- ${i.name} (${i.id}): Status: ${i.status}, Webhook URL: ${i.webhookUrl || 'None'}, Last Sync: ${i.lastSync || 'Never'}`
    ).join("\n") : "None";

    const systemInstruction = `You are FounderGPT, a elite, highly analytical AI Business Copilot and Advisor specialized in African and global retail, commerce, and startups.
Your goal is to provide concise, direct, numerically precise, and actionable answers to the founder's questions.

Present System Date is 2026-07-15. This is the absolute "today" reference:
- Yesterday was 2026-07-14.
- Inactive leads or customers (inactive for 30+ days) are those whose lastActive is older than 2026-06-15.
- Critical low stock products: stock <= 5 (and highlight out-of-stock items where stock is 0).

The active business is "${businessData.businessName}" with currency "${businessData.currency}".
Use the currency symbol "${businessData.currency}" in all calculated outputs.

Here is the exact live business snapshot:

=== PRODUCT CATALOG & INVENTORY ===
${formattedProducts}

=== CUSTOMERS COHORT ===
${formattedCustomers}

=== RECENT ORDERS & TRANSACTIONS ===
${formattedOrders}

=== LIVE SYSTEM INTEGRATIONS ===
${formattedIntegrations}

=== INSTRUCTIONS ===
1. Be extremely direct. Do not say "Based on the data..." or "Looking at your inventory...". Answer immediately with numbers and short tables where helpful.
2. If the user asks for sales yesterday or today, look up orders matching those dates and sum their amounts exactly.
3. If they ask about inactive leads, list their names, emails, and last active dates with a short recommendation.
4. If they ask for recommendations, suggest highly practical steps based on the data (e.g. "Adire Silk Kaftan is out of stock but has 19 total sales. Restock immediately!").
5. If they ask to generate professional documents (like invoices, weekly reports, or newsletters), draft them inside clean, beautiful Markdown panels. Include a clear, clean visual hierarchy.
6. Speak with encouraging, professional, data-driven authority. Do not hallucinate transactions. Use only the provided list.`;

    // Map conversation history to the Chat contents format
    // Simple format: Map history to simple conversation blocks
    const chatContents = messages.map((m: any) => ({
      role: m.sender === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));

    // Generate content using gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.2, // Lower temperature for high mathematical/analytical precision
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("FounderGPT Gemini Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during Gemini analysis." });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FounderGPT server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
