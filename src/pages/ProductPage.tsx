import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { turso, parseImageUrl, isValidUrl } from '../lib/turso';
import LoadingSpinner from '../components/LoadingSpinner';
import { useConfig } from '../context/ConfigContext';
import RelatedProductsSlider from '../components/RelatedProductsSlider';
import { MessageSquare } from 'lucide-react';

const getHighQualityUrl = (url: string | null | undefined) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    if (url.includes('/upload/q_')) return url;
    return url.replace('/upload/', '/upload/q_100,f_auto/');
  }
  return url;
};

export default function ProductPage() {
  const { id } = useParams();
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

  const nextImage = useCallback(() => {
    if (product?.images?.length > 1) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
      setCurrentDisplayImage(null);
    }
  }, [product?.images?.length]);

  useEffect(() => {
    if (product?.images?.length > 1) {
      const interval = setInterval(nextImage, 5000);
      return () => clearInterval(interval);
    }
  }, [nextImage, product?.images?.length]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productResult = await turso.execute({
          sql: `SELECT p.id, p.name_en, p.name_ar, p.price, p.original_price, p.image_url,
                       p.is_new, p.is_sale, p.stock, p.rating, p.reviews_count,
                       p.description_en, p.description_ar, p.category_id,
                       c.name_en AS category_name, p.images, c.name_ar AS category_name_ar
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ?`,
          args: [id!],
        });

        if (productResult.rows.length === 0) {
          setLoading(false);
          return;
        }

        const row = productResult.rows[0] as any[];
        const primaryImage = isValidUrl(row[5]) ? [row[5]] : [];
        const extraImages = parseImageUrl(row[15]);
        const rawImages = Array.from(new Set([...primaryImage, ...extraImages])).filter(Boolean);

        const variantsResult = await turso.execute({
          sql: `SELECT id, name_en, name_ar, image_url, stock FROM product_variants WHERE product_id = ?`,
          args: [id!],
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

    if (id) fetchProduct();
  }, [id, language]);

  if (loading) {
    return <div className="pt-32 pb-20"><LoadingSpinner /></div>;
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center">
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
    <div className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
      <Link to="/products" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors font-mono uppercase text-sm tracking-wider">
        <ArrowLeft size={16} className={isRTL ? 'rotate-180' : ''} /> {t('product.back')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images Section */}
        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border-color overflow-hidden aspect-square relative group">
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
          </div>

          {/* Dots for mobile - Moved below image */}
          {product.images.length > 1 && (
            <div className="flex justify-center gap-2 sm:hidden py-4">
              {product.images.map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all border border-border-color ${
                    activeImageIndex === idx ? 'bg-neon-blue w-6 border-neon-blue' : 'bg-bg-secondary'
                  }`}
                />
              ))}
            </div>
          )}


          {/* Thumbnails for desktop */}
          {product.images.length > 1 && (
            <div className="hidden sm:grid grid-cols-4 sm:grid-cols-6 gap-3">
              {product.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => { setActiveImageIndex(index); setCurrentDisplayImage(null); }}
                  className={`aspect-square border-2 transition-all overflow-hidden bg-bg-secondary ${
                    (activeImageIndex === index && !currentDisplayImage) ? 'border-neon-blue' : 'border-border-color hover:border-text-secondary'
                  }`}
                >
                  <img src={getHighQualityUrl(img)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
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
            {product.originalPrice && (
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
                    className="w-full sm:w-auto flex-1 bg-bg-secondary border border-border-color text-text-primary px-8 py-4 font-bold uppercase tracking-widest hover:bg-text-primary/10 transition-all flex items-center justify-center gap-3 group"
                  >
                    <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" /> {t('product.add_to_cart')}
                  </button>
                  <button
                    onClick={() => {
                      if (handleAddToCart()) {
                        navigate('/checkout');
                      }
                    }}
                    className="w-full sm:w-auto flex-1 bg-text-primary text-bg-primary px-8 py-4 font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all flex items-center justify-center gap-3 group"
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
            <p className="text-text-secondary leading-relaxed text-lg font-light border-l-2 border-border-color pl-6">
              {language === 'ar' ? product.description_ar : (product.description_en || `Experience gaming like never before with the ${product.name}.`)}
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
                <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider mb-1">{t('product.warranty')}</h4>
                <p className="text-xs text-text-secondary font-mono">{t('product.warranty_desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedProductsSlider currentProductId={product.id} categoryId={product.category_id} />
    </div>
  );
}
