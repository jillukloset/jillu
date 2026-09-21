export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export type ExploreFilters = {
  q?: string;
  categorySlug?: string;
  brandSlug?: string;
  vibeSlug?: string;
  size?: string;
  condition?: string;
  gender?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  cursor?: string;
};
