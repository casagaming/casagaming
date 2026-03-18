import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { turso } from '../lib/turso';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  const getCategoryStyles = (index: number) => {
    const styles = [
      { bg: 'bg-bg-secondary', text: 'text-text-primary', accent: 'border-neon-blue', btnBg: 'bg-neon-blue', btnText: 'text-black' },
      { bg: 'bg-neon-blue', text: 'text-black', accent: 'border-black', btnBg: 'bg-black', btnText: 'text-neon-blue' },
      { bg: 'bg-bg-primary', text: 'text-text-primary', accent: 'border-neon-purple', btnBg: 'bg-neon-purple', btnText: 'text-white' },
      { bg: 'bg-neon-purple', text: 'text-white', accent: 'border-black', btnBg: 'bg-black', btnText: 'text-neon-purple' },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="pt-32 pb-20 px-4 bg-bg-primary min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-text-primary mb-6 font-display uppercase tracking-tighter">
            All Categories
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Explore our complete collection of premium gaming gear, meticulously organized for your perfect setup.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
          {loading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="w-full h-[400px] md:h-[500px] rounded-[20px] bg-bg-secondary animate-pulse" />
            ))
          ) : (
            categories.map((category, index) => {
              const style = getCategoryStyles(index);
              return (
                <div
                  key={category.id}
                  className="group relative w-full h-[400px] md:h-[500px] rounded-[20px] bg-black"
                >
                  <div className="absolute inset-0 z-10 w-full h-full rounded-[20px] overflow-hidden transition-all duration-300 ease-out group-hover:opacity-0 group-hover:invisible group-hover:-translate-y-3 group-hover:-translate-x-3">
                    <img
                      src={category.image_url || 'https://images.unsplash.com/photo-1555617981-778dd1c43165?q=80&w=1000&auto=format&fit=crop'}
                      alt={category.name_en}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-8 left-8">
                      <h3 className="text-3xl md:text-4xl font-display font-bold text-white uppercase tracking-tighter">{category.name_ar || category.name_en}</h3>
                    </div>
                  </div>

                  <div className={`absolute inset-0 z-20 w-full h-full rounded-[20px] flex flex-col items-center justify-center text-center p-6 transition-all duration-300 ease-out opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:-translate-y-3 group-hover:-translate-x-3 ${style.bg} border-2 ${style.accent}`}>
                    <h3 className={`text-3xl md:text-4xl font-display font-black uppercase tracking-tighter mb-4 ${style.text} leading-[0.9]`}>
                      {category.name_ar || category.name_en}
                    </h3>
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                      <Link
                        to={`/products?category=${encodeURIComponent(category.name_en)}`}
                        className={`inline-flex items-center gap-2 px-6 py-3 text-sm rounded-full font-bold uppercase tracking-wider transition-transform hover:scale-105 ${style.btnBg} ${style.btnText}`}
                      >
                        View Products <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
