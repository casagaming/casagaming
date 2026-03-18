import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useState, useEffect } from 'react';
import { turso } from '../lib/turso';

export default function Footer() {
  const { config } = useConfig();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await turso.execute('SELECT name_en FROM categories LIMIT 5');
        setCategories(result.rows.map((row: any) => ({ name_en: row[0] as string })));
      } catch (error) {
        console.error('Error fetching categories for footer:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-bg-primary border-t border-border-color pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full text-neon-blue">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <path d="M9 22V12h6v10" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl tracking-wider">
                <span className="text-neon-blue">CASA</span>
                <span className="text-neon-purple ml-1">GAMING</span>
              </span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              Premium gaming gear for the ultimate setup. Elevate your gameplay with our high-performance peripherals and accessories.
            </p>
            <div className="flex gap-4">
              {config?.facebook_url && (
                <a href={config.facebook_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-neon-blue transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {config?.instagram_url && (
                <a href={config.instagram_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-neon-purple transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {config?.twitter_url && (
                <a href={config.twitter_url} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-neon-blue transition-colors">
                  <Twitter size={20} />
                </a>
              )}
              {config?.whatsapp_number && (
                <a href={`https://wa.me/${config.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-green-500 transition-colors">
                  <Phone size={20} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-text-primary text-lg mb-6">Shop</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              {categories.map(cat => (
                <li key={cat.name_en}>
                  <Link to={`/products?category=${encodeURIComponent(cat.name_en)}`} className="hover:text-neon-blue transition-colors">
                    {cat.name_en}
                  </Link>
                </li>
              ))}
              <li><Link to="/products" className="hover:text-neon-blue transition-colors">All Products</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-text-primary text-lg mb-6">Support</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-neon-blue transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Warranty Info</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Track Order</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-neon-blue transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-text-primary text-lg mb-6">Contact</h3>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-neon-purple flex-shrink-0 mt-0.5" />
                <span>{config?.contact_address || 'Algiers, Algeria'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-neon-purple flex-shrink-0" />
                <span>{config?.contact_phone || '+213 555 123 456'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-neon-purple flex-shrink-0" />
                <span>{config?.contact_email || 'support@casagaming.dz'}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-color pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            &copy; {new Date().getFullYear()} Casa Gaming. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-text-secondary">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
