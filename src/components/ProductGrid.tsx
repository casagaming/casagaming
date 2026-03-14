import { Product } from '../data';
import ProductCard from './ProductCard';
import { ArrowRight } from 'lucide-react';

interface ProductGridProps {
  title: string;
  products: Product[];
  linkText?: string;
  linkHref?: string;
}

export default function ProductGrid({ title, products, linkText = "View All", linkHref = "#" }: ProductGridProps) {
  return (
    <section className="py-8 md:py-20 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto border-t border-border-color transition-colors duration-300">
      <div className="flex items-end justify-between mb-6 md:mb-12">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-3 md:mb-4 font-display uppercase tracking-tighter">
            {title}
          </h2>
          <div className="h-1 w-24 bg-neon-blue"></div>
        </div>
        <a 
          href={linkHref} 
          className="hidden sm:flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors text-sm font-bold uppercase tracking-widest font-mono group"
        >
          {linkText} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-10">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="mt-12 text-center sm:hidden">
        <a 
          href={linkHref} 
          className="inline-block px-8 py-3 border border-border-color text-sm font-bold text-text-primary uppercase tracking-widest hover:bg-text-primary hover:text-bg-primary transition-colors"
        >
          {linkText}
        </a>
      </div>
    </section>
  );
}
