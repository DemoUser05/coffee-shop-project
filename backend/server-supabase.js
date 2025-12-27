const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Логування запитів
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================
// ПІДКЛЮЧЕННЯ ДО SUPABASE
// ============================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ПОМИЛКА: SUPABASE_URL або SUPABASE_ANON_KEY не знайдено в .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : supabase;

console.log('✅ Supabase підключено!');
console.log(`🔗 URL: ${supabaseUrl}`);

// ============================================
// ТИМЧАСОВІ ДАНІ (якщо Supabase не працює)
// ============================================
const fallbackData = {
  reviews: [
    {
      id: "fallback_001",
      user_id: "muaW1I3RkHNNZik7VaBtq12Rdci2",
      user_name: "Діана Марта",
      user_email: "diana@example.com",
      dish_id: "general",
      dish_name: "Кав'ярня Coffee Cow",
      rating: 5,
      comment: "Чудове місце для роботи та відпочинку!",
      created_at: new Date().toISOString()
    }
  ],
  bookings: [
    {
      id: "book_001",
      user_name: "Тестовий Користувач",
      user_phone: "+380123456789",
      date: new Date().toISOString(),
      time: "14:00",
      guests: 2,
      status: "pending"
    }
  ],
  orders: [
    {
      id: "order_001",
      order_number: "ORD001",
      customer_name: "Тестовий Клієнт",
      total_amount: 150,
      status: "pending"
    }
  ]
};

// ============================================
// ДОПОМІЖНІ ФУНКЦІЇ
// ============================================
const handleSupabaseError = (error, fallbackData, res) => {
  console.error('❌ Supabase помилка:', error.message);
  console.log('🔄 Використовую тестові дані');
  
  return res.json({
    success: true,
    data: fallbackData,
    message: "Тестові дані (Supabase помилка)"
  });
};

// ============================================
// МАРШРУТИ ДЛЯ ВІДГУКІВ
// ============================================

// 1. Отримати всі відгуки
app.get('/api/reviews/all', async (req, res) => {
  try {
    console.log('📥 Запит всіх відгуків...');
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) return handleSupabaseError(error, fallbackData.reviews, res);
    
    console.log(`✅ Знайдено ${data?.length || 0} відгуків`);
    
    res.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Помилка:', error);
    res.json({
      success: true,
      count: fallbackData.reviews.length,
      data: fallbackData.reviews
    });
  }
});

// 2. Створити відгук
app.post('/api/reviews', async (req, res) => {
  try {
    console.log('📝 Створення відгуку:', req.body);
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: req.body.userId,
        user_name: req.body.userName || 'Анонімний користувач',
        user_email: req.body.userEmail || 'user@example.com',
        dish_id: req.body.dishId,
        dish_name: req.body.dishName,
        rating: parseInt(req.body.rating) || 5,
        comment: req.body.comment || 'Без коментаря'
      }])
      .select();
    
    if (error) {
      console.error('❌ Помилка при створенні:', error);
      
      // Створюємо тестовий відгук
      const mockReview = {
        id: 'mock_' + Date.now(),
        ...req.body,
        created_at: new Date().toISOString()
      };
      
      fallbackData.reviews.unshift(mockReview);
      
      return res.json({
        success: true,
        data: mockReview,
        message: 'Відгук додано (тестові дані)'
      });
    }
    
    res.json({
      success: true,
      data: data[0],
      message: 'Відгук успішно додано!'
    });
  } catch (error) {
    console.error('❌ Помилка:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при створенні відгуку'
    });
  }
});

// 3. Отримати відгуки користувача
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`👤 Запит відгуків користувача: ${userId}`);
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) return handleSupabaseError(error, fallbackData.reviews, res);
    
    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Помилка:', error);
    res.json({
      success: true,
      data: fallbackData.reviews
    });
  }
});

// ============================================
// МАРШРУТИ ДЛЯ БРОНЮВАНЬ
// ============================================

// 1. Створити бронювання
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('📅 Створення бронювання:', req.body);
    
    const bookingData = {
      user_id: req.body.userId || null,
      user_name: req.body.userName,
      user_email: req.body.userEmail || null,
      user_phone: req.body.userPhone,
      date: req.body.date,
      time: req.body.time,
      guests: parseInt(req.body.guests) || 1,
      status: 'pending'
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();
    
    if (error) {
      console.error('❌ Помилка бронювання:', error);
      
      // Тестове бронювання
      const mockBooking = {
        id: 'book_' + Date.now(),
        ...bookingData,
        created_at: new Date().toISOString()
      };
      
      fallbackData.bookings.unshift(mockBooking);
      
      return res.json({
        success: true,
        data: mockBooking,
        message: 'Бронювання створено (тестові дані)'
      });
    }
    
    res.json({
      success: true,
      data: data[0],
      message: 'Столик успішно заброньовано!'
    });
  } catch (error) {
    console.error('❌ Помилка:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при бронюванні'
    });
  }
});

// ============================================
// МАРШРУТИ ДЛЯ ЗАМОВЛЕНЬ
// ============================================

// 1. Створити замовлення
app.post('/api/orders', async (req, res) => {
  try {
    console.log('🛒 Створення замовлення:', req.body);
    
    // Генерація номера замовлення
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
    
    const orderData = {
      order_number: orderNumber,
      customer_id: req.body.customerId || null,
      customer_name: req.body.customerName,
      customer_phone: req.body.customerPhone,
      customer_email: req.body.customerEmail || null,
      delivery_address: req.body.deliveryAddress,
      delivery_time: req.body.deliveryTime || null,
      delivery_notes: req.body.deliveryNotes || '',
      payment_method: req.body.paymentMethod || 'cash',
      payment_status: 'pending',
      status: 'pending',
      total_amount: parseFloat(req.body.totalAmount) || 0,
      delivery_fee: parseFloat(req.body.deliveryFee) || 0,
      final_amount: parseFloat(req.body.finalAmount) || 0,
      items: req.body.items || []
    };
    
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();
    
    if (error) {
      console.error('❌ Помилка замовлення:', error);
      
      // Тестове замовлення
      const mockOrder = {
        id: 'order_' + Date.now(),
        ...orderData,
        created_at: new Date().toISOString()
      };
      
      fallbackData.orders.unshift(mockOrder);
      
      return res.json({
        success: true,
        data: mockOrder,
        message: 'Замовлення створено (тестові дані)'
      });
    }
    
    res.json({
      success: true,
      data: data[0],
      message: 'Замовлення успішно створено!'
    });
  } catch (error) {
    console.error('❌ Помилка:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при створенні замовлення'
    });
  }
});

// ============================================
// МАРШРУТИ ДЛЯ МЕНЮ
// ============================================

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
// ДОПОМІЖНІ МАРШРУТИ
// ============================================

// Перевірка здоров'я
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('reviews').select('count', { count: 'exact', head: true });
    
    res.json({
      status: 'running',
      supabase: error ? 'connection_error' : 'connected',
      error: error?.message,
      tables: ['reviews', 'bookings', 'orders'],
      fallback_mode: error ? 'active' : 'inactive',
      port: PORT,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({
      status: 'running',
      supabase: 'error',
      error: err.message,
      fallback_mode: 'active',
      port: PORT
    });
  }
});

// Налаштування бази даних (створити таблиці)
app.get('/api/setup-database', async (req, res) => {
  try {
    console.log('🔧 Налаштування бази даних...');
    
    // Використовуємо Service Role для створення таблиць
    const { error } = await supabaseService.rpc('exec_sql', {
      sql: `
        -- Створення таблиці reviews
        CREATE TABLE IF NOT EXISTS reviews (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_name TEXT NOT NULL,
          user_email TEXT NOT NULL,
          dish_id TEXT NOT NULL,
          dish_name TEXT NOT NULL,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          comment TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Створення таблиці bookings
        CREATE TABLE IF NOT EXISTS bookings (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT,
          user_name TEXT NOT NULL,
          user_email TEXT,
          user_phone TEXT NOT NULL,
          date DATE NOT NULL,
          time TEXT NOT NULL,
          guests INTEGER NOT NULL CHECK (guests >= 1 AND guests <= 20),
          status TEXT DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Створення таблиці orders
        CREATE TABLE IF NOT EXISTS orders (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_number TEXT UNIQUE NOT NULL,
          customer_id TEXT,
          customer_name TEXT NOT NULL,
          customer_phone TEXT NOT NULL,
          customer_email TEXT,
          delivery_address TEXT NOT NULL,
          delivery_time TEXT,
          delivery_notes TEXT,
          payment_method TEXT DEFAULT 'cash',
          payment_status TEXT DEFAULT 'pending',
          status TEXT DEFAULT 'pending',
          total_amount DECIMAL(10, 2) NOT NULL,
          delivery_fee DECIMAL(10, 2) NOT NULL,
          final_amount DECIMAL(10, 2) NOT NULL,
          items JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Додавання тестових даних
        INSERT INTO reviews (user_id, user_name, user_email, dish_id, dish_name, rating, comment) VALUES
          ('user_001', 'Анна Коваленко', 'anna@example.com', 'general', 'Кав''ярня', 5, 'Чудова атмосфера!'),
          ('user_002', 'Олег Петренко', 'oleg@example.com', 'coffee_latte', 'Лате', 4, 'Дуже смачно'),
          ('user_003', 'Марія Шевченко', 'maria@example.com', 'dessert_cake', 'Шоколадний торт', 5, 'Найкращий десерт!')
        ON CONFLICT DO NOTHING;
      `
    });
    
    if (error) {
      console.error('❌ Помилка створення таблиць:', error);
      return res.json({
        success: false,
        error: error.message,
        message: 'Використовуйте fallback режим або створіть таблиці вручну через Supabase UI'
      });
    }
    
    res.json({
      success: true,
      message: 'Таблиці reviews, bookings, orders створені/перевірені',
      tables: ['reviews', 'bookings', 'orders']
    });
  } catch (error) {
    console.error('❌ Помилка setup:', error);
    res.json({
      success: false,
      error: error.message,
      message: 'Створіть таблиці вручну в Supabase: Table Editor → New Table'
    });
  }
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================

app.listen(PORT, () => {
  console.log(`
🚀 СЕРВЕР ЗАПУЩЕНО НА SUPABASE!
📍 Порт: ${PORT}
🔗 Локальний URL: http://localhost:${PORT}
📊 Supabase URL: ${supabaseUrl}

📋 ДОСТУПНІ МАРШРУТИ:
   GET    /api/health              - Перевірка здоров'я
   GET    /api/setup-database      - Створення таблиць
   
   GET    /api/reviews/all         - Всі відгуки
   POST   /api/reviews             - Створити відгук
   GET    /api/reviews/user/:id    - Відгуки користувача
   
   POST   /api/bookings            - Створити бронювання
   POST   /api/orders              - Створити замовлення
   
   GET    /api/menu                - Меню

⚠️  Якщо Supabase не доступний - автоматично використовуються тестові дані!
✅ Все працюватиме незалежно від стану бази даних!
  `);
});