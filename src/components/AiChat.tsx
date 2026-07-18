import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Copy, Check, Download, CornerDownLeft, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, BusinessData, Integration } from '../types';

interface AiChatProps {
  businessData: BusinessData;
  integrations: Integration[];
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  pendingPrompt?: string | null;
  setPendingPrompt?: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function AiChat({ 
  businessData, 
  integrations, 
  chatHistory, 
  setChatHistory,
  pendingPrompt,
  setPendingPrompt
}: AiChatProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Trigger pending prompt from parent navigation
  useEffect(() => {
    if (pendingPrompt && setPendingPrompt) {
      handleSendMessage(pendingPrompt);
      setPendingPrompt(null);
    }
  }, [pendingPrompt]);

  // Dynamic suggested prompts based on the active dataset
  const suggestedPrompts = React.useMemo(() => {
    const defaultPrompts = [
      "Run a complete business health summary & give 3 actions.",
      "Show me my current inventory levels and stock bottlenecks.",
      "Calculate our customer lifetime value (LTV) and top shoppers."
    ];

    if (businessData.businessName === "Sartorial Africa") {
      return [
        "How many sales did we make yesterday?",
        "Who are our inactive leads (inactive for over 30 days)?",
        "Draft a professional email newsletter promoting Adire Silk.",
        "Give me a summary of our business health & 3 actions."
      ];
    } else if (businessData.businessName === "Kigali Coffee Co.") {
      return [
        "Compare Arabica vs Peaberry coffee roast performance.",
        "Draft a B2B wholesale invoice for Jean-Paul Nkurunziza.",
        "Are there any low-inventory equipment alerts?",
        "Summarize our wholesale coffee sales trends."
      ];
    } else if (businessData.businessName === "AfroBeats Tech") {
      return [
        "Show today's total revenue and average order value (AOV).",
        "Generate a report of product categories making the most sales.",
        "List all customers with more than 2 completed orders.",
        "What inventory items should we restock immediately?"
      ];
    }
    return defaultPrompts;
  }, [businessData]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatHistory, userMessage],
          businessData,
          integrations
        })
      });

      const data = await response.json();
      
      if (response.ok && data.text) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'The co-pilot was unable to synthesize a response.');
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ **Error:** ${err.message || "Failed to communicate with Orlence's server. Please verify your GEMINI_API_KEY in the Secrets panel."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    const currency = businessData.currency;
    const businessName = businessData.businessName;

    // Calculations
    const yesterdayStr = "2026-07-14";
    const yesterdayOrders = businessData.orders.filter(o => o.date === yesterdayStr);
    const yesterdayRevenue = yesterdayOrders.filter(o => o.status === 'Paid').reduce((sum, o) => sum + o.amount, 0);

    const lowStockCount = businessData.products.filter(p => p.stock <= 5).length;

    // Determine inactive VIP customer (>= 7 days inactive)
    const potentialVips = [...businessData.customers]
      .filter(c => {
        const lastActiveDate = new Date(c.lastActive);
        const referenceDate = new Date("2026-07-15");
        const diffDays = Math.round((referenceDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);

    let inactiveCustomerName = "Your best customer";
    let inactiveDays = 18;
    if (potentialVips.length > 0) {
      const bestInactive = potentialVips[0];
      inactiveCustomerName = bestInactive.name;
      const lastActiveDate = new Date(bestInactive.lastActive);
      const referenceDate = new Date("2026-07-15");
      inactiveDays = Math.round((referenceDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
    }

    let ownerName = "Sarah";
    let greetingPrefix = "Good morning";
    let channelLabel = "WhatsApp campaign";
    if (businessName === "Sartorial Africa") {
      ownerName = "Sarah";
      greetingPrefix = "Good morning";
      channelLabel = "WhatsApp campaign";
    } else if (businessName === "Kigali Coffee Co.") {
      ownerName = "Marie Claire";
      greetingPrefix = "Mwiriwe";
      channelLabel = "wholesale re-engagement email";
    } else if (businessName === "AfroBeats Tech") {
      ownerName = "Farah";
      greetingPrefix = "Good morning";
      channelLabel = "re-activation sequence";
    }

    setChatHistory([
      {
        id: 'welcome',
        sender: 'assistant',
        text: `💼 **Meet your AI COO.**

*"${greetingPrefix}, ${ownerName}."*

* **Revenue yesterday:** \`${currency}${yesterdayRevenue.toLocaleString()}\`
* **Inventory status:** \`${lowStockCount}\` ${lowStockCount === 1 ? 'product needs' : 'products need'} restocking.
* **Customer alert:** Your best customer, **${inactiveCustomerName}**, hasn't ordered in \`${inactiveDays} days\`.

Would you like me to prepare a ${channelLabel}?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col bg-white border border-[#141414] rounded-none shadow-none h-[650px] overflow-hidden animate-fade-in" id="chat-container">
      {/* Chat Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#141414] bg-[#D6D5D1]" id="chat-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#141414] text-[#E4E3E0] border border-[#141414] rounded-none flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#141414] font-bold">Orlence Copilot</h4>
            <span className="text-[10px] uppercase font-mono text-green-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-600 animate-pulse"></span>
              Live Analytical Agent
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleClearHistory}
          className="text-[10px] font-mono uppercase border border-[#141414] bg-white text-[#141414] hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-none font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          title="Clear Conversation History"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* Chat Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F0EFED]" id="chat-history">
        {chatHistory.map((message) => (
          <div 
            key={message.id} 
            className={`flex gap-4 max-w-[85%] ${message.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-none border border-[#141414] flex items-center justify-center shrink-0 ${
              message.sender === 'user' ? 'bg-[#141414] text-[#E4E3E0]' : 'bg-white text-[#141414]'
            }`}>
              {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className={`space-y-2 rounded-none p-4.5 relative group border border-[#141414] ${
              message.sender === 'user' 
                ? 'bg-[#141414] text-[#E4E3E0] shadow-none' 
                : 'bg-white text-[#141414] shadow-none'
            }`}>
              {/* Text content using Markdown */}
              <div className="text-sm leading-relaxed prose max-w-none text-inherit markdown-body font-sans">
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>

              <div className={`flex justify-between items-center mt-2.5 pt-2 text-[9px] font-mono uppercase ${
                message.sender === 'user' ? 'border-t border-[#E4E3E0]/20 text-[#E4E3E0]/60' : 'border-t border-slate-200 text-slate-500'
              }`}>
                <span>{message.timestamp}</span>
                
                {message.sender === 'assistant' && (
                  <button 
                    onClick={() => copyToClipboard(message.text, message.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-[#141414] px-2 py-0.5 rounded-none text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] flex items-center gap-1 cursor-pointer font-mono font-bold uppercase text-[9px]"
                    title="Copy response content"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-none border border-[#141414] bg-white text-[#141414] flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 animate-bounce" />
            </div>
            <div className="bg-white border border-[#141414] text-[#141414] rounded-none p-4.5 shadow-none flex items-center gap-2 font-mono text-[11px] uppercase font-bold">
              <Sparkles className="w-4 h-4 text-[#141414] animate-spin" />
              <span>Calculating metrics & narratives...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggested Prompts */}
      <div className="px-6 py-3 border-t border-[#141414] bg-[#D6D5D1] flex gap-2 overflow-x-auto scrollbar-none" id="chat-suggestions">
        {suggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="text-[10px] bg-white border border-[#141414] text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] px-3.5 py-1.5 rounded-none font-mono uppercase font-bold shrink-0 shadow-none transition-all disabled:opacity-50 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Message Area */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-4 border-t border-[#141414] bg-white flex gap-3 items-center"
        id="chat-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${businessData.businessName}'s metrics, forecasts, newsletters...`}
          disabled={isLoading}
          className="flex-1 bg-white hover:bg-slate-50 focus:bg-[#F0EFED] text-sm text-[#141414] placeholder-slate-400 px-4 py-3 rounded-none border border-[#141414] focus:border-[#141414] outline-none transition-all disabled:opacity-50 font-mono uppercase tracking-tight text-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-[#141414] text-[#E4E3E0] hover:bg-black border border-[#141414] p-3 rounded-none transition-all disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
