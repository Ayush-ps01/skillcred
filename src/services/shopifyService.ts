import axios from 'axios';

// Shopify Storefront API configuration
const SHOPIFY_STOREFRONT_URL = process.env.REACT_APP_SHOPIFY_STOREFRONT_URL || '';
const SHOPIFY_STOREFRONT_TOKEN = process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN || '';

export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  variants: ProductVariant[];
  available: boolean;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  available: boolean;
  selectedOptions: SelectedOption[];
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ShopifyCollection {
  id: string;
  title: string;
  description: string;
  image?: string;
  products: ShopifyProduct[];
}

export interface SearchFilters {
  text?: string;
  maxPrice?: number;
  color?: string;
  productType?: string;
  tags?: string[];
}

export interface ShopifyCartLineInput {
  merchandiseId: string;
  quantity: number;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl?: string;
  totalQuantity?: number;
}

export class ShopifyService {
  private client = axios.create({
    baseURL: SHOPIFY_STOREFRONT_URL,
    headers: {
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_TOKEN,
      'Content-Type': 'application/json',
    },
  });

  async getProducts(limit: number = 20, after?: string): Promise<ShopifyProduct[]> {
    try {
      const query = `
        query getProducts($first: Int!, $after: String) {
          products(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            edges {
              node {
                id
                title
                description
                handle
                tags
                productType
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                      selectedOptions {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.client.post('', {
        query,
        variables: { first: limit, after },
      });

      const products = response.data.data.products.edges.map((edge: any) => {
        const node = edge.node;
        const price = parseFloat(node.priceRange.minVariantPrice.amount);
        const compareAtPrice = node.priceRange.maxVariantPrice.amount !== node.priceRange.minVariantPrice.amount 
          ? parseFloat(node.priceRange.maxVariantPrice.amount) 
          : undefined;

        return {
          id: node.id,
          title: node.title,
          description: node.description || '',
          price,
          compareAtPrice,
          images: node.images.edges.map((img: any) => img.node.url),
          category: node.productType || 'General',
          tags: node.tags || [],
          variants: node.variants.edges.map((variant: any) => ({
            id: variant.node.id,
            title: variant.node.title,
            price: parseFloat(variant.node.price.amount),
            available: variant.node.availableForSale,
            selectedOptions: variant.node.selectedOptions,
          })),
          available: node.availableForSale,
        };
      });

      return products;
    } catch (error) {
      console.error('Error fetching products from Shopify:', error);
      // Return empty to avoid forcing mock data when Shopify is not configured
      return [];
    }
  }

  async getProductById(id: string): Promise<ShopifyProduct | null> {
    try {
      const query = `
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            description
            handle
            tags
            productType
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 10) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.client.post('', {
        query,
        variables: { id },
      });

      const node = response.data.data.product;
      if (!node) return null;

      const price = parseFloat(node.priceRange.minVariantPrice.amount);
      const compareAtPrice = node.priceRange.maxVariantPrice.amount !== node.priceRange.minVariantPrice.amount 
        ? parseFloat(node.priceRange.maxVariantPrice.amount) 
        : undefined;

      return {
        id: node.id,
        title: node.title,
        description: node.description || '',
        price,
        compareAtPrice,
        images: node.images.edges.map((img: any) => img.node.url),
        category: node.productType || 'General',
        tags: node.tags || [],
        variants: node.variants.edges.map((variant: any) => ({
          id: variant.node.id,
          title: variant.node.title,
          price: parseFloat(variant.node.price.amount),
          available: variant.node.availableForSale,
          selectedOptions: variant.node.selectedOptions,
        })),
        available: node.availableForSale,
      };
    } catch (error) {
      console.error('Error fetching product from Shopify:', error);
      return null;
    }
  }

  async searchProducts(query: string, limit: number = 20): Promise<ShopifyProduct[]> {
    try {
      const searchQuery = `
        query searchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                description
                handle
                tags
                productType
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 5) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                      selectedOptions {
                        name
                        value
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.client.post('', {
        query: searchQuery,
        variables: { query, first: limit },
      });

      const products = response.data.data.products.edges.map((edge: any) => {
        const node = edge.node;
        const price = parseFloat(node.priceRange.minVariantPrice.amount);

        return {
          id: node.id,
          title: node.title,
          description: node.description || '',
          price,
          images: node.images.edges.map((img: any) => img.node.url),
          category: node.productType || 'General',
          tags: node.tags || [],
          variants: node.variants.edges.map((variant: any) => ({
            id: variant.node.id,
            title: variant.node.title,
            price: parseFloat(variant.node.price.amount),
            available: variant.node.availableForSale,
            selectedOptions: variant.node.selectedOptions,
          })),
          available: node.availableForSale,
        };
      });

      return products;
    } catch (error) {
      console.error('Error searching products from Shopify:', error);
      // Return empty to let other providers handle results
      return [];
    }
  }

  private buildQueryFromFilters(filters: SearchFilters): string {
    const parts: string[] = [];
    if (filters.text && filters.text.trim().length > 0) {
      const text = filters.text.trim().replace(/\s+/g, ' ');
      parts.push(`${text}`);
    }
    if (filters.productType) {
      parts.push(`product_type:'${filters.productType}'`);
    }
    if (filters.color) {
      parts.push(`tag:'${filters.color}'`);
    }
    if (filters.tags && filters.tags.length > 0) {
      for (const tag of filters.tags) {
        parts.push(`tag:'${tag}'`);
      }
    }
    if (typeof filters.maxPrice === 'number') {
      parts.push(`variants.price:<${filters.maxPrice}`);
    }
    // Join with AND so all constraints apply
    return parts.join(' AND ');
  }

  async searchWithFilters(filters: SearchFilters, limit: number = 20): Promise<ShopifyProduct[]> {
    try {
      const queryString = this.buildQueryFromFilters(filters);
      if (!queryString || queryString.trim().length === 0) {
        return this.getProducts(limit);
      }

      const searchQuery = `
        query searchProducts($query: String!, $first: Int!) {
          products(first: $first, query: $query) {
            edges {
              node {
                id
                title
                description
                handle
                tags
                productType
                availableForSale
                priceRange {
                  minVariantPrice { amount currencyCode }
                }
                images(first: 5) {
                  edges { node { url altText } }
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      price { amount currencyCode }
                      availableForSale
                      selectedOptions { name value }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.client.post('', {
        query: searchQuery,
        variables: { query: queryString, first: limit },
      });

      const products = response.data.data.products.edges.map((edge: any) => {
        const node = edge.node;
        const price = parseFloat(node.priceRange.minVariantPrice.amount);
        return {
          id: node.id,
          title: node.title,
          description: node.description || '',
          price,
          images: node.images.edges.map((img: any) => img.node.url),
          category: node.productType || 'General',
          tags: node.tags || [],
          variants: node.variants.edges.map((variant: any) => ({
            id: variant.node.id,
            title: variant.node.title,
            price: parseFloat(variant.node.price.amount),
            available: variant.node.availableForSale,
            selectedOptions: variant.node.selectedOptions,
          })),
          available: node.availableForSale,
        } as ShopifyProduct;
      });

      return products;
    } catch (error) {
      console.error('Error searching products with filters from Shopify:', error);
      // Fallback to mock with simple filter logic (improved)
      const mock = this.getMockProducts();
      return mock.filter(p => {
        const withinPrice = typeof filters.maxPrice === 'number' ? p.price <= filters.maxPrice : true;
        const matchColor = filters.color ? p.tags.some(t => t.toLowerCase() === filters.color!.toLowerCase()) : true;
        const matchType = filters.productType ? (
          p.category.toLowerCase().includes(filters.productType.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(filters.productType!.toLowerCase())) ||
          p.title.toLowerCase().includes(filters.productType.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.productType.toLowerCase())
        ) : true;
        const matchTags = filters.tags && filters.tags.length > 0 ? filters.tags.every(tag => p.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase())) : true;
        const matchText = filters.text ? (() => {
          const q = filters.text!.toLowerCase();
          const hay = `${p.title} ${p.description} ${p.category} ${p.tags.join(' ')}`.toLowerCase();
          return q.split(/\s+/).every(tok => hay.includes(tok));
        })() : true;
        return withinPrice && matchColor && matchType && matchTags && matchText;
      });
    }
  }

  async createCart(lines: ShopifyCartLineInput[] = []): Promise<ShopifyCart> {
    try {
      const mutation = `
        mutation cartCreate($input: CartInput) {
          cartCreate(input: $input) {
            cart { id checkoutUrl totalQuantity }
            userErrors { field message }
          }
        }
      `;

      const variables = { input: { lines } };
      const response = await this.client.post('', { query: mutation, variables });
      const result = response.data.data.cartCreate;
      if (result.userErrors && result.userErrors.length > 0) {
        throw new Error(result.userErrors.map((e: any) => e.message).join(', '));
      }
      return {
        id: result.cart.id,
        checkoutUrl: result.cart.checkoutUrl,
        totalQuantity: result.cart.totalQuantity,
      };
    } catch (error) {
      console.error('Error creating Shopify cart:', error);
      return { id: '' } as ShopifyCart;
    }
  }

  async cartLinesAdd(cartId: string, lines: ShopifyCartLineInput[]): Promise<ShopifyCart> {
    try {
      const mutation = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart { id totalQuantity checkoutUrl }
            userErrors { field message }
          }
        }
      `;

      const variables = { cartId, lines };
      const response = await this.client.post('', { query: mutation, variables });
      const result = response.data.data.cartLinesAdd;
      if (result.userErrors && result.userErrors.length > 0) {
        throw new Error(result.userErrors.map((e: any) => e.message).join(', '));
      }
      return {
        id: result.cart.id,
        checkoutUrl: result.cart.checkoutUrl,
        totalQuantity: result.cart.totalQuantity,
      };
    } catch (error) {
      console.error('Error adding lines to Shopify cart:', error);
      return { id: cartId } as ShopifyCart;
    }
  }

  // Mock data for development when Shopify API is not available
  private getMockProducts(): ShopifyProduct[] {
    return [
      {
        id: 'gid://shopify/Product/1',
        title: 'Premium Cotton T-Shirt',
        description: 'Comfortable, breathable cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes.',
        price: 29.99,
        compareAtPrice: 39.99,
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
          'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500'
        ],
        category: 'Clothing',
        tags: ['cotton', 'casual', 'comfortable', 't-shirt', 'shirt'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/1',
            title: 'Small / Black',
            price: 29.99,
            available: true,
            selectedOptions: [
              { name: 'Size', value: 'S' },
              { name: 'Color', value: 'Black' }
            ]
          },
          {
            id: 'gid://shopify/ProductVariant/2',
            title: 'Medium / Black',
            price: 29.99,
            available: true,
            selectedOptions: [
              { name: 'Size', value: 'M' },
              { name: 'Color', value: 'Black' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/11',
        title: '14" Lightweight Laptop',
        description: 'Portable notebook with 8GB RAM, 256GB SSD, ideal for students and work.',
        price: 49999,
        images: [
          'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'
        ],
        category: 'Electronics',
        tags: ['laptop','notebook','computer','portable'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/12',
            title: '8GB/256GB',
            price: 49999,
            available: true,
            selectedOptions: []
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/12',
        title: 'Gaming Laptop 15"',
        description: 'High-performance gaming laptop with dedicated GPU and fast refresh display.',
        price: 89999,
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
        ],
        category: 'Electronics',
        tags: ['laptop','gaming','computer'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/13',
            title: '16GB/512GB',
            price: 89999,
            available: true,
            selectedOptions: []
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/2',
        title: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and long battery life.',
        price: 89.99,
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500'
        ],
        category: 'Electronics',
        tags: ['wireless', 'bluetooth', 'noise-cancelling', 'headphones', 'audio'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/3',
            title: 'Black',
            price: 89.99,
            available: true,
            selectedOptions: [
              { name: 'Color', value: 'Black' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/3',
        title: 'Leather Crossbody Bag',
        description: 'Stylish and practical leather crossbody bag with multiple compartments.',
        price: 59.99,
        compareAtPrice: 79.99,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500',
          'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500'
        ],
        category: 'Accessories',
        tags: ['leather', 'crossbody', 'stylish', 'bag', 'purse'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/4',
            title: 'Brown',
            price: 59.99,
            available: true,
            selectedOptions: [
              { name: 'Color', value: 'Brown' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/4',
        title: 'Smart Fitness Watch',
        description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring and GPS.',
        price: 199.99,
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'
        ],
        category: 'Electronics',
        tags: ['fitness', 'smartwatch', 'health', 'watch', 'tracker'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/5',
            title: 'Black / 42mm',
            price: 199.99,
            available: true,
            selectedOptions: [
              { name: 'Color', value: 'Black' },
              { name: 'Size', value: '42mm' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/5',
        title: 'Organic Cotton Hoodie',
        description: 'Warm and cozy organic cotton hoodie perfect for cooler weather.',
        price: 49.99,
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
          'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500'
        ],
        category: 'Clothing',
        tags: ['organic', 'cotton', 'hoodie', 'warm', 'sweatshirt'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/6',
            title: 'Medium / Gray',
            price: 49.99,
            available: true,
            selectedOptions: [
              { name: 'Size', value: 'M' },
              { name: 'Color', value: 'Gray' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/6',
        title: 'Denim Jeans',
        description: 'Classic blue denim jeans with perfect fit and durability.',
        price: 79.99,
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500'
        ],
        category: 'Clothing',
        tags: ['denim', 'jeans', 'blue', 'casual', 'pants'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/7',
            title: '32 / Blue',
            price: 79.99,
            available: true,
            selectedOptions: [
              { name: 'Size', value: '32' },
              { name: 'Color', value: 'Blue' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/7',
        title: 'Laptop Backpack',
        description: 'Spacious laptop backpack with multiple compartments and comfortable straps.',
        price: 69.99,
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
          'https://images.unsplash.com/photo-1547949003-9792a18c2601?w=500'
        ],
        category: 'Accessories',
        tags: ['backpack', 'laptop', 'bag', 'school', 'work'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/8',
            title: 'Black',
            price: 69.99,
            available: true,
            selectedOptions: [
              { name: 'Color', value: 'Black' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/8',
        title: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with precision tracking and long battery life.',
        price: 34.99,
        images: [
          'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
          'https://images.unsplash.com/photo-1563297007-0686b7003af7?w=500'
        ],
        category: 'Electronics',
        tags: ['wireless', 'mouse', 'computer', 'ergonomic', 'gaming'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/9',
            title: 'Black',
            price: 34.99,
            available: true,
            selectedOptions: [
              { name: 'Color', value: 'Black' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/9',
        title: 'Sneakers',
        description: 'Comfortable and stylish sneakers perfect for everyday wear and light exercise.',
        price: 89.99,
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d114d2c36?w=500',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'
        ],
        category: 'Footwear',
        tags: ['sneakers', 'shoes', 'comfortable', 'casual', 'athletic'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/10',
            title: 'US 9 / White',
            price: 89.99,
            available: true,
            selectedOptions: [
              { name: 'Size', value: 'US 9' },
              { name: 'Color', value: 'White' }
            ]
          }
        ],
        available: true,
      },
      {
        id: 'gid://shopify/Product/10',
        title: 'Sunglasses',
        description: 'Trendy sunglasses with UV protection and modern frame design.',
        price: 129.99,
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'
        ],
        category: 'Accessories',
        tags: ['sunglasses', 'eyewear', 'fashion', 'uv-protection', 'trendy'],
        variants: [
          {
            id: 'gid://shopify/ProductVariant/11',
            title: 'Black Frame',
            price: 129.99,
            available: true,
            selectedOptions: [
              { name: 'Frame', value: 'Black' }
            ]
          }
        ],
        available: true,
      }
    ];
  }
}

export const shopifyService = new ShopifyService();
