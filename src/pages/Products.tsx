
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FunnelIcon, 
  MagnifyingGlassIcon,
  SparklesIcon,
  HeartIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import { ShopifyProduct } from '../services/shopifyService';
import { catalogService } from '../services/catalogService';
import { geminiService, ProductRecommendation } from '../services/geminiService';
import { useCart } from '../contexts/CartContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<ProductRecommendation[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  
  const { addItem } = useCart();
  const { state: preferencesState } = useUserPreferences();

  // Filters state
  const [filters, setFilters] = useState({
    category: '',
    priceRange: { min: 0, max: 1000 },
    inStock: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    if (preferencesState.isLoaded && products.length > 0) {
      loadAIRecommendations();
    }
  }, [preferencesState.isLoaded, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await catalogService.topProducts(50);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    try {
      const recommendations = await geminiService.getProductRecommendations(
        'Show me personalized recommendations',
        preferencesState.preferences,
        products
      );
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      try {
        console.log('Searching for:', query);
        const searchResults = await catalogService.search({ text: query });
        console.log('Search results:', searchResults);
        setFilteredProducts(searchResults);
        setSearchParams({ search: query });
      } catch (error) {
        console.error('Error searching products:', error);
        toast.error('Search failed');
      }
    } else {
      setFilteredProducts(products);
      setSearchParams({});
    }
  };

  const applyFilters = () => {
    let filtered = products;

    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    filtered = filtered.filter(product => 
      product.price >= filters.priceRange.min && 
      product.price <= filters.priceRange.max
    );

    if (filters.inStock) {
      filtered = filtered.filter(product => product.available);
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: { min: 0, max: 1000 },
      inStock: false,
    });
    setFilteredProducts(products);
  };

  const handleAddToCart = (product: ShopifyProduct) => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images[0] || '',
      quantity: 1,
      category: product.category,
    });
    toast.success(`${product.title} added to cart!`);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Discover amazing products with AI-powered recommendations</p>
          
          {/* Available Products Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-3">
              <strong>Available Products:</strong> We have {products.length} products across {categories.length} categories including Clothing, Electronics, Accessories, and Footwear. 
              Try searching for specific items like "shirt", "headphones", "bag", or browse by category.
            </p>
            
            {/* Quick Search Demo */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-blue-700 font-medium">Quick search:</span>
              {['shirt', 'jeans', 'headphones', 'bag', 'watch', 'shoes', 'mouse', 'sunglasses'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchQuery(term);
                    handleSearch(term);
                  }}
                  className="text-xs bg-blue-100 text-blue-700 rounded-full px-3 py-1 hover:bg-blue-200 transition-colors duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => handleSearch(searchQuery)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors duration-200"
                >
                  Search
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <span>Try: </span>
                {['shirt', 'jeans', 'headphones', 'bag', 'watch', 'shoes'].map((term, index) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="text-primary-600 hover:text-primary-700 underline mr-2"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, min: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => setFilters({
                        ...filters,
                        priceRange: { ...filters.priceRange, max: Number(e.target.value) }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  onClick={applyFilters}
                  className="btn-primary"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <SparklesIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-semibold text-gray-900">AI Recommendations for You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiRecommendations.map((rec) => {
                const product = products.find(p => p.id === rec.id);
                if (!product) return null;
                
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        AI Recommended
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-primary-600 font-bold mb-2">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {rec.reason}
                      </p>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <ShoppingCartIcon className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No products found matching your criteria.</p>
                
                {searchQuery && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['shirt', 'jeans', 'headphones', 'bag', 'watch', 'shoes'].map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSearch(term)}
                          className="text-sm bg-white border border-gray-200 rounded-full px-3 py-1 hover:bg-primary-50 hover:border-primary-200 transition-colors duration-200"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-500">
                  <p className="mb-2">Popular categories:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['Clothing', 'Electronics', 'Accessories', 'Footwear'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setFilters({ ...filters, category })}
                        className="text-xs bg-primary-100 text-primary-700 rounded-full px-3 py-1 hover:bg-primary-200 transition-colors duration-200"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="relative">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    {!product.available && (
                      <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-primary-600 font-bold">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <span className="text-gray-400 line-through text-sm">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.available}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                        product.available
                          ? 'bg-primary-600 text-white hover:bg-primary-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      <span>
                        {product.available ? 'Add to Cart' : 'Out of Stock'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
