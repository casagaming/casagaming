import { motion } from 'motion/react';

export default function Marquee() {
  return (
    <div className="relative overflow-hidden bg-neon-blue py-2">
      <div className="absolute inset-0 bg-neon-blue blur-sm opacity-50"></div>
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{
          repeat: Infinity,
          duration: 20,
          ease: "linear",
        }}
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center mx-8">
            <span className="text-black font-bold uppercase tracking-widest text-sm md:text-base font-mono">
              Delivery available to all 69 provinces with payment upon receipt // Cash on Delivery // 69 Provinces // Fast & Reliable //
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
