import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { turso, getOptimizedImageUrl } from '../lib/turso';

export default function CategoryShowcase() {
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const { language, isRTL } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await turso.execute(
          'SELECT id, name_ar, name_en, image_url FROM categories LIMIT 3'
        );
        const cats = result.rows.map((row: any) => ({
          id: row[0],
          name_ar: row[1],
          name_en: row[2],
          image_url: row[3],
        }));
        if (cats.length > 0) setDbCategories(cats);
      } catch (error) {
        console.error('Error fetching categories for showcase:', error);
      }
    };

    fetchCategories();
  }, []);

  if (dbCategories.length === 0) return null;

  return (
    <section className="py-24 px-4 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {dbCategories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${encodeURIComponent(category.name_en)}`}
              className="group relative w-full md:w-[386px] h-[400px] md:h-[774px] rounded-[20px] overflow-hidden bg-black block"
            >
              <img
                src={getOptimizedImageUrl(category.image_url, 800)}
                alt={language === 'ar' ? category.name_ar : category.name_en}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className={`absolute bottom-10 ${isRTL ? 'right-10' : 'left-10'}`}>
                <h3 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter group-hover:text-neon-blue transition-colors duration-300">
                  {language === 'ar' ? category.name_ar : category.name_en}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
