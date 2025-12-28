import axios from 'axios';

// Динамічний URL для різних середовищ
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://coffee-shop-project.onrender.com/api'  // Render URL
  : 'http://localhost:5000/api';  // Локальний URL

const BOOKINGS_URL = `${API_BASE_URL}/bookings`;

export interface Booking {
  _id?: string;
  id: string;  // ЗМІНА: з _id на id (Supabase використовує id)
  user_name: string;  // ЗМІНА: з userName на user_name
  user_phone: string; // ЗМІНА: з userPhone на user_phone
  user_email?: string;
  date: string;
  time: string;
  guests: number;
  status: string;
  created_at?: string; // ЗМІНА: з createdAt на created_at
}

export interface CreateBookingData {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  email?: string;
  userId?: string; // Додайте це поле
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export const bookingApi = {
  create: async (bookingData: CreateBookingData): Promise<ApiResponse<Booking>> => {
    try {
      console.log('📝 Відправка бронювання:', bookingData);
      console.log('📍 URL:', BOOKINGS_URL);
      
      const response = await axios.post(BOOKINGS_URL, bookingData);
      console.log('✅ Відповідь від сервера:', response.data);
      
      // Повертаємо всю відповідь
      return response.data;
    } catch (error: any) {
      console.error('❌ Помилка при бронюванні:', error.message);
      console.error('❌ URL:', BOOKINGS_URL);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка з\'єднання з сервером'
      };
    }
  },

  getUserBookings: async (email: string): Promise<ApiResponse<Booking[]>> => {
    try {
      console.log('👤 Запит бронювань для:', email);
      console.log('📍 URL:', `${BOOKINGS_URL}/user/${encodeURIComponent(email)}`);
      
      const response = await axios.get(`${BOOKINGS_URL}/user/${encodeURIComponent(email)}`);
      console.log('✅ Відповідь:', response.data);
      
      // Додаткова обробка відповіді
      const responseData = response.data;
      
      // Якщо відповідь має структуру { success: true, data: [...] }
      if (responseData.success && Array.isArray(responseData.data)) {
        return responseData;
      }
      
      // Якщо відповідь - просто масив
      if (Array.isArray(responseData)) {
        return {
          success: true,
          data: responseData
        };
      }
      
      // Якщо щось інше
      return {
        success: false,
        error: 'Невірний формат відповіді сервера',
        data: []
      };
      
    } catch (error: any) {
      console.error('❌ Помилка при отриманні бронювань:', error.message);
      console.error('❌ URL помилки:', `${BOOKINGS_URL}/user/${encodeURIComponent(email)}`);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Сервер недоступний',
        data: []
      };
    }
  },

  cancelBooking: async (bookingId: string): Promise<ApiResponse> => {
    try {
      console.log('❌ Скасування бронювання:', bookingId);
      
      const response = await axios.put(`${BOOKINGS_URL}/${bookingId}/cancel`);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Помилка при скасуванні:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Помилка з\'єднання'
      };
    }
  }
};