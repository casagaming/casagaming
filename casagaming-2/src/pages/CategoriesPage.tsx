import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { turso, getOptimizedImageUrl } from '../lib/turso';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const result = await turso.execute(
          'SELECT id, name_en, name_ar, image_url FROM categories ORDER BY name_en ASC'
        );
        const cats = result.rows.map((row: any) => ({
          id: row[0] as string,
          name_en: row[1] as string,
          name_ar: row[2] as string,
          image_url: row[3] as string,
        }));
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className={`pt-20 pb-20 px-4 bg-bg-primary min-h-screen ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6 font-display uppercase tracking-tighter">
            {t('categories.title')}
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t('categories.desc')}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 justify-items-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-full h-[200px] md:h-[500px] rounded-[16px] bg-bg-secondary animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border-color">
            <p className="text-text-secondary text-lg font-mono uppercase mb-4">{t('categories.not_found')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 justify-items-center">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name_en)}`}
                className="group relative w-full h-[200px] md:h-[500px] rounded-[16px] overflow-hidden bg-black block"
              >
                <img
                  src={getOptimizedImageUrl(category.image_url || 'https://images.unsplash.com/photo-1555617981-778dd1c43165?q=80&w=1000&auto=format&fit=crop', 600)}
                  alt={category.name_en}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className={`absolute bottom-4 md:bottom-8 ${isRTL ? 'right-4 md:right-8' : 'left-4 md:left-8'}`}>
                  <h3 className="text-xl md:text-4xl font-display font-bold text-white uppercase tracking-tighter group-hover:text-neon-blue transition-colors duration-300">
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
