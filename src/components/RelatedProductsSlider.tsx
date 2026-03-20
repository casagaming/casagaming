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
  const { language, t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products except the current one
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
  }, [currentProductId, language]);

  if (loading || products.length === 0) return null;

  // Only animate if there are enough products to overflow
  // On desktop we show 4-5 products. So if <= 4, keep it static.
  const shouldAnimate = products.length > 4;

  const repeatCount = shouldAnimate ? Math.max(3, Math.ceil(20 / products.length)) : 1;
  const displayProducts = shouldAnimate ? Array(repeatCount).fill(products).flat() : products;
  const movePercentage = shouldAnimate ? -(100 / repeatCount) : 0;

  return (
    <div className="mt-20 overflow-hidden py-10 border-t border-border-color">
      <h2 className="text-2xl font-bold text-text-primary mb-10 font-display uppercase tracking-widest text-center px-4">
        {language === 'ar' ? 'جميع المنتجات' : 'Tous les produits'}
      </h2>
      
      <div className="relative">
        <motion.div 
          className={`flex gap-4 px-4 ${shouldAnimate ? 'w-max' : 'justify-center flex-wrap'}`}
          animate={shouldAnimate ? {
            x: isRTL ? [`${movePercentage}%`, "0%"] : ["0%", `${movePercentage}%`],
          } : {}}
          transition={{
            duration: products.length * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {displayProducts.map((product, index) => (
            <div key={`${product.id}-${index}`} className="w-[200px] md:w-[240px] flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RelatedProductsSlider;
