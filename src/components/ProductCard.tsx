import React from 'react';
import { motion } from 'motion/react';
import { Star, AlertCircle } from 'lucide-react';
import { Product } from '../data';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: any; // Using any as the Product type might be out of date
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { language, t, isRTL } = useLanguage();
  
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const productName = language === 'ar' ? (product.name_ar || product.name) : (product.name_en || product.name);
  const categoryName = language === 'ar' ? (product.category_ar || product.category) : (product.category_en || product.category);

  const handleAddToCart = (e: React.MouseEvent) => {
    if (product.variants_count > 0) {
      return; // Link wrapper handles navigation
    }
    e.preventDefault();
    if (!isOutOfStock) {
      addToCart(product);
      addToast(language === 'ar' ? `تم إضافة ${productName} إلى السلة` : `Ajouté ${productName} au panier`, 'success');
    }
  };

  return (
    <motion.div 
      className={`group relative bg-card-bg border border-border-color hover:border-neon-blue transition-colors duration-300 ${isRTL ? 'text-right' : 'text-left'}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Badges */}
        <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-10 flex flex-col gap-2`}>
          {!!product.isNew && (
            <span className="px-2 py-1 bg-neon-blue text-black text-xs font-bold uppercase tracking-wider">
              {language === 'ar' ? 'جديد' : 'Nouveau'}
            </span>
          )}
          {!!product.isSale && (
            <span className="px-2 py-1 bg-neon-purple text-white text-xs font-bold uppercase tracking-wider">
              {t('product.sale')}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-1 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider">
              {t('product.out_of_stock')}
            </span>
          )}
        </div>

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-bg-secondary">
          <img
            src={product.image}
            alt={productName}
            className="w-full h-full object-cover transition-opacity duration-500 opacity-90 group-hover:opacity-100"
          />
          {product.hoverImage && (
             <img
               src={product.hoverImage}
               alt={productName}
               className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
             />
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4 flex flex-col h-full">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider font-mono">
              {categoryName}
            </div>
            {isLowStock && (
              <div className="flex items-center gap-1 text-neon-purple text-[10px] md:text-xs font-bold font-sans">
                <span>{language === 'ar' ? 'كمية قليلة' : 'Stock bas'}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-sm md:text-base font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-neon-blue transition-colors font-display uppercase tracking-wide min-h-[2.5rem]">
            {productName}
          </h3>
          
          <div className="mt-auto pt-3 border-t border-border-color/50 flex flex-col gap-3">
            <div className={`flex items-center gap-1.5 md:gap-2 font-mono ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="text-base md:text-lg font-bold text-text-primary">{Math.round(product.price * 200)} {t('product.currency')}</span>
              {product.originalPrice && (
                <span className="text-xs md:text-sm text-text-secondary line-through">{Math.round(product.originalPrice * 200)} {t('product.currency')}</span>
              )}
            </div>
            
            <div 
              onClick={handleAddToCart}
              className={`w-full py-2.5 px-4 text-[10px] md:text-xs uppercase font-bold tracking-widest transition-all duration-300 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} font-mono flex items-center justify-center gap-2
                ${product.variants_count > 0 
                  ? 'bg-transparent border border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black' 
                  : 'bg-neon-blue text-black hover:bg-neon-blue/80 shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                }`}
            >
              {isOutOfStock 
                ? (language === 'ar' ? 'نفذ' : 'Sold Out') 
                : (product.variants_count > 0 ? t('product.view_product') : t('product.add_to_cart'))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
