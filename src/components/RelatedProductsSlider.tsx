import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { turso, parseImageUrl } from '../lib/turso';

interface RelatedProductsSliderProps {
  currentProductId: string;
  categoryId: string;
}

const RelatedProductsSlider: React.FC<RelatedProductsSliderProps> = ({ currentProductId, categoryId }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const { language, isRTL } = useLanguage();

  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await turso.execute({
          sql: `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                      p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                      c.name_en AS category_name_en, c.name_ar AS category_name_ar,
                      (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.id
               WHERE p.id != ?
               ORDER BY p.id DESC`,
          args: [currentProductId]
        });

        const formatted = result.rows.map((row: any) => {
          const images = parseImageUrl(row[5], 400);
          return {
            id: row[0],
            name_ar: row[2],
            name_en: row[1],
            price: row[3],
            original_price: row[4],
            image_url: row[5],
            is_new: row[6],
            is_sale: row[7],
            stock: row[8],
            rating: row[9],
            reviews_count: row[10],
            category_en: row[11],
            category_ar: row[12],
            name: language === 'ar' ? row[2] : row[1],
            image: images[0],
            hoverImage: images.length > 1 ? images[1] : undefined,
            isNew: row[6],
            isSale: row[7],
            originalPrice: row[4],
            variants_count: row[13]
          };
        });
        setProducts(formatted);
        setPage(0);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentProductId, language]);

  if (loading || products.length === 0) return null;

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentItems = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const goNext = () => {
    setDirection(1);
    setPage((p) => (p + 1) % totalPages);
  };

  const goPrev = () => {
    setDirection(-1);
    setPage((p) => (p - 1 + totalPages) % totalPages);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="mt-20 py-10 border-t border-border-color">
      <div className="flex items-center justify-between px-0 mb-8">
        <h2 className="text-2xl font-bold text-text-primary font-display uppercase tracking-widest">
          {language === 'ar' ? 'جميع المنتجات' : 'Tous les produits'}
        </h2>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border-color text-text-secondary hover:border-neon-blue hover:text-neon-blue transition-all active:scale-90"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border-color text-text-secondary hover:border-neon-blue hover:text-neon-blue transition-all active:scale-90"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="grid grid-cols-4 gap-3 md:gap-6"
          >
            {currentItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => { setDirection(idx > page ? 1 : -1); setPage(idx); }}
              className={`rounded-full transition-all duration-400 ${
                page === idx
                  ? 'bg-neon-blue w-6 h-2 shadow-[0_0_8px_rgba(0,243,255,0.7)]'
                  : 'bg-border-color w-2 h-2 hover:bg-text-secondary'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatedProductsSlider;
