import axios from 'axios';
import { ShopifyProduct } from '../shopifyService';
import { CatalogSearchFilters } from '../catalogService';

const FLIPKART_SEARCH_ENDPOINT = process.env.REACT_APP_FLIPKART_SEARCH_ENDPOINT || '';

function buildQuery(filters: CatalogSearchFilters): string {
  const parts: string[] = [];
  if (filters.text) parts.push(filters.text);
  if (filters.productType) parts.push(filters.productType);
  if (filters.color) parts.push(filters.color);
  if (filters.tags && filters.tags.length > 0) parts.push(...filters.tags);
  return parts.join(' ');
}

function mapFlipkartItemToProduct(item: any): ShopifyProduct {
  const price = typeof item.price === 'number' ? item.price : parseFloat(item.price?.amount ?? '0');
  return {
    id: `flipkart:${item.id ?? item.sku ?? Math.random().toString(36).slice(2)}`,
    title: item.title || item.name || 'Flipkart Product',
    description: item.description || '',
    price: price || 0,
    compareAtPrice: undefined,
    images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
    category: item.category || 'Flipkart',
    tags: ['vendor:flipkart'].concat(item.tags || []),
    variants: [
      {
        id: `flipkart-variant:${item.id ?? Math.random().toString(36).slice(2)}`,
        title: 'Default',
        price: price || 0,
        available: true,
        selectedOptions: [],
      },
    ],
    available: true,
  };
}

export async function flipkartSearch(filters: CatalogSearchFilters, limit: number = 20): Promise<ShopifyProduct[]> {
  try {
    if (!FLIPKART_SEARCH_ENDPOINT) {
      return [];
    }
    const q = buildQuery(filters);
    const response = await axios.get(FLIPKART_SEARCH_ENDPOINT, {
      params: { q, maxPrice: filters.maxPrice, limit },
    });
    const items = Array.isArray(response.data?.items) ? response.data.items : [];
    return items.map(mapFlipkartItemToProduct).slice(0, limit);
  } catch (error) {
    console.error('Flipkart provider error:', error);
    return [];
  }
}

export function flipkartEnabled(): boolean {
  return Boolean(FLIPKART_SEARCH_ENDPOINT);
}






