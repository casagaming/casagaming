import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Truck, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name_en
            ),
            variants:product_variants(*)
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          const rawImages = Array.isArray(data.image_url) ? data.image_url : [data.image_url];
          const variantImages = data.variants?.map((v: any) => v.image_url).filter(Boolean) || [];
          const allImages = Array.from(new Set([...rawImages, ...variantImages]));
          
          const formattedProduct = {
            ...data,
            name: data.name_en,
            image: allImages[0],
            images: allImages,
            isNew: data.is_new,
            isSale: data.is_sale,
            originalPrice: data.original_price,
            category: data.categories?.name_en || 'Other',
            variants: data.variants || []
          };
          setProduct(formattedProduct);
          if (formattedProduct.variants && formattedProduct.variants.length > 0) {
            // Do not select a variant by default so user can clearly see options
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="pt-32 pb-20"><LoadingSpinner /></div>;
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
        <Link to="/products" className="text-neon-blue hover:underline mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = () => {
    if (product.variants && product.variants.length > 0 && !selectedVariant) {
      addToast('Please select an option first', 'error');
      return false;
    }
    const productToCart = { ...product, selectedVariant };
    for (let i = 0; i < quantity; i++) {
      addToCart(productToCart);
    }
    const variantSuffix = selectedVariant ? ` - ${selectedVariant.name_en}` : '';
    addToast(`Added ${quantity} ${product.name}${variantSuffix} to cart`, 'success');
    return true;
  };

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300">
      <Link to="/products" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-8 transition-colors font-mono uppercase text-sm tracking-wider">
        <ArrowLeft size={16} /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images Gallery */}
        <div className="space-y-4">
          <div className="bg-bg-secondary border border-border-color overflow-hidden aspect-square relative group">
            <AnimatePresence mode="wait">
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
              <span className="absolute top-6 left-6 px-3 py-1 bg-neon-purple text-white font-bold uppercase tracking-wider text-sm">
                Sale
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-6 right-6 px-3 py-1 bg-gray-800 text-white font-bold uppercase tracking-wider text-sm">
                Out of Stock
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
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

        {/* Product Info */}
        <div>
          <span className="text-neon-blue font-bold tracking-widest uppercase text-sm mb-2 block font-mono">
            {product.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 font-display uppercase tracking-tighter leading-none">{product.name}</h1>

          <div className="flex items-center gap-4 mb-8 border-b border-border-color pb-6">
            <div className="flex items-center text-neon-blue gap-1">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-text-primary ml-2 font-mono">{product.rating}</span>
            </div>
            <span className="text-text-secondary">|</span>
            <span className="text-text-secondary font-mono text-sm">{product.reviews} REVIEWS</span>
          </div>

          <div className="flex items-end gap-4 mb-8">
            <span className="text-4xl font-bold text-text-primary font-mono">{Math.round(product.price * 200)} DA</span>
            {product.originalPrice && (
              <span className="text-xl text-text-secondary line-through mb-1 font-mono">{Math.round(product.originalPrice * 200)} DA</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className={`flex items-center gap-2 font-bold mb-8 p-4 border ${isLowStock ? 'text-neon-purple bg-neon-purple/10 border-neon-purple/30' : 'text-neon-blue bg-neon-blue/10 border-neon-blue/30'}`}>
              <span className="uppercase tracking-wider text-sm">
                {isLowStock ? 'Limited Quantity Available' : 'Product is currently in stock'}
              </span>
            </div>
          )}

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 border-t border-border-color pt-6">
              <h3 className="text-text-primary font-bold uppercase tracking-wider mb-4 font-mono text-sm">
                Select Option: <span className="text-neon-blue">{selectedVariant?.name_en}</span>
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
                    {variant.name_en}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-text-secondary mb-10 leading-relaxed text-lg font-light border-l-2 border-border-color pl-6">
            {product.description_en || product.description_ar || `Experience gaming like never before with the ${product.name}. Engineered for precision, speed, and durability, this is the ultimate upgrade for your battle station. Features premium materials and cutting-edge technology to give you the competitive edge.`}
          </p>

          <div className="mb-10">
            {isOutOfStock ? (
              <div className="bg-bg-secondary border border-border-color text-text-secondary p-4 text-center font-bold uppercase tracking-wider">
                This item is currently out of stock.
              </div>
            ) : (
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
                  <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (handleAddToCart()) {
                      navigate('/checkout');
                    }
                  }}
                  className="w-full sm:w-auto flex-1 bg-text-primary text-bg-primary px-8 py-4 font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all flex items-center justify-center gap-3 group"
                >
                  Buy Now
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-border-color pt-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-bg-secondary border border-border-color text-neon-purple">
                <Truck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider mb-1">Free Shipping</h4>
                <p className="text-xs text-text-secondary font-mono">On orders over 20,000 DA</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-bg-secondary border border-border-color text-neon-blue">
                <ShieldCheck size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-bold text-text-primary text-sm uppercase tracking-wider mb-1">2-Year Warranty</h4>
                <p className="text-xs text-text-secondary font-mono">Full coverage protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
