import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const styleMapping: any = {
  0: { bg: 'bg-bg-secondary', text: 'text-text-primary', accent: 'border-neon-blue', buttonBg: 'bg-neon-blue', buttonText: 'text-black', subtitle: 'PRECISION CONTROL' },
  1: { bg: 'bg-neon-blue', text: 'text-black', accent: 'border-black', buttonBg: 'bg-black', buttonText: 'text-neon-blue', subtitle: 'DEADLY ACCURACY' },
  2: { bg: 'bg-bg-primary', text: 'text-text-primary', accent: 'border-neon-purple', buttonBg: 'bg-neon-purple', buttonText: 'text-white', subtitle: 'IMMERSIVE SOUND' },
};

export default function CategoryShowcase() {
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .limit(3);
        
        if (error) throw error;
        if (data) setDbCategories(data);
      } catch (error) {
        console.error('Error fetching categories for showcase:', error);
      }
    };

    fetchCategories();
  }, []);

  // Use DB categories or fallback if still loading
  const categoriesToShow = dbCategories.length > 0 ? dbCategories : [
    { id: 'keyboards', name_en: 'Keyboards', slug: 'keyboards', image_url: 'https://res.cloudinary.com/dwgp11ukd/image/upload/v1772992306/alexander-swoboda-pc9_ke2pxf.jpg', description_en: 'Dominate the arena with our mechanical masterpieces.' },
    { id: 'mice', name_en: 'Mice', slug: 'mice', image_url: 'https://res.cloudinary.com/dwgp11ukd/image/upload/v1772991808/andre-lang-huynh-opulentg_zfups1.jpg', description_en: 'Engineered for speed and precision.' },
    { id: 'audio', name_en: 'Audio', slug: 'audio', image_url: 'https://res.cloudinary.com/dwgp11ukd/image/upload/v1772991810/andre-lang-huynh-opulenta_ckhgje.jpg', description_en: 'Hear every footstep. Crystal clear audio.' }
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
                {/* Thumb (Initial State) */}
                <div className="absolute inset-0 z-10 w-full h-full rounded-[20px] overflow-hidden transition-all duration-300 ease-out group-hover:opacity-0 group-hover:invisible group-hover:-translate-y-3 group-hover:-translate-x-3">
                  <img 
                    src={category.image_url || category.image} 
                    alt={category.name_en}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute bottom-10 left-10">
                    <h3 className="text-4xl font-display font-bold text-white uppercase tracking-tighter">{category.name_en}</h3>
                  </div>
                </div>

                {/* List (Hover State) */}
                <div className={`absolute inset-0 z-20 w-full h-full rounded-[20px] flex flex-col items-center justify-center text-center p-8 transition-all duration-300 ease-out opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-3 group-hover:-translate-x-3 ${styles.bg} border-2 ${styles.accent}`}>
                  
                  <span className={`text-sm font-mono uppercase tracking-widest mb-4 ${styles.text} opacity-70`}>
                    {category.subtitle_en || styles.subtitle}
                  </span>
                  
                  <h3 className={`text-5xl md:text-6xl font-display font-black uppercase tracking-tighter mb-6 ${styles.text} leading-[0.9]`}>
                    {category.name_en}
                  </h3>
                  
                  <p className={`text-lg font-medium leading-relaxed max-w-xs ${styles.text}`}>
                    {category.description_en || category.description || `Engineered for performance and durability.`}
                  </p>

                  <div className="absolute bottom-10 left-0 right-0 flex justify-center">
                    <Link 
                      to={`/products?category=${encodeURIComponent(category.name_en)}`}
                      className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold uppercase tracking-wider transition-transform hover:scale-105 ${styles.buttonBg} ${styles.buttonText}`}
                    >
                      View Products <ArrowRight size={20} />
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
