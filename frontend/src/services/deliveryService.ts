import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://coffee-shop-project.onrender.com/api'  // Render URL
  : 'http://localhost:5000/api';  // Локальний URL

const API_URL = `${API_BASE_URL}/delivery`;

export interface DeliveryOrder {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  orderDetails: string;
  deliveryTime?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  totalAmount?: number;
  deliveryFee: number;
  userId?: string;
  userEmail?: string;
  createdAt?: string;
}

export interface CreateDeliveryData {
  name: string;
  phone: string;
  address: string;
  orderDetails: string;
  deliveryTime?: string;
  notes?: string;
  userId?: string;
  userEmail?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const deliveryApi = {
  create: async (deliveryData: CreateDeliveryData): Promise<ApiResponse<DeliveryOrder>> => {
    try {
      console.log('📦 Відправка замовлення доставки:', deliveryData);
      
      const response = await axios.post(API_URL, deliveryData);
      
      console.log('✅ Відповідь від сервера:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при замовленні доставки:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: 'Помилка з\'єднання з сервером'
      };
    }
  },

  getUserDeliveries: async (email: string): Promise<ApiResponse<DeliveryOrder[]>> => {
    try {
      const response = await axios.get(`${API_URL}/user/${encodeURIComponent(email)}`);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при отриманні замовлень доставки:', error.message);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: 'Сервер недоступний',
        data: []
      };
    }
  }
};