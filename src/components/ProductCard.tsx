import React from 'react';
import { motion } from 'motion/react';
import { Star, AlertCircle } from 'lucide-react';
import { Product } from '../data';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isOutOfStock) {
      addToCart(product);
      addToast(`Added ${product.name} to cart`, 'success');
    }
  };

  return (
    <motion.div 
      className="group relative bg-card-bg border border-border-color hover:border-neon-blue transition-colors duration-300"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
          {product.isNew && (
            <span className="px-2 py-1 bg-neon-blue text-black text-xs font-bold uppercase tracking-wider">
              New
            </span>
          )}
          {product.isSale && (
            <span className="px-2 py-1 bg-neon-purple text-white text-xs font-bold uppercase tracking-wider">
              Sale
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-1 bg-gray-800 text-white text-xs font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>

        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-bg-secondary">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-opacity duration-500 opacity-90 group-hover:opacity-100"
          />
          {product.hoverImage && (
             <img
               src={product.hoverImage}
               alt={product.name}
               className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
             />
          )}
        </div>

        {/* Content */}
        <div className="p-3 md:p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="text-[10px] md:text-xs text-text-secondary uppercase tracking-wider font-mono">{product.category}</div>
            {isLowStock && (
              <div className="flex items-center gap-1 text-neon-purple text-[10px] md:text-xs font-bold font-sans">
                <span>Low Stock</span>
              </div>
            )}
          </div>
          
          <h3 className="text-sm md:text-base font-bold text-text-primary mb-2 md:mb-3 line-clamp-2 group-hover:text-neon-blue transition-colors font-display uppercase tracking-wide">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5 md:gap-2 font-mono">
              <span className="text-base md:text-lg font-bold text-text-primary">{Math.round(product.price * 200)} DA</span>
              {product.originalPrice && (
                <span className="text-xs md:text-sm text-text-secondary line-through">{Math.round(product.originalPrice * 200)} DA</span>
              )}
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="text-[10px] md:text-xs uppercase font-bold tracking-wider border-b border-text-primary pb-0.5 text-text-primary hover:text-neon-blue hover:border-neon-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
            >
              {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
