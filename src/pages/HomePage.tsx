import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Marquee from '../components/Marquee';
import CategoryShowcase from '../components/CategoryShowcase';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Fetch New Arrivals (is_new = true)
        const { data: newData, error: newError } = await supabase
          .from('products')
          .select('*, categories(name_en)')
          .eq('is_new', true)
          .limit(6);
        
        if (newError) throw newError;
        if (newData) setNewArrivals(newData.map((p: any) => {
          const images = Array.isArray(p.image_url) ? p.image_url : [p.image_url];
          return {
            ...p, 
            category: p.categories?.name_en || 'Gear',
            name: p.name_en, 
            image: images[0],
            hoverImage: images.length > 1 ? images[1] : undefined,
            isNew: p.is_new,
            isSale: p.is_sale,
            originalPrice: p.original_price
          };
        }));

        // Fetch Popular Products (Featured or high rating/reviews)
        const { data: popData, error: popError } = await supabase
          .from('products')
          .select('*, categories(name_en)')
          .order('reviews_count', { ascending: false })
          .limit(12);
        
        if (popError) throw popError;
        if (popData) setPopularProducts(popData.map((p: any) => {
          const images = Array.isArray(p.image_url) ? p.image_url : [p.image_url];
          return {
            ...p, 
            category: p.categories?.name_en || 'Gear',
            name: p.name_en, 
            image: images[0],
            hoverImage: images.length > 1 ? images[1] : undefined,
            isNew: p.is_new,
            isSale: p.is_sale,
            originalPrice: p.original_price
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
      
      <ProductGrid 
        title="New Arrivals" 
        products={newArrivals} 
        linkHref="/products"
      />

      <ProductGrid 
        title="Popular Gear" 
        products={popularProducts} 
        linkHref="/products"
      />

      <CategoryShowcase />
      
      {/* Features Section */}
      <section className="py-24 bg-bg-secondary border-y border-border-color transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 border border-border-color hover:border-neon-blue/30 transition-colors group bg-bg-primary">
              <div className="w-16 h-16 mx-auto bg-bg-secondary border border-border-color flex items-center justify-center mb-8 text-neon-blue group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 font-display uppercase tracking-wider">Premium Quality</h3>
              <p className="text-text-secondary font-light leading-relaxed">Built with aerospace-grade materials for durability and performance.</p>
            </div>
            
            <div className="p-8 border border-border-color hover:border-neon-purple/30 transition-colors group bg-bg-primary">
              <div className="w-16 h-16 mx-auto bg-bg-secondary border border-border-color flex items-center justify-center mb-8 text-neon-purple group-hover:scale-110 transition-transform duration-300">
                <Truck size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 font-display uppercase tracking-wider">Fast Shipping</h3>
              <p className="text-text-secondary font-light leading-relaxed">Same-day dispatch on orders before 2PM. Global shipping available.</p>
            </div>
            
            <div className="p-8 border border-border-color hover:border-neon-blue/30 transition-colors group bg-bg-primary">
              <div className="w-16 h-16 mx-auto bg-bg-secondary border border-border-color flex items-center justify-center mb-8 text-neon-blue group-hover:scale-110 transition-transform duration-300">
                <Zap size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-4 font-display uppercase tracking-wider">2-Year Warranty</h3>
              <p className="text-text-secondary font-light leading-relaxed">We stand by our gear. Comprehensive warranty on all mechanical keyboards.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
