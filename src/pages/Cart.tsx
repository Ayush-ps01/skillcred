import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../contexts/CartContext';
import { formatCurrency } from '../utils/currency';
import { geminiService } from '../services/geminiService';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const { state: cartState, removeItem, updateQuantity, clearCart } = useCart();
  const { state: preferencesState } = useUserPreferences();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');

  React.useEffect(() => {
    if (cartState.items.length > 0) {
      loadAISummary();
    }
  }, [cartState.items]);

  const loadAISummary = async () => {
    try {
      const summary = await geminiService.generateCartSummary(cartState.items);
      setAiSummary(summary);
    } catch (error) {
      console.error('Error loading AI summary:', error);
    }
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      toast.success('Item removed from cart');
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      toast.success('Order placed successfully!');
      clearCart();
      setIsCheckingOut(false);
    }, 2000);
  };

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md">
            Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>Browse Products</span>
            </Link>
            <Link
              to="/chat"
              className="btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2"
            >
              <SparklesIcon className="w-5 h-5" />
              <span>Get AI Recommendations</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
          <p className="text-gray-600">
            Review your items and proceed to checkout
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Cart Items ({cartState.itemCount})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                <AnimatePresence>
                  {cartState.items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-6 flex items-center space-x-4"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        {item.category && (
                          <p className="text-sm text-gray-500">{item.category}</p>
                        )}
                        <p className="text-lg font-semibold text-primary-600">
                          {formatCurrency(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                        >
                          <MinusIcon className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-12 text-center text-gray-900 font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200"
                        >
                          <PlusIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Cart Actions */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                  >
                    Clear Cart
                  </button>
                  <Link
                    to="/products"
                    className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* AI Summary */}
              {aiSummary && (
                <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg border border-primary-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <SparklesIcon className="w-5 h-5 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">AI Summary</span>
                  </div>
                  <p className="text-sm text-gray-700">{aiSummary}</p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cartState.itemCount} items)</span>
                  <span>{formatCurrency(cartState.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(cartState.total * 0.08)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>{formatCurrency(cartState.total * 1.08)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  isCheckingOut
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure checkout powered by Shopify
                </p>
              </div>
            </div>

            {/* User Preferences Summary */}
            {preferencesState.isLoaded && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="font-medium text-gray-900 mb-3">Your Preferences</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span>{formatCurrency(preferencesState.preferences.budget.min)} - {formatCurrency(preferencesState.preferences.budget.max)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Style:</span>
                    <span>{preferencesState.preferences.style.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categories:</span>
                    <span>{preferencesState.preferences.categories.join(', ')}</span>
                  </div>
                </div>
                <Link
                  to="/chat"
                  className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                >
                  Update preferences with AI →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
