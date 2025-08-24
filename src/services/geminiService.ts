import { GoogleGenerativeAI } from '@google/generative-ai';
import { formatCurrency } from '../utils/currency';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY || '');

export interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  reason: string;
  confidence: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  async getProductRecommendations(
    userQuery: string,
    userPreferences: any,
    availableProducts: any[]
  ): Promise<ProductRecommendation[]> {
    try {
      const prompt = `
        You are an AI shopping assistant. Based on the user's query and preferences, recommend products from the available catalog.
        
        User Query: ${userQuery}
        User Preferences: ${JSON.stringify(userPreferences)}
        Available Products: ${JSON.stringify(availableProducts)}
        
        Please provide 3-5 product recommendations with the following format:
        - Product ID (must match exactly from available products)
        - Reason for recommendation
        - Confidence score (0-1)
        
        Focus on matching user preferences, budget, style, and occasion.
        Return only valid product IDs that exist in the available products list.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the response to extract recommendations
      // This is a simplified parser - in production you'd want more robust parsing
      const recommendations: ProductRecommendation[] = [];
      
      // Extract product IDs and create recommendations
      const productIds = this.extractProductIds(text, availableProducts);
      
      for (const productId of productIds) {
        const product = availableProducts.find(p => p.id === productId);
        if (product) {
          recommendations.push({
            id: product.id,
            name: (product as any).title ?? (product as any).name ?? 'Item',
            description: (product as any).description ?? '',
            price: (product as any).price ?? 0,
            category: (product as any).category ?? 'General',
            reason: `AI recommended based on your preferences`,
            confidence: 0.8,
          });
        }
      }

      return recommendations.slice(0, 5);
    } catch (error) {
      console.error('Error getting product recommendations:', error);
      return [];
    }
  }

  async chatWithAssistant(
    messages: ChatMessage[],
    userPreferences: any,
    cartItems: any[]
  ): Promise<string> {
    try {
      const conversationHistory = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `
        You are an AI shopping assistant for an e-commerce website. Help users with:
        - Product recommendations
        - Shopping advice
        - Style suggestions
        - Budget planning
        - Cart management
        
        User Preferences: ${JSON.stringify(userPreferences)}
        Current Cart: ${JSON.stringify(cartItems)}
        
        Conversation History:
        ${conversationHistory}
        
        Provide helpful, friendly, and personalized shopping advice. Keep responses concise but informative.
        If recommending products, mention specific categories or features rather than exact products.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error chatting with assistant:', error);
      return 'I apologize, but I\'m having trouble connecting right now. Please try again later.';
    }
  }

  async generateCartSummary(cartItems: any[]): Promise<string> {
    try {
      const prompt = `
        Generate a brief, friendly summary of the user's shopping cart.
        
        Cart Items: ${JSON.stringify(cartItems)}
        
        Include:
        - Total number of items
        - Total price
        - Brief description of what they're buying
        - Any suggestions for completing their look
        
        Keep it conversational and under 100 words.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating cart summary:', error);
      return `You have ${cartItems.length} items in your cart with a total of ${formatCurrency(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}.`;
    }
  }

  private extractProductIds(text: string, availableProducts: any[]): string[] {
    // Simple extraction - in production you'd want more sophisticated parsing
    const productIds: string[] = [];
    const availableIds = availableProducts.map(p => p.id);
    
    for (const id of availableIds) {
      if (text.includes(id)) {
        productIds.push(id);
      }
    }
    
    return productIds;
  }
}

export const geminiService = new GeminiService();
