import axios from 'axios';
import { ShopifyProduct } from '../shopifyService';
import { CatalogSearchFilters } from '../catalogService';

const BASE_URL = 'https://fakestoreapi.com';

function normalizeCategory(input?: string): string | undefined {
  if (!input) return undefined;
  const t = input.toLowerCase();
  if (t.includes('jewel')) return 'jewelery';
  if (t.includes('elect')) return 'electronics';
  if (t.includes("men")) return "men's clothing";
  if (t.includes("women")) return "women's clothing";
  return undefined;
}

function mapItemToProduct(item: any): ShopifyProduct {
  return {
    id: `fakestore:${item.id}`,
    title: item.title,
    description: item.description || '',
    price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0)),
    images: item.image ? [item.image] : [],
    category: item.category || 'General',
    tags: ['vendor:fakestore', item.category].filter(Boolean),
    variants: [
      {
        id: `fakestore-variant:${item.id}`,
        title: 'Default',
        price: typeof item.price === 'number' ? item.price : parseFloat(String(item.price || 0)),
        available: true,
        selectedOptions: [],
      },
    ],
    available: true,
  };
}

export async function fakeStoreSearch(filters: CatalogSearchFilters, limit: number = 20): Promise<ShopifyProduct[]> {
  try {
    console.log('FakeStore search called with filters:', filters);
    const cat = normalizeCategory(filters.productType || filters.text);
    console.log('Normalized category:', cat);
    let url = `${BASE_URL}/products`;
    if (cat) url = `${BASE_URL}/products/category/${encodeURIComponent(cat)}`;
    console.log('FakeStore API URL:', url);
    const { data } = await axios.get(url);
    console.log('FakeStore API response:', data);
    const items: any[] = Array.isArray(data) ? data : [];
    const products = items.map(mapItemToProduct);
    console.log('Mapped products:', products);
    // Client filter for text and price
    const q = (filters.text || '').trim().toLowerCase();
    const filtered = products.filter(p => {
      const withinPrice = typeof filters.maxPrice === 'number' ? p.price <= filters.maxPrice : true;
      const hay = `${p.title} ${p.description} ${p.category}`.toLowerCase();
      const matchText = q ? q.split(/\s+/).every(tok => hay.includes(tok)) : true;
      return withinPrice && matchText;
    });
    console.log('Final filtered results:', filtered);
    return filtered.slice(0, limit);
  } catch (error: any) {
    console.error('FakeStore provider error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return [];
  }
}

export async function fakeStoreGetById(id: string): Promise<ShopifyProduct | null> {
  try {
    const numId = id.startsWith('fakestore:') ? id.split(':')[1] : id;
    const { data } = await axios.get(`${BASE_URL}/products/${numId}`);
    return mapItemToProduct(data);
  } catch {
    return null;
  }
}


