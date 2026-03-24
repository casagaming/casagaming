import { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, ChevronDown, Search, ArrowLeft, ArrowUpDown, X, Sparkles, Tag, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { turso, parseImageUrl } from '../lib/turso';

type SortOption = 'default' | 'price_high_low' | 'price_low_high';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState<SortOption>('default');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
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
          const images = parseImageUrl(row[5], 400);
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

  const priceMin = minPrice !== '' ? Number(minPrice) : null;
  const priceMax = maxPrice !== '' ? Number(maxPrice) : null;

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category_en === selectedCategory;
        const productName = language === 'ar' ? product.name_ar : product.name_en;
        const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMin = priceMin === null || product.price >= priceMin;
        const matchesMax = priceMax === null || product.price <= priceMax;
        const matchesNew = !newOnly || product.is_new;
        const matchesSale = !saleOnly || product.is_sale;
        const matchesStock = !inStockOnly || product.stock > 0;
        return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesNew && matchesSale && matchesStock;
      })
      .sort((a, b) => {
        if (sortOption === 'price_high_low') return b.price - a.price;
        if (sortOption === 'price_low_high') return a.price - b.price;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, priceMin, priceMax, newOnly, saleOnly, inStockOnly, sortOption, language]);

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

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortOption('default');
    setMinPrice('');
    setMaxPrice('');
    setNewOnly(false);
    setSaleOnly(false);
    setInStockOnly(false);
    setSearchParams({});
  };

  const sortLabels: Record<SortOption, string> = {
    default: t('sort.default'),
    price_high_low: t('sort.price_high_low'),
    price_low_high: t('sort.price_low_high'),
  };

  const activeFilters: { label: string; onRemove: () => void }[] = [];
  if (selectedCategory !== 'All') {
    const cat = dbCategories.find(c => c.name_en === selectedCategory);
    activeFilters.push({
      label: language === 'ar' ? (cat?.name_ar || selectedCategory) : selectedCategory,
      onRemove: () => handleCategoryChange('All'),
    });
  }
  if (minPrice !== '') activeFilters.push({ label: `≥ ${minPrice} ${t('product.currency')}`, onRemove: () => setMinPrice('') });
  if (maxPrice !== '') activeFilters.push({ label: `≤ ${maxPrice} ${t('product.currency')}`, onRemove: () => setMaxPrice('') });
  if (newOnly) activeFilters.push({ label: t('filter.new_only'), onRemove: () => setNewOnly(false) });
  if (saleOnly) activeFilters.push({ label: t('filter.sale_only'), onRemove: () => setSaleOnly(false) });
  if (inStockOnly) activeFilters.push({ label: t('filter.in_stock'), onRemove: () => setInStockOnly(false) });
  if (sortOption !== 'default') activeFilters.push({ label: sortLabels[sortOption], onRemove: () => setSortOption('default') });

  return (
    <div className={`pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}>

      <div className={`flex items-center gap-4 mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Link to="/" className="p-2 bg-bg-secondary border border-border-color rounded-full text-text-secondary hover:text-neon-blue transition-colors">
          <ArrowLeft size={20} className={isRTL ? 'rotate-180' : ''} />
        </Link>
        <h1 className="text-4xl font-bold text-text-primary font-display uppercase tracking-tighter">
          {t('nav.products')}
        </h1>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 mb-6">

        {/* Row 1: Search + Category + Price range */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={handleSearch}
              className={`w-full py-3 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-sm uppercase ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
            />
            <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-text-secondary ${isRTL ? 'right-3' : 'left-3'}`} />
          </div>

          <div className="relative group">
            <button className="flex items-center gap-3 px-5 py-3 border border-border-color bg-bg-secondary text-text-primary hover:border-neon-blue transition-colors font-mono text-sm uppercase tracking-wider whitespace-nowrap w-full sm:w-auto">
              <Filter size={15} />
              <span>{language === 'ar' ? 'الصنف' : 'Catégorie'}: {selectedCategory === 'All' ? (language === 'ar' ? 'الكل' : 'Tout') : selectedCategory}</span>
              <ChevronDown size={13} />
            </button>
            <div className={`absolute top-full mt-1 w-52 bg-bg-secondary border border-border-color shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 ${isRTL ? 'right-0' : 'left-0'}`}>
              {dbCategories.map(cat => (
                <button
                  key={cat.name_en}
                  onClick={() => handleCategoryChange(cat.name_en)}
                  className={`block w-full px-4 py-2.5 text-sm font-mono uppercase transition-colors border-b border-border-color last:border-0 ${isRTL ? 'text-right' : 'text-left'} ${selectedCategory === cat.name_en ? 'text-neon-blue bg-bg-primary' : 'text-text-secondary hover:bg-bg-primary hover:text-neon-blue'}`}
                >
                  {language === 'ar' ? cat.name_ar : cat.name_en}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <button className="flex items-center gap-3 px-5 py-3 border border-border-color bg-bg-secondary text-text-primary hover:border-neon-blue transition-colors font-mono text-sm uppercase tracking-wider whitespace-nowrap w-full sm:w-auto">
              <span>{t('filter.price_range')}</span>
              <ChevronDown size={13} />
            </button>
            <div className={`absolute top-full mt-1 w-64 bg-bg-secondary border border-border-color shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30 p-4 ${isRTL ? 'right-0' : 'left-0'}`}>
              <p className="text-xs text-text-secondary font-mono uppercase mb-3">{t('filter.price_range')}</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder={t('filter.min')}
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-sm"
                />
                <span className="text-text-secondary font-mono">—</span>
                <input
                  type="number"
                  placeholder={t('filter.max')}
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-bg-primary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Quick filters - always visible as horizontal scroll */}
        <div className="overflow-x-auto scrollbar-hide -mx-1">
          <div className={`flex items-center gap-2 px-1 pb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* Nouveau */}
            <button
              onClick={() => setNewOnly(v => !v)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                newOnly
                  ? 'border-neon-blue bg-neon-blue text-black'
                  : 'border-border-color bg-bg-secondary text-text-secondary hover:border-neon-blue hover:text-neon-blue'
              }`}
            >
              <Sparkles size={13} />
              {language === 'ar' ? 'جديد' : 'Nouveau'}
            </button>

            {/* Solde */}
            <button
              onClick={() => setSaleOnly(v => !v)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                saleOnly
                  ? 'border-neon-purple bg-neon-purple text-white'
                  : 'border-border-color bg-bg-secondary text-text-secondary hover:border-neon-purple hover:text-neon-purple'
              }`}
            >
              <Tag size={13} />
              {language === 'ar' ? 'تخفيضات' : 'Solde'}
            </button>

            {/* Divider */}
            <div className="flex-shrink-0 w-px h-7 bg-border-color mx-1" />

            {/* Prix bas → haut */}
            <button
              onClick={() => setSortOption(sortOption === 'price_low_high' ? 'default' : 'price_low_high')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                sortOption === 'price_low_high'
                  ? 'border-neon-blue bg-neon-blue text-black'
                  : 'border-border-color bg-bg-secondary text-text-secondary hover:border-neon-blue hover:text-neon-blue'
              }`}
            >
              <ArrowUpDown size={13} />
              {language === 'ar' ? 'سعر ↑' : 'Prix ↑'}
            </button>

            {/* Prix haut → bas */}
            <button
              onClick={() => setSortOption(sortOption === 'price_high_low' ? 'default' : 'price_high_low')}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                sortOption === 'price_high_low'
                  ? 'border-neon-blue bg-neon-blue text-black'
                  : 'border-border-color bg-bg-secondary text-text-secondary hover:border-neon-blue hover:text-neon-blue'
              }`}
            >
              <ArrowUpDown size={13} />
              {language === 'ar' ? 'سعر ↓' : 'Prix ↓'}
            </button>

            <div className="flex-shrink-0 w-px h-7 bg-border-color mx-1" />

            {/* En stock */}
            <button
              onClick={() => setInStockOnly(v => !v)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border font-mono text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${
                inStockOnly
                  ? 'border-green-500 bg-green-500 text-black'
                  : 'border-border-color bg-bg-secondary text-text-secondary hover:border-green-500 hover:text-green-500'
              }`}
            >
              <PackageCheck size={13} />
              {language === 'ar' ? 'متوفر' : 'En stock'}
            </button>

            {/* Clear all */}
            {activeFilters.length > 0 && (
              <>
                <div className="flex-shrink-0 w-px h-7 bg-border-color mx-1" />
                <button
                  onClick={clearAllFilters}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono uppercase text-text-secondary hover:text-white transition-colors"
                >
                  <X size={12} />
                  {language === 'ar' ? 'مسح' : 'Effacer'}
                </button>
              </>
            )}
          </div>
        </div>

        {!loading && (
          <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">
            {filteredProducts.length} {t('filter.results')}
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-[400px] bg-bg-secondary border border-border-color" />
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
          <p className="text-text-secondary text-lg font-mono uppercase mb-4">
            {language === 'ar' ? 'لا توجد منتجات مطابقة.' : 'Aucun produit trouvé.'}
          </p>
          <button
            onClick={clearAllFilters}
            className="text-neon-blue hover:text-white font-bold uppercase tracking-wider border-b border-neon-blue hover:border-white transition-all pb-1"
          >
            {t('filter.clear_all')}
          </button>
        </div>
      )}
    </div>
  );
}
