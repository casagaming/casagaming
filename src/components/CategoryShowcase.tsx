import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { turso } from '../lib/turso';

const styleMapping: any = {
  0: { bg: 'bg-bg-secondary', text: 'text-text-primary', accent: 'border-neon-blue', buttonBg: 'bg-neon-blue', buttonText: 'text-black', subtitle: 'PRECISION CONTROL' },
  1: { bg: 'bg-neon-blue', text: 'text-black', accent: 'border-black', buttonBg: 'bg-black', buttonText: 'text-neon-blue', subtitle: 'DEADLY ACCURACY' },
  2: { bg: 'bg-bg-primary', text: 'text-text-primary', accent: 'border-neon-purple', buttonBg: 'bg-neon-purple', buttonText: 'text-white', subtitle: 'IMMERSIVE SOUND' },
};

export default function CategoryShowcase() {
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const { language, t, isRTL } = useLanguage();

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

  const categoriesToShow = dbCategories.length > 0 ? dbCategories : [
    { id: 'keyboards', name_en: 'Keyboards', image_url: 'https://res.cloudinary.com/dwgp11ukd/image/upload/v1772992306/alexander-swoboda-pc9_ke2pxf.jpg' },
    { id: 'mice', name_en: 'Mice', image_url: 'https://res.cloudinary.com/dwgp11ukd/image/upload/v1772991808/andre-lang-huynh-opulentg_zfups1.jpg' },
    { id: 'audio', name_en: 'Audio', image_url: 'https://res.cloudinary.com/dwgp11ukd/image/upload/v1772991810/andre-lang-huynh-opulenta_ckhgje.jpg' },
  ];

  return (
    <section className="py-24 px-4 bg-bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {categoriesToShow.map((category, index) => {
            const styles = styleMapping[index % 3];
            return (
              <div
                key={category.id}
                className="group relative w-full md:w-[386px] h-[600px] md:h-[774px] rounded-[20px] bg-black"
              >
                <div className="absolute inset-0 z-10 w-full h-full rounded-[20px] overflow-hidden transition-all duration-300 ease-out group-hover:opacity-0 group-hover:invisible group-hover:-translate-y-3 group-hover:-translate-x-3">
                  <img
                    src={category.image_url}
                    alt={language === 'ar' ? category.name_ar : category.name_en}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-10 left-10">
                    <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">
                      {language === 'ar' ? category.name_ar : category.name_en}
                    </h3>
                  </div>
                </div>

                <div className={`absolute inset-0 z-20 w-full h-full rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 ease-out opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-3 group-hover:-translate-x-3 ${styles.bg} border-2 ${styles.accent}`}>
                  <h3 className={`text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-6 ${styles.text} leading-[0.9]`}>
                    {language === 'ar' ? category.name_ar : category.name_en}
                  </h3>
                  <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <Link
                      to={`/products?category=${encodeURIComponent(category.name_en)}`}
                      className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-transform hover:scale-105 ${styles.buttonBg} ${styles.buttonText}`}
                    >
                      {language === 'ar' ? 'عرض المنتجات' : 'Voir les produits'} <ArrowRight size={20} className={isRTL ? 'rotate-180' : ''} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
