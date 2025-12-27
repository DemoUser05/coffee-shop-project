const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const reviewRoutes = require('./src/routes/reviewRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Логування всіх запитів
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ПІДКЛЮЧЕННЯ ДО SUPABASE (замість MongoDB)
// ============================================
console.log('🔍 Налаштування підключення до Supabase...');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase підключено успішно!');
    
    // Додаємо supabase до app, щоб мати доступ в контролерах
    app.set('supabase', supabase);
    
    // Імпортуємо конфігурацію для контролерів
    require('./src/config/supabaseClient');
    
  } catch (error) {
    console.error('❌ Помилка при підключенні до Supabase:', error.message);
    console.log('⚠️  Використовуються тестові дані (без підключення до БД)');
  }
} else {
  console.error('❌ Змінні SUPABASE_URL або SUPABASE_ANON_KEY не знайдені в .env');
  console.log('⚠️  Використовуються тестові дані (без підключення до БД)');
}

// ============================================
// НАЛАШТУВАННЯ ТА ПІДКЛЮЧЕННЯ МАРШРУТІВ
// ============================================

// Додаємо тестовий маршрут
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Test route works!', 
    supabase: !!supabase,
    timestamp: new Date().toISOString()
  });
});

// Маршрут для перевірки здоров'я сервера
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    server: 'online',
    database: supabase ? 'connected' : 'not_configured',
    supabase_url: supabaseUrl ? 'configured' : 'not_configured',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Маршрут для автоматичного створення таблиць в Supabase
app.get('/api/setup-database', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({
      success: false,
      message: 'Supabase не налаштовано'
    });
  }
  
  try {
    // Спроба створити таблиці через SQL запит
    console.log('🔧 Спроба створення таблиць в Supabase...');
    
    // Простий запит для перевірки
    const { data, error } = await supabase
      .from('reviews')
      .select('count', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      // Таблиця не існує
      console.log('⚠️  Таблиці не існують. Створіть їх вручну через Supabase UI.');
      return res.json({
        success: false,
        message: 'Створіть таблиці вручну в Supabase: Table Editor → New Table',
        tables_needed: ['reviews', 'bookings', 'orders']
      });
    }
    
    console.log('✅ Таблиці вже існують або доступні');
    res.json({
      success: true,
      message: 'База даних готова до використання'
    });
  } catch (error) {
    console.error('❌ Помилка при перевірці бази даних:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Маршрут для меню (завжди доступний)
app.get('/api/menu', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'coffee_latte', name: 'Лате', price: 85, category: 'coffee', image: '/images/latte.jpg' },
      { id: 'coffee_cappuccino', name: 'Капучино', price: 80, category: 'coffee', image: '/images/cappuccino.jpg' },
      { id: 'coffee_espresso', name: 'Еспресо', price: 60, category: 'coffee', image: '/images/espresso.jpg' },
      { id: 'bakery_croissant', name: 'Круасан', price: 45, category: 'bakery', image: '/images/croissant.jpg' },
      { id: 'bakery_bagel', name: 'Бейгл', price: 40, category: 'bakery', image: '/images/bagel.jpg' },
      { id: 'dessert_cake', name: 'Шоколадний торт', price: 65, category: 'desserts', image: '/images/cake.jpg' },
      { id: 'dessert_tiramisu', name: 'Тірамісу', price: 70, category: 'desserts', image: '/images/tiramisu.jpg' }
    ]
  });
});

// ============================================
// ПІДКЛЮЧЕННЯ ОСНОВНИХ МАРШРУТІВ
// ============================================
console.log('🔧 Підключаємо основні маршрути...');

app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes);

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
app.listen(PORT, () => {
  console.log(`
🚀 СЕРВЕР ЗАПУЩЕНО НА ПОРТІ ${PORT}
📍 Локальний URL: http://localhost:${PORT}
📊 Supabase статус: ${supabase ? '✅ Підключено' : '❌ Не налаштовано'}

📋 ДОСТУПНІ МАРШРУТИ:
   GET    /api/health              - Перевірка здоров'я
   GET    /api/test               - Тестовий маршрут
   GET    /api/setup-database     - Налаштування БД
   GET    /api/menu               - Меню
   
   GET    /api/reviews/all        - Всі відгуки
   POST   /api/reviews            - Створити відгук
   GET    /api/reviews/user/:id   - Відгуки користувача
   
   POST   /api/bookings           - Створити бронювання
   POST   /api/orders             - Створити замовлення

⚠️  Якщо Supabase не налаштовано, деякі функції можуть не працювати!
🔧 Для налаштування Supabase додайте змінні в .env файл:
   SUPABASE_URL=https://ваш-id.supabase.co
   SUPABASE_ANON_KEY=ваш-anon-key
  `);
});