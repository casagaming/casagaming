import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export default function Marquee() {
  const { t, isRTL } = useLanguage();
  
  return (
    <div className="relative overflow-hidden bg-neon-blue py-2">
      <div className="absolute inset-0 bg-neon-blue blur-sm opacity-50"></div>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: isRTL ? [1000, 0] : [0, -1000] }}
        transition={{
          repeat: Infinity,
          duration: 30,
          ease: "linear",
        }}
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center mx-8">
            <span className="text-black font-bold uppercase tracking-widest text-sm md:text-base font-mono">
              {t('marquee.delivery')}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
