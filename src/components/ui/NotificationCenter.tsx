import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, AlertTriangle, Info, Zap, Trash2 } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: Props) {
  const { notifications, clearNotifications, markNotificationsAsRead } = useWorkspace();

  React.useEffect(() => {
    if (isOpen) {
      markNotificationsAsRead();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col font-sans text-[#141414]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#141414] text-white rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Notification Center</h2>
                  <p className="text-xs text-slate-400">Real-time business events & intelligence alerts</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Clear notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {notifications.length > 0 ? (
                notifications.map(evt => {
                  const isWarning = evt.severity === 'warning' || evt.severity === 'error';
                  const isSuccess = evt.severity === 'success';

                  return (
                    <div
                      key={evt.id}
                      className={`p-4 rounded-xl border text-sm transition-all ${
                        isWarning
                          ? 'bg-rose-50/50 border-rose-100'
                          : isSuccess
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : 'bg-slate-50/50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">
                          {isWarning ? (
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                          ) : isSuccess ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Zap className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-800 text-xs uppercase tracking-wider">{evt.title}</p>
                          <p className="text-slate-600 mt-1 leading-relaxed text-xs">{evt.message}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-2">{new Date(evt.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-700">All quiet across Orlence OS</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">New real-time business events, customer orders, and AI recommendations will appear here automatically.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Powered by Orlence Business Sync Engine</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
