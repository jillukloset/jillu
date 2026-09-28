export type ProductCategory = 'men' | 'women' | 'footwear' | 'accessories';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  details?: string[];
  materials?: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  rating: number;
  reviewsCount: number;
  badge?: 'PREMIUM' | 'TRENDING' | 'BESTSELLER' | 'CLASSIC' | 'SPORTSWEAR' | 'NEW' | 'LIMITED';
  collection?: string;
  inStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface CollectionItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  itemCount: number;
  featured?: boolean;
}
