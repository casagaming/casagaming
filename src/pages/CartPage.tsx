import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display uppercase tracking-tighter">Your Cart is Empty</h1>
        <p className="text-gray-400 mb-10 font-mono text-lg">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="inline-block bg-white text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all border border-transparent hover:border-white">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 font-display uppercase tracking-tighter">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary border border-border-color overflow-hidden">
            <div className="p-6 border-b border-border-color hidden sm:grid grid-cols-12 gap-4 text-sm font-bold text-text-secondary uppercase tracking-widest font-mono">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="divide-y divide-border-color">
              {items.map((item) => (
                <div key={item.id} className="p-6 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-6 flex items-center gap-6">
                    <div className="w-24 h-24 bg-bg-primary border border-border-color overflow-hidden flex-shrink-0 group">
                      <img src={item.selectedVariant?.image_url || item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary text-lg font-display uppercase tracking-wide mb-1">
                        {item.name} {item.selectedVariant ? `- ${item.selectedVariant.name_en}` : ''}
                      </h3>
                      <p className="text-sm text-neon-blue font-mono uppercase tracking-wider mb-3">{item.category}</p>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-red-500 text-xs hover:text-red-400 flex items-center gap-1 uppercase font-bold tracking-wider"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 text-center font-bold text-text-primary font-mono text-lg">
                    {item.price * 200} DA
                  </div>
                  
                  <div className="sm:col-span-2 flex justify-center">
                    <div className="flex items-center border border-border-color h-10">
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-3 text-text-primary hover:bg-text-primary/10 h-full transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-text-primary text-sm font-mono w-8 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="px-3 text-text-primary hover:bg-text-primary/10 h-full transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 text-right font-bold text-neon-blue font-mono text-lg">
                    {item.price * item.quantity * 200} DA
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <Link to="/products" className="text-text-secondary hover:text-text-primary font-bold uppercase tracking-wider flex items-center gap-2 transition-colors font-mono text-sm">
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-color p-8 sticky top-32">
            <h2 className="text-2xl font-bold text-text-primary mb-8 font-display uppercase tracking-wider">Order Summary</h2>
            
            <div className="space-y-4 mb-8 border-b border-border-color pb-8">
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>Subtotal</span>
                <span className="font-bold text-text-primary">{cartTotal * 200} DA</span>
              </div>
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>Shipping</span>
                <span className="text-neon-blue text-xs uppercase tracking-wider">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xl font-bold text-text-primary mb-8 font-display uppercase tracking-wider">
              <span>Total</span>
              <span>{cartTotal * 200} DA</span>
            </div>
            
            <Link to="/checkout" className="block w-full bg-neon-purple text-white text-center py-4 font-bold uppercase tracking-widest hover:bg-text-primary hover:text-bg-primary transition-all flex items-center justify-center gap-2 group">
              Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="mt-8 flex justify-center gap-4 opacity-30">
               {/* Payment icons placeholders */}
               <div className="w-10 h-6 bg-text-primary rounded-sm"></div>
               <div className="w-10 h-6 bg-text-primary rounded-sm"></div>
               <div className="w-10 h-6 bg-text-primary rounded-sm"></div>
               <div className="w-10 h-6 bg-text-primary rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
