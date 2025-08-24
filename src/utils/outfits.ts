import { ShopifyProduct } from '../services/shopifyService';

export interface OutfitSuggestion {
  items: ShopifyProduct[];
  totalPrice: number;
  label: string;
}

function byKeyword(p: ShopifyProduct, keywords: string[]): boolean {
  const hay = `${p.title} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
  return keywords.some(k => hay.includes(k));
}

export function suggestOutfits(products: ShopifyProduct[], maxBudget?: number): OutfitSuggestion[] {
  const tops = products.filter(p => byKeyword(p, ['t-shirt','tee','shirt','hoodie','top']));
  const bottoms = products.filter(p => byKeyword(p, ['jeans','pants','trousers','denim']));
  const footwear = products.filter(p => byKeyword(p, ['sneakers','shoes','footwear']));

  const suggestions: OutfitSuggestion[] = [];
  for (const t of tops.slice(0, 5)) {
    for (const b of bottoms.slice(0, 5)) {
      for (const f of footwear.slice(0, 5)) {
        const total = t.price + b.price + f.price;
        if (typeof maxBudget === 'number' && total > maxBudget) continue;
        suggestions.push({ items: [t, b, f], totalPrice: total, label: 'Top + Jeans + Sneakers' });
      }
    }
  }

  // Sort by price ascending and cap
  return suggestions.sort((a, b) => a.totalPrice - b.totalPrice).slice(0, 5);
}






