'use client';
import { motion } from 'framer-motion';
import { Triangle, MapPin, Clock, ArrowRight } from 'lucide-react';

export default function ThreatCard() {
  return (
    <div className="min-h-screen bg-[#080E1A] p-8 flex items-center justify-center font-sans text-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-[#111A2C]/80 backdrop-blur-xl border border-[#1E2E48] rounded-2xl p-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#EF4444] rounded-full blur-[80px] opacity-20 pointer-events-none" />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-full">
            <Triangle className="w-4 h-4 text-[#EF4444] fill-current animate-pulse" />
            <span className="text-xs font-semibold text-[#EF4444] tracking-wide uppercase">Critical Warning</span>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">MODEL ADVISORY</span>
        </div>
        <div className="mb-6 relative z-10">
          <h2 className="text-2xl font-semibold text-[#F8FAFC] leading-tight mb-2">
            Flash Flood Risk Elevated
          </h2>
          <div className="flex items-center gap-2 text-[#94A3B8] mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Upper Mandakini / Kedarnath Basin</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Modeled Probability</span>
              <span className="font-mono font-medium text-[#F8FAFC]">94%</span>
            </div>
            <div className="w-full h-1.5 bg-[#0B1322] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '94%' }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-gradient-to-r from-[#F97316] to-[#EF4444]"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-[#1E2E48] relative z-10">
          <div className="flex items-center gap-2 text-[#64748B]">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-mono">Action Window: &lt; 45 mins</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] transition-colors rounded-lg text-sm font-medium text-white shadow-lg shadow-[#0284C7]/20">
            View on Map
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
