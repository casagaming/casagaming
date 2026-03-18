import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Marquee from '../components/Marquee';
import CategoryShowcase from '../components/CategoryShowcase';
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
            category_en: row[11] || 'Gear',
            category_ar: row[12] || 'معدات',
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
            category_en: row[11] || 'Gear',
            category_ar: row[12] || 'معدات',
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
      
      {/* Mobile Horizontal Category Bar */}
      <div className="lg:hidden bg-bg-primary pt-6 pb-2 border-b border-border-color overflow-hidden">
        <div className="px-4 mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-text-primary tracking-tight">{t('nav.categories')}</h2>
          <Link to="/categories" className="text-xs text-neon-blue font-mono font-bold uppercase">{language === 'ar' ? 'عرض الكل' : 'VOIR TOUT'}</Link>
        </div>
        <div className="flex overflow-x-auto gap-4 px-4 pb-4 scrollbar-hide snap-x">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/products?category=${encodeURIComponent(cat.name_en)}`}
              className="flex-shrink-0 flex flex-col items-center gap-2 snap-start"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border-color hover:border-neon-blue transition-colors bg-bg-secondary p-1">
                <img 
                  src={cat.image_url || 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=200&auto=format&fit=crop'} 
                  alt={language === 'ar' ? cat.name_ar : cat.name_en}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-[10px] font-bold text-text-primary uppercase tracking-tighter whitespace-nowrap">
                {language === 'ar' ? cat.name_ar : cat.name_en}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <Marquee />

      <ProductGrid
        title={language === 'ar' ? 'وصل حديثاً' : 'Nouveautés'}
        products={newArrivals}
        linkHref="/products"
      />

      <ProductGrid
        title={language === 'ar' ? 'الأكثر شعبية' : 'Produits Populaires'}
        products={popularProducts}
        linkHref="/products"
      />

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
