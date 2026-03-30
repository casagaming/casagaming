import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  const categories = ['All', 'Keyboards', 'Mice', 'Audio', 'Accessories', 'Keycaps', 'Streaming'];

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const filteredProducts = products.filter(product => {
    return selectedCategory === 'All' || product.category === selectedCategory;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params: any = {};
    if (category !== 'All') params.category = category;
    setSearchParams(params);
  };

  return (
    <div className="pt-20 pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-1 font-display uppercase tracking-tighter">All Products</h1>
        <p className="text-text-secondary font-mono text-xs md:text-sm">Explore our complete collection of premium gaming gear.</p>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 mb-5">
        <div className="relative group flex-shrink-0">
          <button className="flex items-center gap-2 px-3 py-2.5 border border-border-color bg-bg-secondary text-text-primary hover:border-neon-blue transition-colors font-mono text-xs uppercase tracking-wider whitespace-nowrap">
            <Filter size={14} />
            <span>{selectedCategory}</span>
            <ChevronDown size={12} />
          </button>
          <div className="absolute left-0 mt-1 w-44 bg-bg-secondary border border-border-color shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className="block w-full text-left px-4 py-2.5 text-xs font-mono uppercase text-text-secondary hover:bg-bg-primary hover:text-neon-blue transition-colors border-b border-border-color last:border-0"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 border border-dashed border-border-color">
          <p className="text-text-secondary text-lg font-mono uppercase mb-4">No products found matching your criteria.</p>
          <button 
            onClick={() => {
              setSelectedCategory('All');
              setSearchParams({});
            }}
            className="text-neon-blue hover:text-white font-bold uppercase tracking-wider border-b border-neon-blue hover:border-white transition-all pb-1"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
