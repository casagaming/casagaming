import { useState, useEffect } from 'react';
import { Home, Grid, Search, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { turso } from '../lib/turso';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string;
}

export default function MobileBottomNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { language, t, isRTL } = useLanguage();
  const { cartCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await turso.execute(
          'SELECT id, name_en, name_ar, image_url FROM categories ORDER BY name_en ASC'
        );
        const cats = result.rows.map((row: any) => ({
          id: row[0] as string,
          name_en: row[1] as string,
          name_ar: row[2] as string,
          image_url: row[3] as string,
        }));
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories for bottom nav:', error);
      }
    };

    fetchCategories();
  }, []);

  const navItems = [
    { icon: Home, label: t('nav.home'), href: '/', active: location.pathname === '/' },
    { icon: Grid, label: t('nav.categories'), onClick: () => setIsDrawerOpen(true), active: isDrawerOpen },
    { icon: Search, label: t('nav.search'), href: '/products', active: location.pathname === '/products' && !location.search.includes('category') },
    { icon: ShoppingCart, label: t('nav.cart'), href: '/cart', active: location.pathname === '/cart', badge: cartCount },
  ];

  return (
    <>
      {/* Bottom Nav Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-t border-border-color py-2 pb-safe px-6 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.1)] transition-colors duration-300">
        {navItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
             {item.href ? (
              <Link
                to={item.href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  item.active ? 'text-neon-blue' : 'text-text-secondary'
                }`}
              >
                <div className="relative">
                  <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-neon-blue text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium uppercase tracking-tighter">
                  {item.label}
                </span>
              </Link>
            ) : (
              <button
                onClick={item.onClick}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  item.active ? 'text-neon-blue' : 'text-text-secondary'
                }`}
              >
                <item.icon size={24} strokeWidth={item.active ? 2.5 : 2} />
                <span className="text-[10px] font-medium uppercase tracking-tighter">
                  {item.label}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Categories Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-bg-primary z-[70] lg:hidden rounded-t-[32px] border-t border-border-color overflow-hidden max-h-[85vh] flex flex-col transition-colors duration-300"
            >
              <div className="p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 px-2">
                  <h2 className="text-2xl font-display font-bold text-text-primary">
                    {t('nav.categories')}
                  </h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 rounded-full bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-8 px-2 scrollbar-hide">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?category=${encodeURIComponent(category.name_en)}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="relative group aspect-square rounded-2xl overflow-hidden border border-border-color hover:border-neon-blue transition-colors"
                    >
                      <img
                        src={category.image_url || 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=400&auto=format&fit=crop'}
                        alt={language === 'ar' ? category.name_ar : category.name_en}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-center">
                        <span className="text-sm font-bold text-white uppercase tracking-wider block">
                          {language === 'ar' ? category.name_ar : category.name_en}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Drag Handle (Visual Only) */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-border-color rounded-full" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
