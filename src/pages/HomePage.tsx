import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Marquee from '../components/Marquee';
import CategoryShowcase from '../components/CategoryShowcase';
import CategoryGrid from '../components/CategoryGrid';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { turso, parseImageUrl } from '../lib/turso';
import { motion } from 'motion/react';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { language, t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const newResult = await turso.execute(
          `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                  p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                  c.name_en AS category_name_en, c.name_ar AS category_name_ar,
                  (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE p.is_new = 1
             AND p.name_en NOT LIKE '%tast%'
             AND p.name_ar NOT LIKE '%tast%'
             AND p.name_en NOT LIKE '%test%'
             AND p.name_ar NOT LIKE '%test%'
           LIMIT 6`
        );

        setNewArrivals(newResult.rows.filter((row: any) => row[6] === 1).slice(0, 6).map((row: any) => {
          const images = parseImageUrl(row[5]);
          return {
            id: row[0],
            name_en: row[1],
            name_ar: row[2],
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
            images,
            isNew: row[6],
            isSale: row[7],
            originalPrice: row[4],
            variants_count: row[13],
          };
        }));

        const popResult = await turso.execute(
          `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                  p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                  c.name_en AS category_name_en, c.name_ar AS category_name_ar,
                  (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE p.name_en NOT LIKE '%tast%'
             AND p.name_ar NOT LIKE '%tast%'
             AND p.name_en NOT LIKE '%test%'
             AND p.name_ar NOT LIKE '%test%'
           ORDER BY p.reviews_count DESC
           LIMIT 12`
        );

        const catsResult = await turso.execute(
          'SELECT id, name_ar, name_en, image_url FROM categories LIMIT 10'
        );
        setCategories(catsResult.rows.map((row: any) => ({
          id: row[0],
          name_ar: row[1],
          name_en: row[2],
          image_url: row[3],
        })));

        setPopularProducts(popResult.rows.map((row: any) => {
          const images = parseImageUrl(row[5]);
          return {
            id: row[0],
            name_en: row[1],
            name_ar: row[2],
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
            images,
            isNew: row[6],
            isSale: row[7],
            originalPrice: row[4],
            variants_count: row[13],
          };
        }));
      } catch (error) {
        console.error('Error fetching home data:', error);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <>
      <Hero />
      <Marquee />

      {newArrivals.length > 0 && (
        <ProductGrid
          title={language === 'ar' ? 'وصل حديثاً' : 'Nouveautés'}
          products={newArrivals}
          linkHref="/products"
        />
      )}

      {popularProducts.length > 0 && (
        <ProductGrid
          title={language === 'ar' ? 'الأكثر شعبية' : 'Produits Populaires'}
          products={popularProducts}
          linkHref="/products"
        />
      )}

      <CategoryGrid />

      <CategoryShowcase />

      <section className="py-24 bg-bg-secondary border-y border-border-color transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 border border-border-color hover:border-neon-blue/30 transition-colors group bg-bg-primary">
              <div className="w-16 h-16 mx-auto bg-bg-secondary border border-border-color flex items-center justify-center mb-8 text-neon-blue group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 font-display uppercase tracking-wider">
                {language === 'ar' ? 'جودة ممتازة' : 'Qualité Premium'}
              </h3>
              <p className="text-text-secondary font-light leading-relaxed">
                {language === 'ar' ? 'مصنوع من مواد عالية الجودة للمتانة والأداء.' : 'Fabriqué avec des matériaux de qualité aérospatiale pour la durabilité et la performance.'}
              </p>
            </div>

            <div className="p-8 border border-border-color hover:border-neon-purple/30 transition-colors group bg-bg-primary">
              <div className="w-16 h-16 mx-auto bg-bg-secondary border border-border-color flex items-center justify-center mb-8 text-neon-purple group-hover:scale-110 transition-transform duration-300">
                <Truck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 font-display uppercase tracking-wider">
                {t('product.free_shipping')}
              </h3>
              <p className="text-text-secondary font-light leading-relaxed">
                {language === 'ar' ? 'شحن سريع لجميع الولايات. توصيل في وقت قياسي.' : 'Expédition le jour même pour les commandes passées avant 14h. Livraison mondiale disponible.'}
              </p>
            </div>

            <div className="p-8 border border-border-color hover:border-neon-blue/30 transition-colors group bg-bg-primary">
              <div className="w-16 h-16 mx-auto bg-bg-secondary border border-border-color flex items-center justify-center mb-8 text-neon-blue group-hover:scale-110 transition-transform duration-300">
                <Zap size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 font-display uppercase tracking-wider">
                {t('product.warranty')}
              </h3>
              <p className="text-text-secondary font-light leading-relaxed">
                {language === 'ar' ? 'نحن نضمن جودة منتجاتنا. ضمان شامل على جميع لوحات المفاتيح.' : 'Nous garantissons nos produits. Garantie complète sur tous les claviers mécaniques.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
