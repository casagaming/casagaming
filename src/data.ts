
export interface ProductVariant {
  id: string;
  name_en: string;
  name_ar: string;
  image_url: string | null;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  hoverImage?: string;
  category: string;
  isNew?: boolean;
  isSale?: boolean;
  stock: number;
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Casa Pro 75% Mechanical Keyboard',
    price: 129.99,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1587829745563-84b705c08dc6?q=80&w=1000&auto=format&fit=crop',
    category: 'Keyboards',
    isNew: true,
    stock: 15
  },
  {
    id: '2',
    name: 'Neon Strike Wireless Mouse',
    price: 69.99,
    originalPrice: 89.99,
    rating: 4.8,
    reviews: 85,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop',
    category: 'Mice',
    isSale: true,
    stock: 8
  },
  {
    id: '3',
    name: 'Cyberpunk Desk Mat XL',
    price: 29.99,
    rating: 4.7,
    reviews: 240,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1527814050087-3793815479db?q=80&w=1000&auto=format&fit=crop',
    category: 'Accessories',
    stock: 50
  },
  {
    id: '4',
    name: 'Prism Keycap Set (PBT)',
    price: 45.00,
    rating: 4.6,
    reviews: 56,
    image: 'https://images.unsplash.com/photo-1555617981-778dd1c43165?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop',
    category: 'Keycaps',
    stock: 0
  },
  {
    id: '5',
    name: 'Casa Elite Headset RGB',
    price: 89.99,
    rating: 4.5,
    reviews: 92,
    image: 'https://images.unsplash.com/photo-1612021470627-00f3127273e7?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000&auto=format&fit=crop',
    category: 'Audio',
    isNew: true,
    stock: 22
  },
  {
    id: '6',
    name: 'Stream Deck Mini',
    price: 149.99,
    rating: 4.9,
    reviews: 310,
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1000&auto=format&fit=crop',
    category: 'Streaming',
    stock: 3
  },
  {
    id: '7',
    name: 'Phantom White 60% Board',
    price: 99.99,
    originalPrice: 119.99,
    rating: 4.7,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1587829745563-84b705c08dc6?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1555617981-778dd1c43165?q=80&w=1000&auto=format&fit=crop',
    category: 'Keyboards',
    isSale: true,
    stock: 100
  },
  {
    id: '8',
    name: 'Coiled Aviator Cable',
    price: 24.99,
    rating: 4.8,
    reviews: 45,
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=1000&auto=format&fit=crop',
    hoverImage: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1000&auto=format&fit=crop',
    category: 'Accessories',
    stock: 12
  }
];
