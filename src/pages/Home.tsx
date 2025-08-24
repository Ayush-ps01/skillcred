import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  ShoppingBagIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Recommendations',
      description: 'Get personalized product suggestions based on your style, budget, and preferences using advanced AI technology.'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Conversational Shopping',
      description: 'Chat with our AI assistant to find the perfect products, get style advice, and plan your shopping.'
    },
    {
      icon: HeartIcon,
      title: 'Personalized Experience',
      description: 'Your shopping preferences are remembered and used to create a tailored shopping experience just for you.'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Smart Search',
      description: 'Find products quickly with intelligent search that understands your needs and suggests relevant items.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Fashion Enthusiast',
      content: 'The AI recommendations are spot-on! I found exactly what I was looking for in minutes.',
      rating: 5
    },
    {
      name: 'Mike Chen',
      role: 'Tech Professional',
      content: 'This is the future of shopping. The AI chat helped me discover products I never knew I needed.',
      rating: 5
    },
    {
      name: 'Emma Davis',
      role: 'Style Blogger',
      content: 'Incredible personalization! The AI understands my style better than I do sometimes.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Your Personal{' '}
                <span className="text-gradient">AI Shopping</span>{' '}
                Assistant
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Discover products tailored to your style, budget, and preferences with our intelligent AI-powered shopping companion. 
                Get personalized recommendations, style advice, and a seamless shopping experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                >
                  <ShoppingBagIcon className="w-6 h-6" />
                  <span>Start Shopping</span>
                </Link>
                <Link
                  to="/chat"
                  className="btn-secondary text-lg px-8 py-4 flex items-center justify-center space-x-2"
                >
                  <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  <span>Chat with AI</span>
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-700">Hi! I'm your AI shopping assistant. What are you looking for today?</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 justify-end">
                      <div className="bg-primary-600 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-white">I need a casual outfit for the weekend</p>
                      </div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">U</span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <ChatBubbleLeftRightIcon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                        <p className="text-sm text-gray-700">Great! I found some perfect options for you...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-secondary-100 rounded-full opacity-60"
              />
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-100 rounded-full opacity-60"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI Shopping Assistant?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of shopping with intelligent AI technology that understands your needs and preferences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied shoppers who've discovered the power of AI-assisted shopping.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience AI-Powered Shopping?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Start your personalized shopping journey today and discover products that match your unique style and preferences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span>Browse Products</span>
              </Link>
              <Link
                to="/chat"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
                <span>Start Chatting</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
