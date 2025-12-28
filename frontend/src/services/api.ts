import axios from 'axios';

// Базовий URL нашого бекенду
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://coffee-shop-project.onrender.com/api'
    : 'http://localhost:5000/api');

// Створимо екземпляр axios з налаштуваннями
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типи для даних
interface ReviewData {
  userId: string;
  userName: string;
  userEmail?: string;
  dishId: string;
  dishName: string;
  rating: number;
  comment: string;
}

interface BookingData {
  userId?: string;
  userName: string;
  userEmail?: string;
  userPhone: string;
  date: string;
  time: string;
  guests: number;
}

interface OrderData {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryTime?: string;
  deliveryNotes?: string;
  paymentMethod?: string;
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
}

// API для меню
export const menuApi = {
  // Отримати все меню
  getAll: (): Promise<{ data: MenuItem[] }> => 
    api.get('/menu'),
  
  // Отримати страви за категорією
  getByCategory: (category: string): Promise<{ data: MenuItem[] }> => 
    api.get(`/menu?category=${category}`),
};

// API для бронювань
export const bookingApi = {
  // Створити бронювання
  create: (bookingData: BookingData): Promise<{ data: any }> => 
    api.post('/bookings', bookingData),
  
  // Отримати всі бронювання
  getAll: (): Promise<{ data: any[] }> => 
    api.get('/bookings'),
};

// API для замовлень доставки
export const orderApi = {
  // Створити замовлення
  create: (orderData: OrderData): Promise<{ data: any }> => 
    api.post('/orders', orderData),
};

// API для відгуків
export const reviewApi = {
  // Отримати всі відгуків
  getAll: (): Promise<{ data: any[] }> => 
    api.get('/reviews/all'),
  
  // Створити відгук
  create: (reviewData: ReviewData): Promise<{ data: any }> => 
    api.post('/reviews', reviewData),
  
  // Отримати відгуки користувача
  getByUser: (userId: string): Promise<{ data: any[] }> => 
    api.get(`/reviews/user/${userId}`),
};

export default api;