import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { turso } from '../lib/turso';

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const result = await turso.execute(
          'SELECT image_url FROM banners WHERE is_active = 1 ORDER BY order_index ASC'
        );
        const imgs = result.rows.map((row: any) => row[0] as string).filter(Boolean);
        if (imgs.length > 0) setImages(imgs);
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
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[35vh] md:h-screen w-full overflow-hidden bg-bg-primary transition-colors duration-300">
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
        <div className="absolute inset-0 bg-black/30" />
      </div>
    </div>
  );
}
