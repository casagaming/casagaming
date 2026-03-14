import { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, Search } from 'lucide-react';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  
  const categories = ['All', 'Keyboards', 'Mice', 'Audio', 'Accessories', 'Keycaps', 'Streaming'];

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    const params: any = {};
    if (query) params.search = query;
    if (selectedCategory !== 'All') params.category = selectedCategory;
    setSearchParams(params);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (category !== 'All') params.category = category;
    setSearchParams(params);
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2 font-display uppercase tracking-tighter">All Products</h1>
          <p className="text-text-secondary font-mono">Explore our complete collection of premium gaming gear.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e);
              }}
              className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-sm uppercase"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>

          {/* Category Filter */}
          <div className="relative group w-full sm:w-auto">
            <button className="flex items-center justify-between w-full sm:w-auto gap-4 px-6 py-3 border border-border-color bg-bg-secondary text-text-primary hover:border-neon-blue transition-colors font-mono text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>Filter: {selectedCategory}</span>
              </div>
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-bg-secondary border border-border-color shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className="block w-full text-left px-4 py-3 text-sm font-mono uppercase text-text-secondary hover:bg-bg-primary hover:text-neon-blue transition-colors border-b border-border-color last:border-0"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
              setSearchQuery('');
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
