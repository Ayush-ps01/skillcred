import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  HeartIcon,
  StarIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { shopifyService, ShopifyProduct } from '../services/shopifyService';
import { geminiService, ProductRecommendation } from '../services/geminiService';
import { useCart } from '../contexts/CartContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { formatCurrency } from '../utils/currency';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ShopifyProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState<ProductRecommendation[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ShopifyProduct[]>([]);
  
  const { addItem } = useCart();
  const { state: preferencesState } = useUserPreferences();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  useEffect(() => {
    if (product && preferencesState.isLoaded) {
      loadAIRecommendations();
      loadRelatedProducts();
    }
  }, [product, preferencesState.isLoaded]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      if (id) {
        const productData = await shopifyService.getProductById(id);
        setProduct(productData);
        if (productData && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadAIRecommendations = async () => {
    if (!product) return;
    
    try {
      const products = await shopifyService.getProducts(50);
      const recommendations = await geminiService.getProductRecommendations(
        `Recommend products similar to ${product.title}`,
        preferencesState.preferences,
        products.filter(p => p.id !== product.id)
      );
      setAiRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading AI recommendations:', error);
    }
  };

  const loadRelatedProducts = async () => {
    if (!product) return;
    
    try {
      const products = await shopifyService.getProducts(50);
      const related = products
        .filter(p => p.id !== product.id && p.category === product.category)
        .slice(0, 4);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    addItem({
      id: selectedVariant.id,
      name: `${product.title} - ${selectedVariant.title}`,
      price: selectedVariant.price,
      image: product.images[selectedImage] || product.images[0] || '',
      quantity,
      category: product.category,
    });
    
    toast.success(`${product.title} added to cart!`);
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
    setQuantity(1);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600 transition-colors duration-200">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="hover:text-primary-600 transition-colors duration-200">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-2xl bg-gray-100">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg ${
                      selectedImage === index
                        ? 'ring-2 ring-primary-500'
                        : 'hover:opacity-75'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-lg text-gray-600">{product.description}</p>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-primary-600">
                {formatCurrency(selectedVariant ? selectedVariant.price : product.price)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                  Sale
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Options</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      disabled={!variant.available}
                      className={`p-3 border rounded-lg text-left transition-colors duration-200 ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : variant.available
                          ? 'border-gray-300 hover:border-gray-400'
                          : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="font-medium">{variant.title}</div>
                      <div className="text-sm">{formatCurrency(variant.price)}</div>
                      {!variant.available && (
                        <div className="text-xs text-red-500">Out of Stock</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                >
                  -
                </button>
                <span className="w-16 text-center text-gray-900 font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant?.available}
                className={`w-full py-4 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  selectedVariant?.available
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span>
                  {selectedVariant?.available ? 'Add to Cart' : 'Out of Stock'}
                </span>
              </button>

              <button className="w-full py-4 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2">
                <HeartIcon className="w-5 h-5" />
                <span>Add to Wishlist</span>
              </button>
            </div>

            {/* Product Meta */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Category:</span>
                <span className="text-sm font-medium text-gray-900">{product.category}</span>
              </div>
              {product.tags.length > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">Availability:</span>
                <span className={`text-sm font-medium ${
                  product.available ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.available ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {aiRecommendations.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center space-x-2 mb-8">
              <SparklesIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiRecommendations.map((rec) => {
                const recommendedProduct = relatedProducts.find(p => p.id === rec.id);
                if (!recommendedProduct) return null;
                
                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative">
                      <img
                        src={recommendedProduct.images[0]}
                        alt={recommendedProduct.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                        AI Recommended
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {recommendedProduct.title}
                      </h3>
                      <p className="text-primary-600 font-bold mb-2">
                        {formatCurrency(recommendedProduct.price)}
                      </p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {rec.reason}
                      </p>
                      <Link
                        to={`/product/${recommendedProduct.id}`}
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <span>View Product</span>
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="relative">
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.title}
                      className="w-full h-48 object-cover"
                    />
                    {relatedProduct.compareAtPrice && relatedProduct.compareAtPrice > relatedProduct.price && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.title}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-primary-600 font-bold">
                        {formatCurrency(relatedProduct.price)}
                      </span>
                      {relatedProduct.compareAtPrice && relatedProduct.compareAtPrice > relatedProduct.price && (
                        <span className="text-gray-400 line-through text-sm">
                          {formatCurrency(relatedProduct.compareAtPrice)}
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/product/${relatedProduct.id}`}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <span>View Product</span>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* AI Chat CTA */}
        <section className="mt-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Need Help Choosing?
            </h2>
            <p className="text-primary-100 mb-6">
              Chat with our AI assistant to get personalized recommendations, style advice, and answers to your questions.
            </p>
            <Link
              to="/chat"
              className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Chat with AI Assistant</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;

