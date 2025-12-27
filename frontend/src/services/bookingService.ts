import axios from 'axios';

const API_URL = 'http://localhost:5000/api/bookings';

export interface Booking {
  _id?: string;
  userName: string;
  userPhone: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  createdAt?: string;
  userEmail?: string;
}

export interface CreateBookingData {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  email?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const bookingApi = {
  create: async (bookingData: CreateBookingData): Promise<ApiResponse<Booking>> => {
    try {
      console.log('📝 Відправка бронювання:', bookingData);
      
      const response = await axios.post(API_URL, bookingData);
      
      console.log('✅ Відповідь від сервера:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при бронюванні:', error);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: 'Помилка з\'єднання з сервером'
      };
    }
  },

  getUserBookings: async (email: string): Promise<ApiResponse<Booking[]>> => {
    try {
      console.log('👤 Запит бронювань для:', email);
      
      const response = await axios.get(`${API_URL}/user/${encodeURIComponent(email)}`);
      
      console.log('✅ Отримано бронювань:', response.data.data?.length || 0);
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при отриманні бронювань користувача:', error.message);
      
      if (error.response?.data) {
        return error.response.data;
      }
      
      return {
        success: false,
        error: 'Сервер недоступний. Спробуйте пізніше.',
        data: []
      };
    }
  },

  cancelBooking: async (bookingId: string): Promise<ApiResponse> => {
    try {
      console.log('❌ Спроба скасування бронювання:', bookingId);
      
      const response = await axios.put(`${API_URL}/${bookingId}/cancel`);
      
      console.log('✅ Бронювання скасовано:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при скасуванні бронювання:', error);
      
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