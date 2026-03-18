import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { turso } from '../lib/turso';
import { useLanguage } from '../context/LanguageContext';

export default function CategoryGrid() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const result = await turso.execute(
          'SELECT id, name_ar, name_en, image_url FROM categories'
        );
        const cats = result.rows.map((row: any) => ({
          id: row[0],
          name_ar: row[1],
          name_en: row[2],
          image_url: row[3],
        }));
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories for grid:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesData();
  }, []);

  if (loading && categories.length === 0) {
    return (
      <div className="py-16 bg-bg-primary text-center">
        <div className="animate-pulse text-text-secondary font-mono tracking-widest uppercase">
          Loading Categories...
        </div>
      </div>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold text-text-primary">
            {language === 'ar' ? 'تسوق حسب الفئة' : 'Acheter par catégorie'}
          </h2>
          <Link to="/categories" className="text-neon-blue hover:text-neon-purple transition-colors font-medium hidden sm:block">
            {language === 'ar' ? 'عرض كل الفئات ←' : 'Voir toutes les catégories ←'}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/products?category=${encodeURIComponent(category.name_en)}`} className="group block relative h-64 overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-gray-900">
                  <img
                    src={category.image_url || 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop'}
                    alt={category.name_en}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute bottom-0 left-0 p-4 w-full flex flex-col gap-2">
                  <h3 className="text-white font-bold text-lg group-hover:text-neon-blue transition-colors">{category.name_ar || category.name_en}</h3>
                  <div className="sm:hidden mt-1 px-3 py-1.5 bg-neon-blue text-black text-[10px] font-bold uppercase tracking-tighter w-fit rounded-sm shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                    {language === 'ar' ? 'دخول' : 'ENTRER'}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/products" className="text-neon-blue hover:text-neon-purple transition-colors font-medium">
            View All Categories →
          </Link>
        </div>
      </div>
    </section>
  );
}
