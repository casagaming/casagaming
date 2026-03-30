import { useState, useEffect, FormEvent } from 'react';
import { Search, ShoppingCart, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';
import { turso } from '../lib/turso';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
}

const STATIC_NAV_LINKS = [
  { labelFr: 'Accueil', labelAr: 'الرئيسية', href: '/' },
  { labelFr: 'Tous les produits', labelAr: 'كل المنتجات', href: '/products' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await turso.execute(
          'SELECT id, name_en, name_ar FROM categories ORDER BY name_en ASC'
        );
        const cats = result.rows.map((row: any) => ({
          id: row[0] as string,
          name_en: row[1] as string,
          name_ar: row[2] as string,
        }));
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories for nav:', error);
      }
    };
    fetchCategories();
  }, []);

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    const [path, query] = href.split('?');
    if (query) {
      return location.pathname === path && location.search.includes(query.split('=')[1]);
    }
    return location.pathname.startsWith(path) && !location.search;
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  return (
    <>
      {/* Main top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-b border-border-color transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Hamburger - all screens */}
            <button
              className="p-2 -ml-1 text-text-primary hover:text-neon-blue transition-colors flex-shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              {config?.logo_url ? (
                <img src={config.logo_url} alt={config.store_name || 'Casa Gaming'} className="h-8 sm:h-10 w-auto object-contain" />
              ) : (
                <span className="font-display font-bold text-xl sm:text-2xl tracking-tighter leading-none text-text-primary group-hover:text-neon-blue transition-colors duration-300">
                  CASA<span className="text-neon-blue">GAMING</span>
                </span>
              )}
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search icon - on mobile expands full-width bar below */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`p-1.5 transition-colors flex-shrink-0 ${isSearchOpen ? 'text-neon-blue' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Search size={20} />
              </button>

              {/* Theme toggle - always visible */}
              <button
                onClick={toggleTheme}
                className="p-1.5 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Language */}
              <button
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="text-text-secondary hover:text-text-primary transition-colors font-mono font-bold text-xs border border-border-color px-1.5 py-0.5 rounded hover:border-neon-blue flex-shrink-0"
              >
                {language === 'fr' ? 'AR' : 'FR'}
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative p-1.5 text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 flex-shrink-0">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="font-mono text-xs font-bold text-neon-blue">[{cartCount}]</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Full-width search bar - drops below navbar when active */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-border-color bg-bg-primary overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center gap-2">
                <Search size={16} className="text-text-secondary flex-shrink-0" />
                <input
                  type="text"
                  placeholder={t('nav.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent py-1 text-sm text-text-primary focus:outline-none font-mono uppercase placeholder:text-text-secondary"
                  autoFocus
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-text-secondary hover:text-text-primary flex-shrink-0">
                    <X size={16} />
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-shrink-0 px-3 py-1 bg-neon-blue text-black text-xs font-bold uppercase tracking-wider"
                >
                  {language === 'ar' ? 'بحث' : 'Go'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`fixed top-0 bottom-0 w-full max-w-xs bg-bg-primary z-50 overflow-y-auto ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} border-border-color`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <span className="font-display font-bold text-xl text-text-primary">CASA<span className="text-neon-blue">GAMING</span></span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col space-y-7 flex-1">
                  {STATIC_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`text-2xl font-display font-bold uppercase tracking-wider transition-colors ${
                        isActive(link.href) ? 'text-neon-blue' : 'text-text-primary hover:text-neon-blue'
                      }`}
                    >
                      {language === 'ar' ? link.labelAr : link.labelFr}
                    </Link>
                  ))}
                  {categories.length > 0 && (
                    <div className={`border-t border-border-color pt-6 flex flex-col space-y-5 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <span className="text-xs font-mono uppercase tracking-widest text-text-secondary">
                        {language === 'ar' ? 'الأصناف' : 'Catégories'}
                      </span>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/products?category=${encodeURIComponent(cat.name_en)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`text-xl font-display font-bold uppercase tracking-wider transition-colors ${
                            location.search.includes(`category=${encodeURIComponent(cat.name_en)}`)
                              ? 'text-neon-blue'
                              : 'text-text-primary hover:text-neon-blue'
                          }`}
                        >
                          {language === 'ar' ? cat.name_ar : cat.name_en}
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link
                    to="/about"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-2xl font-display font-bold uppercase tracking-wider transition-colors ${
                      isActive('/about') ? 'text-neon-blue' : 'text-text-primary hover:text-neon-blue'
                    }`}
                  >
                    {language === 'ar' ? 'من نحن' : 'À Propos'}
                  </Link>
                </div>

                <div className="mt-auto pt-8 border-t border-border-color flex items-center justify-between">
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-text-secondary hover:text-text-primary font-mono text-sm uppercase tracking-wider"
                  >
                    <ShoppingCart size={18} />
                    {language === 'ar' ? 'السلة' : 'Panier'} {cartCount > 0 && `[${cartCount}]`}
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
