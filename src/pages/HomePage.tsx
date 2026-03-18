import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import Marquee from '../components/Marquee';
import CategoryShowcase from '../components/CategoryShowcase';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { turso, parseImageUrl } from '../lib/turso';

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [popularProducts, setPopularProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const newResult = await turso.execute(
          `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                  p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                  c.name_en AS category_name
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id
           WHERE p.is_new = 1
           LIMIT 6`
        );

        setNewArrivals(newResult.rows.map((row: any) => {
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
            category: row[11] || 'Gear',
            name: row[1],
            image: images[0],
            hoverImage: images.length > 1 ? images[1] : undefined,
            images,
            isNew: row[6],
            isSale: row[7],
            originalPrice: row[4],
          };
        }));

        const popResult = await turso.execute(
          `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                  p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                  c.name_en AS category_name
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id
           ORDER BY p.reviews_count DESC
           LIMIT 12`
        );

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
            category: row[11] || 'Gear',
            name: row[1],
            image: images[0],
            hoverImage: images.length > 1 ? images[1] : undefined,
            images,
            isNew: row[6],
            isSale: row[7],
            originalPrice: row[4],
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
