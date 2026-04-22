import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { X, ArrowLeft, ArrowRight, Sparkles, Tag, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { turso, parseImageUrl } from '../lib/turso';

type SortPrice = 'none' | 'asc' | 'desc';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCategory = searchParams.get('category') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [newOnly, setNewOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [sortPrice, setSortPrice] = useState<SortPrice>('none');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t, isRTL } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productsResult = await turso.execute(
          `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                  p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count, p.category_id,
                  c.name_en AS category_name, c.name_ar AS category_name_ar,
                  (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id) as variants_count
           FROM products p
           LEFT JOIN categories c ON p.category_id = c.id`
        );

        const formatted = productsResult.rows.map((row: any) => {
          const images = parseImageUrl(row[5], 200);
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

    fetchData();
  }, []);

  const categoryDisplayName = selectedCategory === 'All'
    ? (language === 'ar' ? 'كل المنتجات' : 'Tous les produits')
    : selectedCategory;

  const priceMin = minPrice !== '' ? Number(minPrice) : null;
  const priceMax = maxPrice !== '' ? Number(maxPrice) : null;

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category_en === selectedCategory;
        const productName = language === 'ar' ? product.name_ar : product.name_en;
        const matchesSearch = searchQuery === '' || productName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMin = priceMin === null || product.price >= priceMin;
        const matchesMax = priceMax === null || product.price <= priceMax;
        const matchesNew = !newOnly || product.is_new;
        const matchesSale = !saleOnly || product.is_sale;
        return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesNew && matchesSale;
      })
      .sort((a, b) => {
        if (sortPrice === 'asc') return a.price - b.price;
        if (sortPrice === 'desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, priceMin, priceMax, newOnly, saleOnly, sortPrice, language]);

  const hasPriceFilter = minPrice !== '' || maxPrice !== '';
  const hasCategory = selectedCategory !== 'All';

  const cycleSortPrice = () => {
    setSortPrice(prev => prev === 'none' ? 'asc' : prev === 'asc' ? 'desc' : 'none');
  };

  const SortIcon = sortPrice === 'asc' ? ArrowUp : sortPrice === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <div className={`pt-20 pb-20 min-h-screen ${isRTL ? 'text-right' : 'text-left'}`}>

      {/* Category header bar — shown when filtering by category */}
      {hasCategory && (
        <div className={`bg-bg-secondary border-b border-border-color px-3 sm:px-6 lg:px-8 py-3 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={() => navigate(-1)}
            className={`p-1.5 rounded-full bg-bg-primary border border-border-color text-text-secondary hover:text-neon-blue hover:border-neon-blue transition-colors flex-shrink-0`}
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
          </button>
          <span className="font-display font-bold text-base sm:text-lg uppercase tracking-wider text-text-primary">
            {categoryDisplayName}
          </span>
        </div>
      )}

      <div className={`px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto`}>

        {/* Filter row */}
        <div className={`flex items-center gap-2 py-4 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>

          {/* NOUVEAU button */}
          <button
            onClick={() => setNewOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
              newOnly
                ? 'bg-neon-blue text-black border-neon-blue'
                : 'bg-bg-secondary border-border-color text-text-primary hover:border-neon-blue'
            }`}
          >
            <Sparkles size={13} />
            {language === 'ar' ? 'جديد' : 'Nouveau'}
          </button>

          {/* SOLDE button */}
          <button
            onClick={() => setSaleOnly(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
              saleOnly
                ? 'bg-neon-purple text-white border-neon-purple'
                : 'bg-bg-secondary border-border-color text-text-primary hover:border-neon-purple'
            }`}
          >
            <Tag size={13} />
            {language === 'ar' ? 'تخفيض' : 'Solde'}
          </button>

          {/* Divider */}
          <div className="w-px h-7 bg-border-color mx-1" />

          {/* PRIX sort button */}
          <button
            onClick={cycleSortPrice}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-mono font-semibold uppercase tracking-wider transition-all ${
              sortPrice !== 'none'
                ? 'bg-bg-secondary border-neon-blue text-neon-blue'
                : 'bg-bg-secondary border-border-color text-text-primary hover:border-neon-blue'
            }`}
          >
            <SortIcon size={13} />
            {language === 'ar' ? 'السعر' : 'Prix'}
            {sortPrice === 'asc' && <span className="text-[10px]">↑</span>}
            {sortPrice === 'desc' && <span className="text-[10px]">↓</span>}
          </button>

          {/* Price inputs */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''} ml-auto`}>
            <input
              type="number"
              placeholder={language === 'ar' ? 'أدنى' : 'Min'}
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="w-20 sm:w-24 px-2 py-2 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-xs rounded-lg"
            />
            <span className="text-text-secondary font-mono text-sm">—</span>
            <input
              type="number"
              placeholder={language === 'ar' ? 'أقصى' : 'Max'}
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="w-20 sm:w-24 px-2 py-2 bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-neon-blue font-mono text-xs rounded-lg"
            />
            <span className="text-text-secondary font-mono text-[11px]">{t('product.currency')}</span>
            {hasPriceFilter && (
              <button onClick={() => { setMinPrice(''); setMaxPrice(''); }} className="p-1 text-text-secondary hover:text-neon-blue transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[280px] md:h-[400px] bg-bg-secondary border border-border-color" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
              onClick={() => { setMinPrice(''); setMaxPrice(''); setNewOnly(false); setSaleOnly(false); setSortPrice('none'); }}
              className="text-neon-blue hover:text-white font-bold uppercase tracking-wider border-b border-neon-blue hover:border-white transition-all pb-1"
            >
              {language === 'ar' ? 'مسح الفلاتر' : 'Effacer les filtres'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
