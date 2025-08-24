# AI Virtual Shopping Assistant

A modern, AI-powered e-commerce website that provides personalized shopping experiences using Gemini AI and Shopify Storefront API. This application features intelligent product recommendations, conversational AI chat, and a seamless shopping experience.

## 🚀 Features

### AI-Powered Shopping
- **Intelligent Recommendations**: Get personalized product suggestions based on your style, budget, and preferences
- **AI Chat Assistant**: Conversational interface for shopping advice, style suggestions, and product discovery
- **Smart Cart Management**: AI-generated cart summaries and suggestions for completing your look

### E-commerce Functionality
- **Product Catalog**: Browse products with advanced filtering and search
- **Shopping Cart**: Full cart management with quantity controls and real-time updates
- **Product Details**: Comprehensive product pages with variants, images, and AI recommendations
- **Responsive Design**: Mobile-first design that works on all devices

### User Experience
- **Personalized Interface**: Remembers your preferences and shopping history
- **Modern UI/UX**: Beautiful, intuitive interface built with Tailwind CSS and Framer Motion
- **Fast Performance**: Optimized React application with efficient state management

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI Integration**: Google Gemini AI API
- **E-commerce**: Shopify Storefront API
- **State Management**: React Context API
- **Routing**: React Router v6
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before running this application, you'll need:

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Google Gemini AI API Key** ([Get it here](https://makersuite.google.com/app/apikey))
4. **Shopify Store** with Storefront API access

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-virtual-shopping-assistant
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit the `.env` file with your API keys:

```env
# Gemini AI API Key
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key

# Shopify Storefront API Configuration
REACT_APP_SHOPIFY_STOREFRONT_URL=https://your-store.myshopify.com/api/2024-01/graphql.json
REACT_APP_SHOPIFY_STOREFRONT_TOKEN=your_actual_storefront_token
```

### 4. Shopify Setup

1. **Create a Shopify App**:
   - Go to your Shopify admin
   - Navigate to Settings > Apps and sales channels
   - Click "Develop apps" > "Create an app"
   - Give your app a name

2. **Configure Storefront API**:
   - In your app settings, go to "Configuration"
   - Under "Admin API access scopes", add:
     - `read_products`
     - `read_product_listings`
     - `read_collections`
   - Under "Storefront API access scopes", add:
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_read_product_tags`

3. **Install the App**:
   - Click "Install app" in your Shopify admin
   - Copy the Storefront access token

### 5. Run the Application

```bash
npm start
# or
yarn start
```

The application will open at `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx     # Navigation header
│   └── Footer.tsx     # Site footer
├── contexts/           # React context providers
│   ├── CartContext.tsx        # Shopping cart state
│   └── UserPreferencesContext.tsx # User preferences
├── pages/              # Page components
│   ├── Home.tsx       # Landing page
│   ├── Products.tsx   # Product catalog
│   ├── ProductDetail.tsx # Individual product page
│   ├── Cart.tsx       # Shopping cart
│   └── Chat.tsx       # AI chat interface
├── services/           # API services
│   ├── geminiService.ts      # Gemini AI integration
│   └── shopifyService.ts     # Shopify API integration
├── App.tsx            # Main application component
└── index.tsx          # Application entry point
```

## 🔑 API Configuration

### Gemini AI API

The application uses Google's Gemini AI for:
- Product recommendations
- Shopping advice
- Cart summaries
- Conversational assistance

### Shopify Storefront API

Integrates with Shopify for:
- Product catalog management
- Inventory tracking
- Product variants and options
- Real-time product data

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` to customize colors, fonts, and animations
- Update CSS variables in `src/index.css` for global styles
- Customize component styles using Tailwind utility classes

### Content
- Update product data in `shopifyService.ts` mock data
- Modify homepage content in `src/pages/Home.tsx`
- Customize AI prompts in `src/services/geminiService.ts`

### Features
- Add new product categories and filters
- Implement user authentication
- Add payment processing
- Integrate with additional AI services

## 🚀 Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## 🔒 Security Considerations

- API keys are stored in environment variables
- No sensitive data is exposed in client-side code
- Shopify Storefront API provides secure product access
- Input validation and sanitization implemented

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your API keys are correct
3. Ensure your Shopify app has the correct permissions
4. Check that all dependencies are installed correctly

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Advanced AI-powered styling recommendations
- [ ] Integration with payment gateways
- [ ] Multi-language support
- [ ] Advanced analytics and insights
- [ ] Social sharing features
- [ ] Wishlist functionality
- [ ] Order tracking and management

## 🙏 Acknowledgments

- Google Gemini AI for intelligent recommendations
- Shopify for e-commerce infrastructure
- React and Tailwind CSS communities
- Unsplash for product images

---

**Built with ❤️ using modern web technologies**

