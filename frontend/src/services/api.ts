import axios from 'axios';

// Базовий URL нашого бекенду
const API_BASE_URL = 'http://localhost:5000/api';

// Створимо екземпляр axios з налаштуваннями
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API для меню
export const menuApi = {
  // Отримати все меню
  getAll: () => api.get('/menu'),
  
  // Отримати страви за категорією
  getByCategory: (category: string) => 
    api.get(`/menu?category=${category}`),
};

// API для бронювань
export const bookingApi = {
  // Створити бронювання
  create: (bookingData: any) => 
    api.post('/bookings', bookingData),
  
  // Отримати всі бронювання (потім додамо автентифікацію)
  getAll: () => api.get('/bookings'),
};

// API для замовлень доставки
export const orderApi = {
  // Створити замовлення
  create: (orderData: any) => 
    api.post('/orders', orderData),
};

// API для відгуків
export const reviewApi = {
  // Отримати всі відгуки
  getAll: () => api.get('/reviews'),
  
  // Створити відгук
  create: (reviewData: any) => 
    api.post('/reviews', reviewData),
};

export default api;