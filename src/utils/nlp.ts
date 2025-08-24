export interface ParsedFilters {
  text?: string;
  maxPrice?: number;
  color?: string;
  productType?: string;
  tags?: string[];
}

const knownColors = ['black','white','blue','red','green','yellow','brown','gray','grey','purple','pink','beige','navy'];
const typeSynonyms: Record<string, string[]> = {
  't-shirt': ['tshirt','tee','t-shirt','shirt','top'],
  'hoodie': ['hoodie','sweatshirt'],
  'jeans': ['jeans','denim','trousers','pants'],
  'shoes': ['shoes','sneakers','footwear','trainers'],
  'bag': ['bag','backpack','purse','handbag'],
  'laptop': ['laptop','notebook','ultrabook','macbook','gaming laptop'],
};

export function parseFiltersFromText(input: string): ParsedFilters {
  const text = input.toLowerCase();
  const filters: ParsedFilters = { tags: [] };

  // Price like "under 800", "< 800", "₹800", "under ₹800"
  const priceMatch = text.match(/(?:under|below|less than|<)\s*₹?\s*(\d{2,6})|₹\s*(\d{2,6})/);
  if (priceMatch) {
    const value = priceMatch[1] || priceMatch[2];
    if (value) filters.maxPrice = parseInt(value, 10);
  }

  // Color
  for (const color of knownColors) {
    if (text.includes(color)) {
      filters.color = color;
      break;
    }
  }

  // Product type via synonyms
  for (const canonical in typeSynonyms) {
    const syns = typeSynonyms[canonical];
    if (syns.some(s => text.includes(s))) {
      filters.productType = canonical;
      break;
    }
  }

  // Tags like fits or styles
  if (text.includes('oversized')) filters.tags!.push('oversized');
  if (text.includes('slim')) filters.tags!.push('slim');
  if (text.includes('casual')) filters.tags!.push('casual');
  if (text.includes('formal') || text.includes('office')) filters.tags!.push('formal');

  // Add remaining text as free-text if helpful
  const residualTerms: string[] = [];
  if (!filters.productType) residualTerms.push(...['t-shirt','shirt','hoodie','jeans','shoes','bag'].filter(t => text.includes(t)));
  if (residualTerms.length > 0) filters.text = residualTerms.join(' ');

  // If no residual terms, use raw input minimally (to keep Shopify query concise)
  if (!filters.text && !filters.productType) {
    const minimal = input.trim();
    if (minimal.length <= 80) filters.text = minimal;
  }

  return filters;
}


