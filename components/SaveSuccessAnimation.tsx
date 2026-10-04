import React, { useEffect } from 'react';
import { CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

interface SaveSuccessAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  subMessage?: string;
}

export const SaveSuccessAnimation: React.FC<SaveSuccessAnimationProps> = ({
  isOpen,
  onClose,
  title = "তথ্য সফলভাবে সংরক্ষিত হয়েছে!",
  message = "আপনার সকল পরিবর্তন রিয়েল-টাইম ডাটাবেজে আপডেট করা হয়েছে।",
  subMessage = "লিডারবোর্ড ও ইউজার অ্যাপে সাথে সাথে প্রতিফলিত হচ্ছে"
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2.5rem] p-7 sm:p-8 max-w-sm w-full text-center shadow-2xl border border-emerald-100 animate-in zoom-in-95 slide-in-from-bottom-6 duration-300 relative overflow-hidden"
      >
        {/* Decorative background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100 rounded-full blur-2xl pointer-events-none opacity-60"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-red-100 rounded-full blur-2xl pointer-events-none opacity-50"></div>

        {/* Animated Check Icon with Pulses */}
        <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
          <div className="absolute inset-1 rounded-full bg-emerald-50 border-2 border-emerald-200"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-200 transform animate-bounce">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Sparkles pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider mb-2 border border-emerald-200">
          <Sparkles size={13} className="text-emerald-600 animate-spin" />
          <span>Real-time Synced</span>
        </div>

        <h3 className="text-xl font-black text-slate-900 leading-tight">
          {title}
        </h3>

        <p className="text-xs text-slate-600 font-semibold mt-1.5 leading-relaxed">
          {message}
        </p>

        {subMessage && (
          <p className="text-[11px] text-slate-400 mt-2 font-medium bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-100">
            {subMessage}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95"
        >
          ঠিক আছে (Done)
        </button>
      </div>
    </div>
  );
};
