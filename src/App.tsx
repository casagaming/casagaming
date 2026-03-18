import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop';
import { LanguageProvider } from './context/LanguageContext';
import { ConfigProvider } from './context/ConfigContext';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderReceivedPage = lazy(() => import('./pages/OrderReceivedPage'));

export default function App() {
  return (
    <ConfigProvider>
      <LanguageProvider>
        <ToastProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen bg-bg-primary text-text-primary selection:bg-neon-blue selection:text-white">
                <Navbar />

                <main>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/categories" element={<CategoriesPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-received" element={<OrderReceivedPage />} />
                    </Routes>
                  </Suspense>
                </main>

                <Footer />
              </div>
            </Router>
          </CartProvider>
        </ToastProvider>
      </LanguageProvider>
    </ConfigProvider>
  );
}
