import { useState, useEffect, FormEvent } from 'react';
import { Search, ShoppingCart, Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';

const NAV_LINKS = [
  { labelFr: 'Accueil', labelAr: 'الرئيسية', href: '/' },
  { labelFr: 'Tous les produits', labelAr: 'كل المنتجات', href: '/products' },
  { labelFr: 'Clavier', labelAr: 'كلافيي', href: '/products?category=KEYBORDS' },
  { labelFr: 'Accessoire clavier', labelAr: 'اكسسوار كلافيي', href: '/products?category=KEYCAPS' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

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
  }, [location]);

  return (
    <>
      {/* Main top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-md border-b border-border-color transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Hamburger - mobile only */}
            <button
              className="lg:hidden p-2 text-text-primary hover:text-neon-blue transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              {config?.logo_url ? (
                <img src={config.logo_url} alt={config.store_name || 'Casa Gaming'} className="h-10 w-auto object-contain" />
              ) : (
                <span className="font-display font-bold text-2xl tracking-tighter leading-none text-text-primary group-hover:text-neon-blue transition-colors duration-300">
                  CASA<span className="text-neon-blue">GAMING</span>
                </span>
              )}
            </Link>

            {/* Desktop inline nav links */}
            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-mono font-medium uppercase tracking-wider py-1 border-b-2 transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-neon-blue border-neon-blue'
                      : 'text-text-secondary border-transparent hover:text-text-primary hover:border-text-secondary'
                  }`}
                >
                  {language === 'ar' ? link.labelAr : link.labelFr}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 180, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearchSubmit}
                      className="absolute right-8 top-1/2 -translate-y-1/2 overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder={t('nav.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-b border-border-color py-1 px-0 text-sm text-text-primary focus:outline-none focus:border-neon-blue font-mono uppercase placeholder:text-text-secondary"
                        autoFocus
                      />
                    </motion.form>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`text-text-secondary hover:text-text-primary transition-colors ${isSearchOpen ? 'text-neon-blue' : ''}`}
                >
                  <Search size={20} />
                </button>
              </div>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Language */}
              <button
                onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
                className="text-text-secondary hover:text-text-primary transition-colors font-mono font-bold text-sm border border-border-color px-2 py-0.5 rounded hover:border-neon-blue"
              >
                {language === 'fr' ? 'AR' : 'FR'}
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="font-mono text-xs font-bold text-neon-blue">[{cartCount}]</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Secondary sticky inline nav - always visible on all screens */}
        <div className="border-t border-border-color bg-bg-primary/95 overflow-x-auto scrollbar-hide">
          <div className={`flex items-center gap-0 max-w-7xl mx-auto ${isRTL ? 'flex-row-reverse' : ''}`}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex-shrink-0 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest border-b-2 transition-all duration-200 whitespace-nowrap ${
                  isActive(link.href)
                    ? 'text-neon-blue border-neon-blue bg-neon-blue/5'
                    : 'text-text-secondary border-transparent hover:text-text-primary hover:border-border-color'
                }`}
              >
                {language === 'ar' ? link.labelAr : link.labelFr}
              </Link>
            ))}
          </div>
        </div>
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: isRTL ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '100%' : '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`fixed top-0 bottom-0 w-full max-w-xs bg-bg-primary z-50 lg:hidden overflow-y-auto ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} border-border-color`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-12">
                  <span className="font-display font-bold text-xl text-text-primary">CASA<span className="text-neon-blue">GAMING</span></span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex flex-col space-y-8 flex-1">
                  {NAV_LINKS.map((link) => (
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
                </div>
                <div className="mt-auto pt-8 border-t border-border-color">
                  <Link
                    to="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-text-secondary hover:text-text-primary font-mono text-sm uppercase tracking-wider"
                  >
                    <ShoppingCart size={18} />
                    {language === 'ar' ? 'السلة' : 'Panier'} {cartCount > 0 && `[${cartCount}]`}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
