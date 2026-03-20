import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try same category first
        let result = await turso.execute({
          sql: `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                      p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                      c.name_en AS category_name_en, c.name_ar AS category_name_ar,
                      (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
               FROM products p
               LEFT JOIN categories c ON p.category_id = c.id
               WHERE p.category_id = ? AND p.id != ?
               LIMIT 10`,
          args: [categoryId, currentProductId]
        });

        // Fallback to general popular products if empty or null category
        if (result.rows.length === 0) {
          result = await turso.execute({
            sql: `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                        p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                        c.name_en AS category_name_en, c.name_ar AS category_name_ar,
                        (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
                 FROM products p
                 LEFT JOIN categories c ON p.category_id = c.id
                 WHERE p.id != ?
                 ORDER BY p.reviews_count DESC
                 LIMIT 10`,
            args: [currentProductId]
          });
        }

        const formatted = result.rows.map((row: any) => {
          const images = parseImageUrl(row[5]);
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
            variants_count: row[13]
          };
        });
        setProducts(formatted);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, currentProductId, language]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-20 overflow-hidden py-10 border-t border-border-color">
      <h2 className="text-2xl font-bold text-text-primary mb-10 font-display uppercase tracking-widest text-center">
        {language === 'ar' ? 'منتجات قد تعجبك' : 'Vous pourriez aussi aimer'}
      </h2>
      
      <div className="relative">
        <motion.div 
          className="flex gap-6 px-4"
          animate={{
            x: [0, -344, -344, -688, -688, -1032, -1032, -1376, -1376, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
          }}
        >
          {products.map((product, index) => (
            <div key={`${product.id}-${index}`} className="min-w-[280px] md:min-w-[320px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
          {/* Looping clones */}
          {products.slice(0, 4).map((product, index) => (
            <div key={`clone-${product.id}-${index}`} className="min-w-[280px] md:min-w-[320px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RelatedProductsSlider;
