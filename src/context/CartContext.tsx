import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../data';

export interface CartItem extends Product {
  cartItemId: string; // Unique ID for cart item (product.id + variant.id)
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
        try {
          const parsed = JSON.parse(savedCart);
          return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error('Failed to parse cart from local storage');
        }
      }
    }
    return [];
  });

  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems(prev => {
      const cartItemId = product.selectedVariant 
        ? `${product.id}-${product.selectedVariant.id}`
        : product.id;

      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item => 
          item.cartItemId === cartItemId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, cartItemId, quantity: 1 }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(prev => 
      prev.map(item => 
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
