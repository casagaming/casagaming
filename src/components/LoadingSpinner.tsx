import { motion } from 'motion/react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-bg-primary z-[60] flex items-center justify-center transition-colors duration-300">
      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          className="w-16 h-16 border-4 border-border-color border-t-neon-blue rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.span 
          className="text-text-secondary font-medium tracking-widest uppercase text-sm font-mono"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading
        </motion.span>
      </div>
    </div>
  );
}
