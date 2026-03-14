import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data, error } = await supabase
          .from('banners')
          .select('image_url')
          .eq('is_active', true)
          .order('order_index', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setImages(data.map(b => b.image_url));
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="relative h-[35vh] md:h-screen w-full overflow-hidden bg-bg-primary transition-colors duration-300">
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            {/* Loading or placeholder state if no banners are available */}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[35vh] md:h-screen w-full overflow-hidden bg-bg-primary transition-colors duration-300">
      {/* Background Slideshow */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        
        {/* Overlay for better button visibility */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
    </div>
  );
}
