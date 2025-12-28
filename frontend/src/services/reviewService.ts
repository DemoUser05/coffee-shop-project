// frontend/src/services/reviewService.ts
import axios from 'axios';
import { AppUser } from '../store/slices/authSlice';
import { getAuth } from 'firebase/auth';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://coffee-shop-project.onrender.com/api'  // Render URL
  : 'http://localhost:5000/api';  // Локальний URL

const API_URL = `${API_BASE_URL}/reviews`;

// Типи
export interface Review {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  dishId: string;
  dishName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CreateReviewData {
  dishId: string;
  dishName: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data?: T;
  error?: string;
  message?: string;
}

// Отримати токен з Firebase
const getAuthToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.warn('⚠️ [reviewService] Firebase: Користувач не авторизований');
      return null;
    }
    
    const token = await user.getIdToken(true);
    console.log('✅ [reviewService] Firebase токен отримано');
    return token;
  } catch (error) {
    console.error('❌ [reviewService] Помилка отримання Firebase токена:', error);
    return null;
  }
};

// Створити заголовки з авторизацією
// Створити заголовки з авторизацією
const getAuthHeaders = async (currentUserId?: string): Promise<Record<string, string>> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Додаємо інформацію про користувача для бекенду
    if (currentUserId) {
      headers['X-User-ID'] = currentUserId;
    }
    
    if (user?.email) {
      headers['X-User-Email'] = user.email;
    }
    
    // 🔴 ВИПРАВЛЕНО: Не додаємо кирилицю в заголовки
    // if (user?.displayName) {
    //   headers['X-User-Name'] = user.displayName; // Може містити кирилицю
    // }
    
    // Замість цього додаємо латинське ім'я
    if (user?.displayName) {
      // Конвертуємо кирилицю в латиницю або використовуємо дефолтне
      const latinName = user.displayName
        .replace(/[^a-zA-Z0-9]/g, '') // Видаляємо не-латинські символи
        || 'User';
      
      if (latinName) {
        headers['X-User-Name'] = latinName;
      }
    }
    
    // Спробуємо отримати токен
    try {
      if (user) {
        const token = await user.getIdToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          // Для розробки
          headers['Authorization'] = 'Bearer dev-token-for-testing';
        }
      } else {
        headers['Authorization'] = 'Bearer dev-token-for-testing';
      }
    } catch (tokenError) {
      headers['Authorization'] = 'Bearer dev-token-for-testing';
    }
    
    // 🔴 ДОДАЄМО: Простий лог без кирилиці
    console.log('🔑 [reviewService] Заголовки:', {
      'X-User-ID': headers['X-User-ID'] ? 'Присутній' : 'Відсутній',
      'Authorization': headers['Authorization'] ? 'Присутній' : 'Відсутній'
    });
    
    return headers;
  } catch (error) {
    console.error('❌ [reviewService] Помилка створення заголовків:', error);
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer fallback-token'
    };
  }
};

// API функції
export const reviewApi = {
  // Отримати ВСІ відгуки (головна сторінка)
  getAllReviews: async (): Promise<ApiResponse<Review[]>> => {
    try {
      console.log('📥 [reviewService] Запит ВСІХ відгуків');
      const response = await axios.get<ApiResponse<Review[]>>(
        `${API_URL}/all`
      );
      
      if (!response.data.success) {
        console.error('❌ [reviewService] Помилка від сервера:', response.data.error);
        throw new Error(response.data.error || 'Помилка сервера');
      }
      
      console.log(`✅ [reviewService] Отримано ${response.data.data?.length || 0} відгуків`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [reviewService] Помилка при отриманні всіх відгуків:', error.message);
      return {
        success: false,
        count: 0,
        data: [],
        error: error.response?.data?.error || error.message || 'Помилка сервера'
      };
    }
  },

  // Отримати відгуки для конкретної страви
  getDishReviews: async (dishId: string): Promise<ApiResponse<Review[]>> => {
    try {
      console.log(`📥 [reviewService] Запит відгуків для страви: ${dishId}`);
      const response = await axios.get<ApiResponse<Review[]>>(
        `${API_URL}/dish/${dishId}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Помилка сервера');
      }
      
      console.log(`✅ [reviewService] Отримано ${response.data.data?.length || 0} відгуків для страви ${dishId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [reviewService] Помилка при отриманні відгуків для страви:', error.message);
      return {
        success: false,
        count: 0,
        data: [],
        error: error.response?.data?.error || error.message || 'Помилка сервера'
      };
    }
  },

  // Отримати відгуки користувача (Мої відгуки)
  getUserReviews: async (userId: string): Promise<ApiResponse<Review[]>> => {
    try {
      console.log(`📥 [reviewService] Запит відгуків користувача: ${userId}`);
      
      // 🔴 ВАЖЛИВО: передаємо userId до заголовків
      const headers = await getAuthHeaders(userId);
      
      console.log('🔑 [reviewService] Заголовки запиту:', {
        'X-User-ID': headers['X-User-ID'],
        'Authorization': headers['Authorization'] ? 'Присутній' : 'Відсутній'
      });
      
      const response = await axios.get<ApiResponse<Review[]>>(
        `${API_URL}/user/${userId}`,
        { headers }
      );
      
      if (!response.data.success) {
        console.error('❌ [reviewService] Помилка від сервера:', response.data.error);
        throw new Error(response.data.error || 'Помилка сервера');
      }
      
      console.log(`✅ [reviewService] Отримано ${response.data.data?.length || 0} відгуків користувача`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [reviewService] Помилка при отриманні відгуків користувача:');
      console.error('   Код статусу:', error.response?.status);
      console.error('   Дані помилки:', error.response?.data);
      console.error('   Повідомлення:', error.message);
      
      return {
        success: false,
        count: 0,
        data: [],
        error: error.response?.data?.error || error.message || 'Помилка сервера'
      };
    }
  },

  // Створити новий відгук
  createReview: async (reviewData: CreateReviewData, user: AppUser): Promise<ApiResponse<Review>> => {
    try {
      console.log('📝 [reviewService] Створення нового відгуку');
      
      const headers = await getAuthHeaders(user.uid);
      
      const data = {
        ...reviewData,
        userId: user.uid,
        userName: user.displayName || 'Анонімний користувач',
        userEmail: user.email || '',
      };
      
      console.log('📦 [reviewService] Дані для відправки:', data);
      
      const response = await axios.post<ApiResponse<Review>>(
        `${API_URL}`,
        data,
        { headers }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Помилка сервера');
      }
      
      console.log('✅ [reviewService] Відгук успішно створено');
      return response.data;
    } catch (error: any) {
      console.error('❌ [reviewService] Помилка при створенні відгуку:');
      console.error('   Дані помилки:', error.response?.data);
      console.error('   Повідомлення:', error.message);
      
      return {
        success: false,
        data: {} as Review,
        error: error.response?.data?.error || error.message || 'Помилка при створенні відгуку'
      };
    }
  },

  // Оновити відгук
  updateReview: async (reviewId: string, reviewData: UpdateReviewData): Promise<ApiResponse<Review>> => {
    try {
      console.log(`🔄 [reviewService] Оновлення відгуку: ${reviewId}`);
      const headers = await getAuthHeaders();
      
      const response = await axios.put<ApiResponse<Review>>(
        `${API_URL}/${reviewId}`,
        reviewData,
        { headers }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Помилка сервера');
      }
      
      console.log('✅ [reviewService] Відгук успішно оновлено');
      return response.data;
    } catch (error: any) {
      console.error('❌ [reviewService] Помилка при оновленні відгуку:', error.message);
      return {
        success: false,
        data: {} as Review,
        error: error.response?.data?.error || error.message || 'Помилка сервера'
      };
    }
  },

  // Видалити відгук
  deleteReview: async (reviewId: string): Promise<ApiResponse<void>> => {
    try {
      console.log(`🗑️ [reviewService] Видалення відгуку: ${reviewId}`);
      const headers = await getAuthHeaders();
      
      const response = await axios.delete<ApiResponse<void>>(
        `${API_URL}/${reviewId}`,
        { headers }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Помилка сервера');
      }
      
      console.log('✅ [reviewService] Відгук успішно видалено');
      return response.data;
    } catch (error: any) {
      console.error('❌ [reviewService] Помилка при видаленні відгуку:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Помилка сервера'
      };
    }
  },
};