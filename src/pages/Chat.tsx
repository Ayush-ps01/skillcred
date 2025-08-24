import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  SparklesIcon,
  ShoppingCartIcon,
  UserIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { geminiService, ChatMessage } from '../services/geminiService';
import { useCart } from '../contexts/CartContext';
import { useUserPreferences } from '../contexts/UserPreferencesContext';
import { shopifyService } from '../services/shopifyService';
import { parseFiltersFromText } from '../utils/nlp';
import { catalogService } from '../services/catalogService';
import { amountUntilFreeShipping, isCloseToThreshold } from '../utils/pricing';
import { suggestOutfits } from '../utils/outfits';
import { analyticsService } from '../services/analyticsService';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/currency';
import { createSpeechRecognizer } from '../utils/voice';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI shopping assistant. I can help you find products, get style advice, manage your cart, and much more. What would you like to do today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<ReturnType<typeof createSpeechRecognizer> | null>(null);
  
  const { state: cartState, addItem } = useCart();
  const { state: preferencesState } = useUserPreferences();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    speechRef.current = createSpeechRecognizer({
      onResult: (text) => {
        setInputMessage(text);
      },
      onEnd: () => setIsListening(false),
    });
  }, []);

  const quickSuggestions = [
    "Show me clothing recommendations",
    "What's in my cart?",
    "Help me find a gift",
    "Give me style advice",
    "What's my budget?",
    "Show me trending products"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      analyticsService.trackEvent('chat:message', { role: 'user' });
      // Check for specific commands
      if (inputMessage.toLowerCase().includes('cart') || inputMessage.toLowerCase().includes('what\'s in my cart')) {
        await handleCartQuery();
      } else if (inputMessage.toLowerCase().includes('budget') || inputMessage.toLowerCase().includes('my budget')) {
        await handleBudgetQuery();
      } else if (inputMessage.toLowerCase().includes('recommend') || inputMessage.toLowerCase().includes('suggestion')) {
        await handleRecommendationQuery(inputMessage);
      } else if (await shouldHandleDiscovery(inputMessage)) {
        await handleDiscoveryQuery(inputMessage);
      } else if (inputMessage.toLowerCase().includes('outfit') || inputMessage.toLowerCase().includes('full look')) {
        await handleOutfitQuery(inputMessage);
      } else {
        // General chat response
        const response = await geminiService.chatWithAssistant(
          [...messages, userMessage],
          preferencesState.preferences,
          cartState.items
        );
        
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        analyticsService.trackEvent('chat:reply', { kind: 'general' });
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldHandleDiscovery = async (query: string) => {
    const filters = parseFiltersFromText(query);
    return Boolean(filters.text || filters.maxPrice || filters.color || filters.productType || (filters.tags && filters.tags.length > 0));
  };

  const handleDiscoveryQuery = async (query: string) => {
    try {
      const filters = parseFiltersFromText(query);
      const products = await catalogService.search(filters, 10);
      if (products.length === 0) {
        const response: ChatMessage = {
          role: 'assistant',
          content: "I couldn't find products matching that. Want me to broaden the search or adjust filters?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
        return;
      }

      let responseContent = 'Here are some options that match your request:\n\n';
      products.slice(0, 5).forEach((p, idx) => {
        responseContent += `${idx + 1}. **${p.title}** - ${formatCurrency(p.price)}\n`;
      });
      responseContent += '\nSay "add #1" or "show more like #2".';

      const response: ChatMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      analyticsService.trackEvent('chat:reply', { kind: 'discovery', count: Math.min(5, products.length) });
    } catch (error) {
      const response: ChatMessage = {
        role: 'assistant',
        content: 'I had trouble searching right now. Please try again shortly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const handleCartQuery = async () => {
    if (cartState.items.length === 0) {
      const response: ChatMessage = {
        role: 'assistant',
        content: "Your cart is currently empty. Would you like me to show you some product recommendations to get started?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      return;
    }

    try {
      const cartSummary = await geminiService.generateCartSummary(cartState.items);
      const response: ChatMessage = {
        role: 'assistant',
        content: cartSummary,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
      if (isCloseToThreshold(cartState.total)) {
        const delta = amountUntilFreeShipping(cartState.total);
        const nudge: ChatMessage = {
          role: 'assistant',
          content: `Add ${formatCurrency(delta)} more to unlock free shipping. Want suggestions to hit the threshold?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, nudge]);
      }
    } catch (error) {
      const response: ChatMessage = {
        role: 'assistant',
        content: `You have ${cartState.items.length} items in your cart with a total of ${formatCurrency(cartState.total)}.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const handleBudgetQuery = () => {
    const budget = preferencesState.preferences.budget;
    const response: ChatMessage = {
      role: 'assistant',
      content: `Your current budget range is ${formatCurrency(budget.min)} - ${formatCurrency(budget.max)}. I'll make sure to recommend products within this range. You can update your budget preferences anytime!`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, response]);
  };

  const handleRecommendationQuery = async (query: string) => {
    try {
      const products = await shopifyService.getProducts(20);
      const recommendations = await geminiService.getProductRecommendations(
        query,
        preferencesState.preferences,
        products
      );

      if (recommendations.length > 0) {
        let responseContent = "Here are some personalized recommendations for you:\n\n";
        
        recommendations.forEach((rec, index) => {
          const product = products.find(p => p.id === rec.id);
          if (product) {
            responseContent += `${index + 1}. **${product.title}** - ${formatCurrency(product.price)}\n`;
            responseContent += `   ${rec.reason}\n\n`;
          }
        });

        responseContent += "Would you like me to add any of these to your cart or show you more details?";
        
        const response: ChatMessage = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      } else {
        const response: ChatMessage = {
          role: 'assistant',
          content: "I couldn't find specific recommendations based on your query, but I'd be happy to help you browse our product catalog or refine your search criteria.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
      }
    } catch (error) {
      const response: ChatMessage = {
        role: 'assistant',
        content: "I'm having trouble getting recommendations right now, but you can browse our products directly or try asking me something else!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const handleOutfitQuery = async (query: string) => {
    try {
      const filters = parseFiltersFromText(query);
      const products = await catalogService.search(filters, 30);
      const budgetMatch = query.match(/₹\s?(\d{2,6})/);
      const budget = budgetMatch ? parseInt(budgetMatch[1], 10) : undefined;
      const outfits = suggestOutfits(products, budget);
      if (outfits.length === 0) {
        const response: ChatMessage = {
          role: 'assistant',
          content: 'I could not form a full look from current results. Try broadening the request or removing the budget cap.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, response]);
        return;
      }
      let content = 'Here are outfit ideas for you:\n\n';
      outfits.forEach((o, i) => {
        const [t, b, f] = o.items;
        content += `${i + 1}. ${o.label} — ${t.title}, ${b.title}, ${f.title} · Total: ${formatCurrency(o.totalPrice)}\n`;
      });
      content += '\nSay "add outfit #1" to proceed to cart.';
      const response: ChatMessage = { role: 'assistant', content, timestamp: new Date() };
      setMessages(prev => [...prev, response]);
      analyticsService.trackEvent('chat:reply', { kind: 'outfit' });
    } catch (_) {
      const response: ChatMessage = { role: 'assistant', content: 'Having trouble building outfits right now.', timestamp: new Date() };
      setMessages(prev => [...prev, response]);
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMicClick = () => {
    const speech = speechRef.current;
    if (!speech || !speech.isSupported) return;
    if (isListening) {
      speech.stop();
      setIsListening(false);
    } else {
      const ok = speech.start();
      if (ok) setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">AI Shopping Assistant</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Chat with our AI to get personalized product recommendations, style advice, cart management, and shopping assistance.
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {message.role === 'user' ? (
                        <UserIcon className="w-4 h-4" />
                      ) : (
                        <SparklesIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 pb-4 border-t border-gray-100"
            >
              <p className="text-sm text-gray-500 mb-3">Quick suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full transition-colors duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  !inputMessage.trim() || isLoading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </button>
              <button
                onClick={handleMicClick}
                disabled={isLoading || !(speechRef.current && speechRef.current.isSupported)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isListening ? 'Listening…' : 'Voice'}
              </button>
            </div>
          </div>
        </div>

        {/* Cart Summary */}
        {cartState.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <ShoppingCartIcon className="w-5 h-5 text-primary-600" />
                <span>Your Cart</span>
              </h3>
              <span className="text-sm text-gray-500">
                {cartState.itemCount} item{cartState.itemCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {cartState.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{item.name} × {item.quantity}</span>
                  <span className="text-gray-900 font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              {cartState.items.length > 3 && (
                <p className="text-sm text-gray-500">...and {cartState.items.length - 3} more items</p>
              )}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
              <span className="font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-primary-600">{formatCurrency(cartState.total)}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Chat;
