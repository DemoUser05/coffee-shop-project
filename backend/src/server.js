const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Базовий маршрут
app.get('/', (req, res) => {
  res.json({ message: 'Coffee Shop API is running!' });
});

// Маршрут для меню
app.get('/api/menu', (req, res) => {
  const menu = [
    { id: 1, name: 'Еспресо', price: 35, category: 'кава', description: 'Класична італійська кава' },
    { id: 2, name: 'Американо', price: 40, category: 'кава', description: 'Еспресо з додаванням гарячої води' },
    { id: 3, name: 'Капучино', price: 45, category: 'кава', description: 'Еспресо з молочною піною' },
    { id: 4, name: 'Лате', price: 50, category: 'кава', description: 'Еспресо з великою кількістю молока' },
    { id: 5, name: 'Чізкейк', price: 65, category: 'десерти', description: 'Нью-Йоркський чізкейк' },
    { id: 6, name: 'Тірамісу', price: 70, category: 'десерти', description: 'Італійський десерт з кави' },
  ];
  res.json(menu);
});

// Маршрут для бронювань (POST)
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  console.log('Нове бронювання:', booking);
  
  // Симулюємо збереження в базу даних
  const newBooking = {
    id: Date.now(),
    ...booking,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  res.json({ 
    success: true, 
    message: 'Бронювання успішно створено!', 
    booking: newBooking 
  });
});

// Маршрут для замовлень доставки (POST)
app.post('/api/orders', (req, res) => {
  const order = req.body;
  console.log('Нове замовлення:', order);
  
  // Симулюємо збереження в базу даних
  const newOrder = {
    id: Date.now(),
    ...order,
    status: 'processing',
    estimatedDelivery: '45 хвилин',
    createdAt: new Date().toISOString()
  };
  
  res.json({ 
    success: true, 
    message: 'Замовлення прийнято!', 
    order: newOrder 
  });
});

// Маршрут для відгуків
app.get('/api/reviews', (req, res) => {
  const reviews = [
    { id: 1, name: 'Анна', rating: 5, comment: 'Найкраща кава в місті!', date: '2024-01-15' },
    { id: 2, name: 'Олег', rating: 4, comment: 'Гарна атмосфера, смачні десерти', date: '2024-01-10' },
    { id: 3, name: 'Марія', rating: 5, comment: 'Обожнюю їхній лате!', date: '2024-01-05' },
    { id: 4, name: 'Іван', rating: 3, comment: 'Все добре, але довге очікування', date: '2024-01-01' },
  ];
  res.json(reviews);
});

app.post('/api/reviews', (req, res) => {
  const review = req.body;
  console.log('Новий відгук:', review);
  
  const newReview = {
    id: Date.now(),
    ...review,
    date: new Date().toISOString().split('T')[0]
  };
  
  res.json({ 
    success: true, 
    message: 'Відгук додано!', 
    review: newReview 
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
});