import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, ArrowRight, Activity, 
  MessageSquare, Zap, LayoutDashboard, 
  Award, FileText, Calendar, Lock, Unlock, PlayCircle 
} from 'lucide-react';
import { useLaunch } from '../context/LaunchContext';

export default function ApplicationSuccess() {
  const { activeProgram } = useLaunch();
  const [appData, setAppData] = useState<any>(null);

  useEffect(() => {
    // Read the submitted data from localStorage
    const dataStr = localStorage.getItem('orlence_founder_app');
    if (dataStr) {
      try {
        setAppData(JSON.parse(dataStr));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Mock data for development if accessed directly
      setAppData({
        name: 'Prince',
        business_name: 'Tolexy',
        business_type: 'Restaurant',
        monthly_orders: '50-200',
        current_tools: ['Bumpa', 'Paystack'],
        priority_score: 87,
        id: 'ORL-00042'
      });
    }
  }, []);

  const firstName = appData?.name ? appData.name.split(' ')[0] : 'Founder';

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-[#141414] pb-20">
      
      {/* Navbar Minimal */}
      <nav className="p-6 sm:px-10 flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center rounded-lg">
            <Zap className="w-4 h-4" />
          </div>
          <span className="font-bold text-xl tracking-tight">Orlence</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 mt-10 space-y-16">
        
        {/* 1. Hero & Welcome */}
        <section className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight"
          >
            Application Submitted
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-50 border border-slate-200 inline-block px-4 py-2 rounded-lg text-sm font-medium text-slate-600 mb-4"
          >
            Average Review Time: <span className="font-bold text-[#141414]">48 Hours</span>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-600 max-w-lg mx-auto"
          >
            You'll receive an email once our team reviews your application.
            While you wait, you're officially inside <strong>The Business Intelligence Lab</strong>.
          </motion.p>
        </section>

        {/* 2. Founder Passport */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative"
        >
          <div className="bg-[#141414] rounded-2xl p-8 text-white shadow-2xl overflow-hidden border border-slate-800">
            {/* Passport Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-3 text-emerald-400 font-bold uppercase tracking-widest text-xs">
                  <Zap className="w-4 h-4" /> Founder Passport
                </div>
                
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm">Founder</p>
                  <p className="text-2xl font-bold">{appData?.name || 'Loading...'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Business</p>
                    <p className="font-medium text-lg">{appData?.business_name || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Industry</p>
                    <p className="font-medium text-lg">{appData?.business_type || '—'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-xl p-5 border border-white/20 shrink-0 w-full md:w-auto">
                <div className="space-y-4">
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Founder ID</p>
                    <p className="font-mono text-emerald-400 font-bold tracking-widest">
                      {appData?.id ? `ORL-${appData.id.toString().substring(0, 5).toUpperCase()}` : 'ORL-00042'}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Batch</p>
                    <p className="font-medium">{activeProgram?.name || 'Founding Batch One'}</p>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Status</p>
                    <div className="inline-flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded text-xs font-medium text-white">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      Review Pending
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 3. Founder Journey Progress Bar */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8"
        >
          <h3 className="font-bold text-lg mb-6">Founder Journey</h3>
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 z-0"></div>
            
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="pt-1">
                  <p className="font-bold text-[#141414]">Application Submitted</p>
                  <p className="text-sm text-slate-500">Your profile is being processed.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full border-4 border-emerald-100 bg-emerald-500 shrink-0 shadow-[0_0_0_4px_white]" />
                <div className="pt-1">
                  <p className="font-bold text-emerald-600">Join Business Intelligence Lab</p>
                  <p className="text-sm text-slate-500">Unlock insights while you wait.</p>
                </div>
              </div>
              
              <div className="flex gap-4 opacity-40">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-white shrink-0" />
                <div className="pt-1">
                  <p className="font-bold text-[#141414]">Discovery Call</p>
                </div>
              </div>
              
              <div className="flex gap-4 opacity-40">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-white shrink-0" />
                <div className="pt-1">
                  <p className="font-bold text-[#141414]">Accepted & Onboarded</p>
                </div>
              </div>

              <div className="flex gap-4 opacity-40">
                <div className="w-8 h-8 rounded-full border-2 border-slate-300 bg-white shrink-0" />
                <div className="pt-1">
                  <p className="font-bold text-[#141414]">AI Activated</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 4. Personalized AI Assessment */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#141414] text-white rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-xl">Initial AI Assessment</h2>
              <p className="text-slate-500 text-sm">Generated from your application data</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Intelligence Score</p>
              <div className="flex items-end gap-2 mb-4">
                <p className="text-5xl font-black tracking-tight">{appData?.priority_score || 85}<span className="text-2xl text-slate-400">%</span></p>
              </div>
              <p className="text-sm text-slate-600">Your business has high automation potential based on your volume and tools.</p>
              
              <div className="mt-6 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Identified Opportunities</p>
                <div className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Stock tracking</div>
                <div className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Revenue forecasting</div>
                <div className="flex items-center gap-2 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Customer retention</div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-4">What Orlence Understands</p>
              <ul className="space-y-4 text-sm text-emerald-900 leading-relaxed">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>You currently manage <strong>{appData?.monthly_orders || '50-200'}</strong> orders monthly.</span>
                </li>
                {appData?.current_tools && appData.current_tools.length > 0 && (
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>You're spending time switching between <strong>{appData.current_tools.join(' & ')}</strong>.</span>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Orlence can unify this data to automate daily reporting and forecasting immediately.</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* 5. Community Preview (Slack-style) */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="bg-[#141414] px-6 py-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span className="font-bold">Business Intelligence Lab</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> 67 Online</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded bg-indigo-100 text-indigo-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase leading-none">Mon</span>
                  <span className="text-sm font-black leading-none mt-1">24</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Founder Spotlight</p>
                  <p className="font-medium text-[#141414]">How a pharmacy reduced stockouts by 38% using Orlence.</p>
                </div>
              </div>
            </div>

            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded bg-rose-100 text-rose-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase leading-none">Tue</span>
                  <span className="text-sm font-black leading-none mt-1">25</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">AI Workshop</p>
                  <p className="font-medium text-[#141414]">Forecasting inventory before weekend spikes.</p>
                </div>
              </div>
            </div>

            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded bg-emerald-100 text-emerald-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase leading-none">Wed</span>
                  <span className="text-sm font-black leading-none mt-1">26</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product Update</p>
                  <p className="font-medium text-[#141414]">Instagram DM integration is now live for cohort one.</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded bg-amber-100 text-amber-600 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold uppercase leading-none">Thu</span>
                  <span className="text-sm font-black leading-none mt-1">27</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Founder AMA</p>
                  <p className="font-medium text-[#141414]">Ask anything. Bring your hardest operational problems.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
             <div>
               <p className="text-lg font-black text-[#141414]">67</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Businesses</p>
             </div>
             <div>
               <p className="text-lg font-black text-[#141414]">13</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industries</p>
             </div>
             <div>
               <p className="text-lg font-black text-[#141414]">11</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">States</p>
             </div>
             <div>
               <p className="text-lg font-black text-[#141414]">284</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conversations</p>
             </div>
          </div>
        </motion.section>

        {/* 6. Unlocked Rewards */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
              <Unlock className="w-3.5 h-3.5" /> Unlocked
            </div>
            <h3 className="font-bold text-xl mb-4">You've earned early access perks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 className="w-3.5 h-3.5"/></div>
                Founder Toolkit PDF
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 className="w-3.5 h-3.5"/></div>
                AI Prompt Library
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 className="w-3.5 h-3.5"/></div>
                KPI Dashboard
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0"><CheckCircle2 className="w-3.5 h-3.5"/></div>
                Roadmap Voting
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
            <button 
              onClick={() => window.open('https://chat.whatsapp.com/Gr2DVgmeRBk8kK3zTRjar8', '_blank')}
              className="w-full md:w-auto px-8 py-5 bg-[#141414] hover:bg-emerald-600 transition-colors text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              Unlock Business Intelligence Lab <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-500 text-center">Join the private WhatsApp community</p>
          </div>
        </motion.section>

        {/* 7. Next Steps CTAs */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="border-t border-slate-200 pt-10 text-center"
        >
          <h3 className="font-bold text-lg mb-6">What would you like to do?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.open('https://chat.whatsapp.com/Gr2DVgmeRBk8kK3zTRjar8', '_blank')}
              className="bg-emerald-50 border border-emerald-200 hover:border-emerald-300 text-emerald-800 p-4 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-2 group"
            >
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Join Community
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Recommended</span>
            </button>

            <button className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 p-4 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-2 group shadow-sm">
              <Calendar className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
              Book Discovery
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Optional</span>
            </button>

            <button 
              onClick={() => window.location.href = '/'}
              className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 p-4 rounded-xl font-medium transition-colors flex flex-col items-center justify-center gap-2 group shadow-sm"
            >
              <LayoutDashboard className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              Return Home
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Explore Product</span>
            </button>
          </div>
        </motion.section>

      </main>
    </div>
  );
}
