export interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  image: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'men',
    name: 'Men',
    slug: 'men',
    itemCount: 84,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000',
    description: 'Elevated essentials, tailored outerwear, and modern street aesthetics crafted with meticulous detail.',
  },
  {
    id: 'women',
    name: 'Women',
    slug: 'women',
    itemCount: 96,
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000',
    description: 'Sculptural tailoring, silk slip silhouettes, and statement coats designed for timeless presence.',
  },
  {
    id: 'footwear',
    name: 'Footwear',
    slug: 'footwear',
    itemCount: 48,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=1000',
    description: 'Artisanal Italian leather boots, chunky lug derbies, and heritage archival sneakers.',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    itemCount: 62,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1000',
    description: 'Precision Swiss chronographs, Italian leather totes, and handmade acetate eyewear.',
  },
];
