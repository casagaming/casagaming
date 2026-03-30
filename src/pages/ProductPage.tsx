import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { turso, parseImageUrl, isValidUrl, getOptimizedImageUrl, extractIdPrefixFromSlug } from '../lib/turso';
import LoadingSpinner from '../components/LoadingSpinner';
import { useConfig } from '../context/ConfigContext';
import RelatedProductsSlider from '../components/RelatedProductsSlider';
import { MessageSquare } from 'lucide-react';

const getHighQualityUrl = (url: string | null | undefined, width = 900) => {
  return getOptimizedImageUrl(url, width);
};

export default function ProductPage() {
  const { id: slug } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentDisplayImage, setCurrentDisplayImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { language, t, isRTL } = useLanguage();
  const { config } = useConfig();
  const navigate = useNavigate();

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const nextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
      setCurrentDisplayImage(null);
    }
  }, [product?.images?.length]);

  const prevImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
      setCurrentDisplayImage(null);
    }
  }, [product?.images?.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);


  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { idPrefix, isFullId } = extractIdPrefixFromSlug(slug!);
        const sql = isFullId
          ? `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                    p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                    p.description_en, p.description_ar, p.category_id,
                    c.name_en AS category_name, p.images, c.name_ar AS category_name_ar
             FROM products p LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = ?`
          : `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                    p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                    p.description_en, p.description_ar, p.category_id,
                    c.name_en AS category_name, p.images, c.name_ar AS category_name_ar
             FROM products p LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id LIKE ?`;
        const args = isFullId ? [idPrefix] : [`${idPrefix}%`];

        const productResult = await turso.execute({ sql, args });

        if (productResult.rows.length === 0) {
          setLoading(false);
          return;
        }

        const row = productResult.rows[0] as any[];
        const primaryImage = isValidUrl(row[5]) ? [row[5]] : [];
        const extraImages = parseImageUrl(row[15]);
        const rawImages = Array.from(new Set([...primaryImage, ...extraImages])).filter(Boolean);

        const productId = row[0];
        const variantsResult = await turso.execute({
          sql: `SELECT id, name_en, name_ar, image_url, stock FROM product_variants WHERE product_id = ?`,
          args: [productId],
        });

        const variants = variantsResult.rows.map((vrow: any) => ({
          id: vrow[0],
          name_en: vrow[1],
          name_ar: vrow[2],
          image_url: vrow[3],
          stock: vrow[4],
        }));

        const variantImages = variants.map((v: any) => v.image_url).filter(isValidUrl);
        const allImages = Array.from(new Set([...rawImages, ...variantImages]));

        setProduct({
          id: productId,
          name_en: row[1],
          name_ar: row[2],
          price: row[3],
          original_price: row[4],
          image_url: row[5],
          is_new: row[6],
          is_sale: row[7],
          stock: row[8],
          rating: row[9],
          reviews: row[10],
          description_en: row[11],
          description_ar: row[12],
          category_id: row[13],
          category_en: row[14] || 'Other',
          category_ar: row[16] || 'أخرى',
          name: language === 'ar' ? row[2] : row[1],
          image: allImages[0],
          images: allImages,
          isNew: row[6],
          isSale: row[7],
          originalPrice: row[4],
          variants,
        });
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug, language]);

  useEffect(() => {
    if (!product) return;
    const name = language === 'ar' ? (product.name_ar || product.name_en) : product.name_en;
    const desc = language === 'ar' ? (product.description_ar || product.description_en) : (product.description_en || '');
    const image = getHighQualityUrl(product.image_url || product.image, 800);

    document.title = `${name} | Casa Gaming`;

    const setMeta = (property: string, content: string, useProperty = true) => {
      const attr = useProperty ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('og:title', `${name} | Casa Gaming`);
    setMeta('og:description', desc.slice(0, 200));
    setMeta('og:image', image);
    setMeta('og:type', 'product');
    setMeta('og:url', window.location.href);
    setMeta('twitter:card', 'summary_large_image', false);
    setMeta('twitter:title', `${name} | Casa Gaming`, false);
    setMeta('twitter:description', desc.slice(0, 200), false);
    setMeta('twitter:image', image, false);

    return () => {
      document.title = 'Casa Gaming';
    };
  }, [product, language]);

  if (loading) {
    return <div className="pt-20 pb-20"><LoadingSpinner /></div>;
  }

  if (!product) {
    return (
      <div className="pt-20 pb-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('common.error')}</h2>
        <Link to="/products" className="text-neon-blue hover:underline mt-4 inline-block">
          {t('product.back')}
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      addToast(t('product.select_option'), 'error');
      return false;
    }
    const productToCart = { ...product, selectedVariant };
    for (let i = 0; i < quantity; i++) {
      addToCart(productToCart);
    }
    const variantName = selectedVariant ? (language === 'ar' ? selectedVariant.name_ar : selectedVariant.name_en) : '';
    const variantSuffix = variantName ? ` - ${variantName}` : '';
    addToast(language === 'ar' ? `تم إضافة ${quantity} ${product.name}${variantSuffix} إلى السلة` : `Ajouté ${quantity} ${product.name}${variantSuffix} au panier`, 'success');
    return true;
  };

  return (
    <div className={`pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
      <Link to="/products" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors font-mono uppercase text-sm tracking-wider">
        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} /> {t('product.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images Section */}
        <div className="space-y-4">
          <div
            className="bg-bg-secondary border border-border-color overflow-hidden aspect-square relative group"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence>
              <motion.img
                key={currentDisplayImage || activeImageIndex}
                src={getHighQualityUrl(currentDisplayImage || product.images[activeImageIndex])}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
              />
            </AnimatePresence>

            {product.isSale && (
              <span className={`absolute top-6 ${isRTL ? 'right-6' : 'left-6'} px-3 py-1 bg-neon-purple text-white font-bold uppercase tracking-wider text-sm`}>
                {t('product.sale')}
              </span>
            )}
            {isOutOfStock && (
              <span className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} px-3 py-1 bg-gray-800 text-white font-bold uppercase tracking-wider text-sm`}>
                {t('product.out_of_stock')}
              </span>
            )}

            {/* Arrow buttons */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm text-white rounded-full z-10 hover:bg-black/80 transition-all active:scale-90"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-black/50 backdrop-blur-sm text-white rounded-full z-10 hover:bg-black/80 transition-all active:scale-90"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Dots navigation inside image */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {product.images.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setCurrentDisplayImage(null);
                    }}
                    className={`rounded-full transition-all duration-500 ${
                      activeImageIndex === idx
                        ? 'bg-neon-blue w-6 h-2 shadow-[0_0_8px_rgba(0,243,255,0.8)]'
                        : 'bg-white/40 w-2 h-2 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <div>
          <span className="text-neon-blue font-bold tracking-widest uppercase text-sm mb-2 block font-mono">
            {language === 'ar' ? product.category_ar : product.category_en}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-display uppercase tracking-tighter leading-none">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-8 border-b border-border-color pb-6">
            <div className="flex items-center text-neon-blue gap-1">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-text-primary ml-2 font-mono">{product.rating}</span>
            </div>
            <span className="text-text-secondary">|</span>
            <span className="text-text-secondary font-mono text-sm uppercase">{product.reviews} {t('product.reviews')}</span>
          </div>

          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-bold text-text-primary font-mono">{Math.round(product.price)} {t('product.currency')}</span>
            {product.originalPrice > 0 && (
              <span className="text-xl text-text-secondary line-through mb-1 font-mono">{Math.round(product.originalPrice)} {t('product.currency')}</span>
            )}
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 border-t border-border-color pt-6">
              <h3 className="text-text-primary font-bold uppercase tracking-wider mb-4 font-mono text-sm">
                {t('product.select_option')}: <span className="text-neon-blue">{selectedVariant ? (language === 'ar' ? selectedVariant.name_ar : selectedVariant.name_en) : ''}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      setSelectedVariant(variant);
                      if (variant.image_url) setCurrentDisplayImage(variant.image_url);
                    }}
                    className={`px-4 py-2 border font-mono text-sm transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-neon-blue bg-neon-blue/10 text-text-primary'
                        : 'border-border-color hover:border-text-secondary text-text-secondary hover:text-text-primary bg-bg-secondary'
                    }`}
                  >
                    {language === 'ar' ? variant.name_ar : variant.name_en}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-10">
            {isOutOfStock ? (
              <div className="bg-bg-secondary border border-border-color text-text-secondary p-4 text-center font-bold uppercase tracking-wider">
                {t('product.out_of_stock')}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-stretch gap-6">
                  <div className="flex items-center border border-border-color">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-text-primary hover:bg-text-primary/10 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-3 font-bold text-text-primary w-12 text-center font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-3 text-text-primary hover:bg-text-primary/10 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto flex-1 bg-neon-blue border-2 border-neon-blue text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-cyan-300 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 group"
                  >
                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" /> {t('product.add_to_cart')}
                  </button>
                  <button
                    onClick={() => {
                      if (handleAddToCart()) {
                        navigate('/checkout');
                      }
                    }}
                    className="w-full sm:w-auto flex-1 bg-neon-blue text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-cyan-300 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.7)]"
                  >
                    {t('product.buy_now')}
                  </button>
                </div>
                {config?.whatsapp_number && (
                  <a
                    href={`https://wa.me/${config.whatsapp_number}?text=${encodeURIComponent(
                      language === 'ar' 
                        ? `مرحباً، أود طلب: ${product.name_ar}${selectedVariant ? ` (${selectedVariant.name_ar})` : ''}`
                        : `Bonjour, je souhaite commander : ${product.name_en}${selectedVariant ? ` (${selectedVariant.name_en})` : ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#25D366] text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-all flex items-center justify-center gap-3 group"
                  >
                    <MessageSquare size={20} /> {t('product.order_whatsapp')}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="mb-8 border-t border-border-color pt-6">
            <h3 className="text-text-primary font-bold uppercase tracking-wider mb-4 font-mono text-sm">{t('product.description')}</h3>
            <p className="text-text-secondary leading-relaxed text-base whitespace-pre-wrap">
              {language === 'ar'
                ? (product.description_ar || product.description_en || `Experience gaming like never before with the ${product.name}.`)
                : (product.description_en || product.description_ar || `Experience gaming like never before with the ${product.name}.`)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border-color pt-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-bg-secondary border border-border-color text-neon-purple">
                <Truck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider mb-1">{t('product.free_shipping')}</h4>
                <p className="text-xs text-text-secondary font-mono">{t('product.free_shipping_desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-bg-secondary border border-border-color text-neon-blue">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider mb-1">{t('product.quality')}</h4>
                <p className="text-xs text-text-secondary font-mono">{t('product.quality_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedProductsSlider currentProductId={product.id} categoryId={product.category_id} />
    </div>
  );
}
