import { useState, useEffect, FormEvent } from 'react';
import { Search, ShoppingCart, Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { useConfig } from '../context/ConfigContext';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { config } = useConfig();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name_en, name_ar')
          .order('name_en', { ascending: true });
        
        if (error) throw error;
        if (data) setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Categories', href: '/categories' },
    ...categories.slice(0, 5).map(cat => ({
      name: cat.name_en,
      href: `/products?category=${encodeURIComponent(cat.name_en)}`,
    })),
  ];

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/90 backdrop-blur-md border-b border-border-color py-4 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-text-primary hover:text-neon-blue transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              {config?.logo_url ? (
                <img src={config.logo_url} alt={config.store_name} className="h-10 w-auto object-contain" />
              ) : (
                <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl tracking-tighter leading-none text-text-primary group-hover:text-neon-blue transition-colors duration-300">
                    CASA<span className="text-neon-blue">GAMING</span>
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  <Link
                    to={link.href}
                    className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors py-2 uppercase tracking-wider font-mono"
                  >
                    {link.name}
                    {link.hasDropdown && <ChevronDown size={12} className="group-hover:rotate-180 transition-transform duration-200" />}
                  </Link>
                </div>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-6">
              {/* Search Bar */}
              <div className="relative flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 200, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearchSubmit}
                      className="absolute right-8 top-1/2 -translate-y-1/2 overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder="SEARCH..."
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

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <Link to="/cart" className="relative text-text-secondary hover:text-text-primary transition-colors group flex items-center gap-2">
                <ShoppingCart size={20} />
                <span className="font-mono text-xs font-bold">[{cartCount}]</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
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
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-xs bg-bg-primary border-r border-border-color z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-12">
                  <span className="font-display font-bold text-xl text-text-primary">CASA<span className="text-neon-blue">GAMING</span></span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-text-secondary hover:text-text-primary">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex flex-col space-y-8 flex-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-2xl font-display font-bold text-text-primary hover:text-neon-blue transition-colors uppercase tracking-wider"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <div className="mt-auto pt-8 border-t border-border-color">
                  <div className="flex flex-col gap-4 font-mono text-sm text-text-secondary">
                    <a href="#" className="hover:text-text-primary">ACCOUNT</a>
                    <a href="#" className="hover:text-text-primary">WISHLIST</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
