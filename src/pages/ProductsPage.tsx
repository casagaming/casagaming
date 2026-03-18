import { useState, useEffect, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, Search, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { turso, parseImageUrl } from '../lib/turso';

interface Product {
  id: string;
  name_ar: string;
  name_en: string;
  price: number;
  original_price?: number;
  image_url: string;
  category_id: string;
  category_name?: string;
  is_new?: boolean;
  is_sale?: boolean;
  stock: number;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const { language, t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await turso.execute(
          'SELECT name_en, name_ar FROM categories ORDER BY name_en ASC'
        );
        const cats = result.rows.map((row: any) => ({
          name_en: row[0] as string,
          name_ar: row[1] as string,
        }));
        setDbCategories([{ name_en: 'All', name_ar: 'الكل' }, ...cats]);
      } catch (error) {
        console.error('Error fetching categories for filter:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await turso.execute(
          `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                  p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count, p.category_id,
                  c.name_en AS category_name, c.name_ar AS category_name_ar,
                  (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id`
        );

        const formatted = result.rows.map((row: any) => {
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
            category_id: row[11],
            category_en: row[12] || 'Other',
            category_ar: row[13] || 'أخرى',
            name: language === 'ar' ? row[2] : row[1],
            image: images[0],
            hoverImage: images.length > 1 ? images[1] : undefined,
            images,
            isNew: row[6],
            isSale: row[7],
            originalPrice: row[4],
            variants_count: row[14],
          };
        });
        setProducts(formatted);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || 'All');
  }, [searchParams]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category_en === selectedCategory;
    const productName = language === 'ar' ? product.name_ar : product.name_en;
    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 bg-bg-secondary border border-border-color rounded-full text-text-secondary hover:text-neon-blue transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-4xl font-bold text-text-primary font-display uppercase tracking-tighter">Products</h1>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-10 py-3 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-sm uppercase"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          </div>

          <div className="relative group w-full sm:w-auto">
            <button className="flex items-center justify-between w-full sm:w-auto gap-4 px-6 py-3 border border-border-color bg-bg-secondary text-text-primary hover:border-neon-blue transition-colors font-mono text-sm uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>{language === 'ar' ? 'تصفية' : 'Filtrer'}: {selectedCategory === 'All' ? (language === 'ar' ? 'الكل' : 'Tout') : selectedCategory}</span>
              </div>
              <ChevronDown size={14} />
            </button>
            <div className="absolute right-0 mt-2 w-full sm:w-48 bg-bg-secondary border border-border-color shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              {dbCategories.map(cat => (
                <button
                  key={cat.name_en}
                  onClick={() => handleCategoryChange(cat.name_en)}
                  className="block w-full text-left px-4 py-3 text-sm font-mono uppercase text-text-secondary hover:bg-bg-primary hover:text-neon-blue transition-colors border-b border-border-color last:border-0"
                >
                  {language === 'ar' ? cat.name_ar : cat.name_en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[400px] bg-bg-secondary border border-border-color rounded-none" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
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
