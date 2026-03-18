import { Link } from 'react-router-dom';
import { Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { language, t, isRTL } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center min-h-[60vh] flex flex-col justify-center items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-display uppercase tracking-tighter">{t('cart.empty')}</h1>
        <p className="text-gray-400 mb-10 font-mono text-lg">
          {language === 'ar' ? 'يبدو أنك لم تضف أي شيء إلى سلتك بعد.' : 'Il semble que vous n\'ayez encore rien ajouté à votre panier.'}
        </p>
        <Link to="/products" className="inline-block bg-white text-black px-10 py-4 font-bold uppercase tracking-widest hover:bg-neon-blue hover:text-black transition-all border border-transparent hover:border-white">
          {language === 'ar' ? 'ابدأ التسوق' : 'Commencer les achats'}
        </Link>
      </div>
    );
  }

  return (
    <div className={`pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${isRTL ? 'text-right' : 'text-left'}`}>
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-12 font-display uppercase tracking-tighter">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary border border-border-color overflow-hidden">
            <div className={`p-6 border-b border-border-color hidden sm:grid grid-cols-12 gap-4 text-sm font-bold text-text-secondary uppercase tracking-widest font-mono ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="col-span-6">{language === 'ar' ? 'المنتج' : 'Produit'}</div>
              <div className="col-span-2 text-center">{language === 'ar' ? 'السعر' : 'Prix'}</div>
              <div className="col-span-2 text-center">{language === 'ar' ? 'الكمية' : 'Quantité'}</div>
              <div className="col-span-2 text-right">{language === 'ar' ? 'المجموع' : 'Total'}</div>
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
                        {language === 'ar' ? (item.name_ar || item.name) : (item.name_en || item.name)} 
                        {item.selectedVariant ? ` - ${language === 'ar' ? (item.selectedVariant.name_ar || item.selectedVariant.name_en) : item.selectedVariant.name_en}` : ''}
                      </h3>
                      <p className="text-sm text-neon-blue font-mono uppercase tracking-wider mb-3">
                        {language === 'ar' ? (item.category_ar || item.category) : (item.category_en || item.category)}
                      </p>
                      <button 
                        onClick={() => removeFromCart(item.cartItemId)}
                        className="text-red-500 text-xs hover:text-red-400 flex items-center gap-1 uppercase font-bold tracking-wider"
                      >
                        <Trash2 size={14} /> {language === 'ar' ? 'إزالة' : 'Supprimer'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 text-center font-bold text-text-primary font-mono text-lg">
                    {item.price * 200} {t('product.currency')}
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
                    {item.price * item.quantity * 200} {t('product.currency')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8">
            <Link to="/products" className="text-text-secondary hover:text-text-primary font-bold uppercase tracking-wider flex items-center gap-2 transition-colors font-mono text-sm">
              {isRTL ? '←' : '←'} {language === 'ar' ? 'مواصلة التسوق' : 'Continuer les achats'}
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border-color p-8 sticky top-32">
            <h2 className="text-2xl font-bold text-text-primary mb-8 font-display uppercase tracking-wider">Order Summary</h2>
            
            <div className="space-y-4 mb-8 border-b border-border-color pb-8">
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-text-primary">{cartTotal * 200} {t('product.currency')}</span>
              </div>
              <div className="flex justify-between text-text-secondary font-mono text-sm">
                <span>{language === 'ar' ? 'الشحن' : 'Expédition'}</span>
                <span className="text-neon-blue text-xs uppercase tracking-wider">
                  {language === 'ar' ? 'يتم حسابه عند إتمام الطلب' : 'Calculé à la caisse'}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-xl font-bold text-text-primary mb-8 font-display uppercase tracking-wider">
              <span>{t('cart.total')}</span>
              <span>{cartTotal * 200} {t('product.currency')}</span>
            </div>
            
            <Link to="/checkout" className="block w-full bg-neon-purple text-white text-center py-4 font-bold uppercase tracking-widest hover:bg-text-primary hover:text-bg-primary transition-all flex items-center justify-center gap-2 group">
              {t('cart.checkout')} <ArrowRight size={18} className={`transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} />
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
