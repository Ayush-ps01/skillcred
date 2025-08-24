import { shopifyService, ShopifyProduct } from './shopifyService';
import { amazonSearch, amazonEnabled } from './providers/amazonProvider';
import { flipkartSearch, flipkartEnabled } from './providers/flipkartProvider';
import { fakeStoreSearch } from './providers/fakeStoreProvider';

export interface CatalogSearchFilters {
  text?: string;
  maxPrice?: number;
  color?: string;
  productType?: string;
  tags?: string[];
}

class CatalogService {
  // For now, delegate to Shopify; later, add other providers (Amazon/Flipkart) and merge results
  async search(filters: CatalogSearchFilters, limit: number = 20): Promise<ShopifyProduct[]> {
    const results: ShopifyProduct[][] = await Promise.all([
      shopifyService.searchWithFilters(filters, limit),
      fakeStoreSearch(filters, Math.ceil(limit / 2)),
      amazonEnabled() ? amazonSearch(filters, Math.ceil(limit / 2)) : Promise.resolve([]),
      flipkartEnabled() ? flipkartSearch(filters, Math.ceil(limit / 2)) : Promise.resolve([]),
    ]);
    const merged = results.flat();
    // Simple dedupe by title + price
    const seen = new Set<string>();
    const unique: ShopifyProduct[] = [];
    for (const p of merged) {
      const key = `${p.title.toLowerCase()}|${p.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    }
    return unique.slice(0, limit);
  }

  async topProducts(limit: number = 20): Promise<ShopifyProduct[]> {
    const results: ShopifyProduct[][] = await Promise.all([
      shopifyService.getProducts(limit),
      fakeStoreSearch({}, Math.ceil(limit / 2)),
      amazonEnabled() ? amazonSearch({}, Math.ceil(limit / 2)) : Promise.resolve([]),
      flipkartEnabled() ? flipkartSearch({}, Math.ceil(limit / 2)) : Promise.resolve([]),
    ]);
    const merged = results.flat();
    // Simple dedupe by title + price
    const seen = new Set<string>();
    const unique: ShopifyProduct[] = [];
    for (const p of merged) {
      const key = `${p.title.toLowerCase()}|${p.price}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(p);
      }
    }
    return unique.slice(0, limit);
  }
}

export const catalogService = new CatalogService();


