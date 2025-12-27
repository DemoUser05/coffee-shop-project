import axios from 'axios';

const API_URL = 'http://localhost:5000/api/orders';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerId?: string;
  deliveryAddress: string;
  deliveryTime?: string;
  deliveryNotes?: string;
  paymentMethod: 'cash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryTime?: string;
  deliveryNotes?: string;
  paymentMethod: 'cash' | 'card';
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  customerId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const orderApi = {
  create: async (orderData: CreateOrderData): Promise<ApiResponse<Order>> => {
    try {
      console.log('📦 Відправка замовлення:', orderData);
      
      const response = await axios.post(API_URL, orderData);
      
      console.log('✅ Відповідь від сервера:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при створенні замовлення:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: 'Помилка з\'єднання з сервером'
      };
    }
  },

  getUserOrders: async (userId?: string, email?: string): Promise<ApiResponse<Order[]>> => {
    try {
      console.log('👤 Запит замовлень для:', { userId, email });
      
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (email) params.append('email', email);
      
      const response = await axios.get(`${API_URL}/user?${params}`);
      
      console.log('✅ Отримано замовлень:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при отриманні замовлень:', error.message);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: 'Помилка з\'єднання з сервером',
        data: []
      };
    }
  },

  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await axios.get(`${API_URL}/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при отриманні замовлення:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: 'Помилка з\'єднання з сервером'
      };
    }
  }
};