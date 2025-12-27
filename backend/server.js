const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors({
  origin: ['http://localhost:3000', 'https://coffee-cow-shop-project.netlify.app'],
  credentials: true
}));
app.use(express.json());

// Логування запитів
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('📦 Тіло запиту:', req.body);
  }
  next();
});

// Обробка preflight запитів
app.options('*', cors());

// ============================================
// ТЕСТОВІ ДАНІ (працюють завжди)
// ============================================
let testReviews = [
  {
    id: "review_1",
    user_id: "user_001",
    user_name: "Олена Петренко",
    user_email: "olena@example.com",
    dish_id: "general",
    dish_name: "Кав'ярня в цілому",
    rating: 5,
    comment: "Чудова атмосфера! Дуже затишно та смачна кава.",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: "review_2",
    user_id: "user_002",
    user_name: "Андрій Коваленко",
    user_email: "andrii@example.com",
    dish_id: "latte",
    dish_name: "Лате",
    rating: 4,
    comment: "Смачно, але трохи мало кави в порції.",
    created_at: "2024-01-14T15:45:00Z"
  }
];

let testBookings = [];
let testOrders = [];

// ============================================
// МАРШРУТИ
// ============================================

// 1. ПЕРЕВІРКА ЗДОРОВ'Я
app.get('/api/health', (req, res) => {
  console.log('🩺 Health check');
  res.json({
    status: 'running',
    server: 'online',
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    data: {
      reviews: testReviews.length,
      bookings: testBookings.length,
      orders: testOrders.length
    }
  });
});

// 2. ТЕСТОВИЙ МАРШРУТ
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test route works!',
    version: '2.0',
    features: ['reviews', 'bookings', 'orders', 'menu']
  });
});

// ============================================
// ВІДГУКИ
// ============================================

// 3. ОТРИМАТИ ВСІ ВІДГУКИ
app.get('/api/reviews/all', (req, res) => {
  console.log('📥 Запит всіх відгуків');
  res.json({
    success: true,
    count: testReviews.length,
    data: testReviews
  });
});

// 4. СТВОРИТИ ВІДГУК
app.post('/api/reviews', (req, res) => {
  try {
    console.log('📝 Створення відгуку:', req.body);
    
    const { userId, userName, userEmail, dishId, dishName, rating, comment } = req.body;
    
    // Валідація
    if (!userId || !userName || !dishId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Будь ласка, заповніть всі обов\'язкові поля'
      });
    }
    
    const newReview = {
      id: 'review_' + Date.now(),
      user_id: userId,
      user_name: userName,
      user_email: userEmail || 'user@example.com',
      dish_id: dishId,
      dish_name: dishName || 'Загальний відгук',
      rating: parseInt(rating) || 5,
      comment: comment,
      created_at: new Date().toISOString()
    };
    
    testReviews.unshift(newReview);
    
    console.log('✅ Відгук створено:', newReview.id);
    
    res.status(201).json({
      success: true,
      data: newReview,
      message: 'Відгук успішно додано!'
    });
    
  } catch (error) {
    console.error('❌ Помилка при створенні відгуку:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// ============================================
// БРОНЮВАННЯ
// ============================================

// 5. СТВОРИТИ БРОНЮВАННЯ
app.post('/api/bookings', (req, res) => {
  try {
    console.log('📅 Створення бронювання:', req.body);
    
    const { name, phone, date, time, guests, email, userId } = req.body;
    
    // Валідація
    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Будь ласка, заповніть всі обов\'язкові поля'
      });
    }
    
    const guestsNum = parseInt(guests);
    if (isNaN(guestsNum) || guestsNum < 1 || guestsNum > 20) {
      return res.status(400).json({
        success: false,
        error: 'Кількість гостей повинна бути від 1 до 20'
      });
    }
    
    const bookingId = 'booking_' + Date.now();
    const newBooking = {
      id: bookingId,
      user_id: userId || null,
      user_name: name,
      user_email: email || null,
      user_phone: phone,
      date: date,
      time: time,
      guests: guestsNum,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };
    
    testBookings.unshift(newBooking);
    
    console.log('✅ Бронювання створено:', bookingId);
    
    res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Столик успішно заброньовано!'
    });
    
  } catch (error) {
    console.error('❌ Помилка при створенні бронювання:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// ============================================
// ЗАМОВЛЕННЯ
// ============================================

// 6. СТВОРИТИ ЗАМОВЛЕННЯ
app.post('/api/orders', (req, res) => {
  try {
    console.log('🛒 Створення замовлення:', req.body);
    
    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      deliveryTime,
      deliveryNotes,
      paymentMethod,
      items,
      totalAmount,
      deliveryFee,
      customerId
    } = req.body;
    
    // Валідація
    if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Будь ласка, заповніть всі обов\'язкові поля'
      });
    }
    
    // Генерація номера замовлення
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
    const finalAmount = (parseFloat(totalAmount) || 0) + (parseFloat(deliveryFee) || 0);
    
    const newOrder = {
      id: 'order_' + Date.now(),
      order_number: orderNumber,
      customer_id: customerId || null,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      delivery_address: deliveryAddress,
      delivery_time: deliveryTime || null,
      delivery_notes: deliveryNotes || '',
      payment_method: paymentMethod || 'cash',
      payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'pending',
      total_amount: parseFloat(totalAmount) || 0,
      delivery_fee: parseFloat(deliveryFee) || 0,
      final_amount: finalAmount,
      items: items || [],
      created_at: new Date().toISOString()
    };
    
    testOrders.unshift(newOrder);
    
    console.log('✅ Замовлення створено:', orderNumber);
    console.log('📊 Деталі:', {
      items: items.length,
      total: finalAmount,
      customer: customerName
    });
    
    res.status(201).json({
      success: true,
      data: newOrder,
      message: `Замовлення №${orderNumber} успішно оформлено!`
    });
    
  } catch (error) {
    console.error('❌ КРИТИЧНА ПОМИЛКА при створенні замовлення:', error);
    console.error('Стек помилки:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера при створенні замовлення'
    });
  }
});

// ============================================
// МЕНЮ
// ============================================

// 7. ОТРИМАТИ МЕНЮ
app.get('/api/menu', (req, res) => {
  console.log('📋 Запит меню');
  res.json({
    success: true,
    data: [
      { id: 'coffee_latte', name: 'Лате', price: 85, category: 'coffee', image: '/images/latte.jpg' },
      { id: 'coffee_cappuccino', name: 'Капучино', price: 80, category: 'coffee', image: '/images/cappuccino.jpg' },
      { id: 'coffee_espresso', name: 'Еспресо', price: 60, category: 'coffee', image: '/images/espresso.jpg' },
      { id: 'coffee_americano', name: 'Американо', price: 55, category: 'coffee', image: '/images/americano.jpg' },
      { id: 'bakery_croissant', name: 'Круасан', price: 45, category: 'bakery', image: '/images/croissant.jpg' },
      { id: 'bakery_bagel', name: 'Бейгл з лососем', price: 75, category: 'bakery', image: '/images/bagel.jpg' },
      { id: 'bakery_muffin', name: 'Мафін з чорницею', price: 50, category: 'bakery', image: '/images/muffin.jpg' },
      { id: 'dessert_cake', name: 'Шоколадний торт', price: 65, category: 'desserts', image: '/images/cake.jpg' },
      { id: 'dessert_tiramisu', name: 'Тірамісу', price: 70, category: 'desserts', image: '/images/tiramisu.jpg' },
      { id: 'dessert_cheesecake', name: 'Чізкейк', price: 68, category: 'desserts', image: '/images/cheesecake.jpg' }
    ]
  });
});

// ============================================
// ДОДАТКОВІ МАРШРУТИ
// ============================================

// 8. ОТРИМАТИ ВІДГУКИ КОРИСТУВАЧА
app.get('/api/reviews/user/:userId', (req, res) => {
  const { userId } = req.params;
  console.log(`👤 Запит відгуків користувача: ${userId}`);
  
  const userReviews = testReviews.filter(review => review.user_id === userId);
  
  res.json({
    success: true,
    data: userReviews
  });
});

// 9. ОТРИМАТИ БРОНЮВАННЯ КОРИСТУВАЧА
app.get('/api/bookings/user/:email', (req, res) => {
  const { email } = req.params;
  console.log(`📧 Запит бронювань за email: ${email}`);
  
  const userBookings = testBookings.filter(booking => booking.user_email === email);
  
  res.json({
    success: true,
    data: userBookings
  });
});

// 10. СКАСУВАТИ БРОНЮВАННЯ
app.put('/api/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  console.log(`❌ Скасування бронювання: ${id}`);
  
  const booking = testBookings.find(b => b.id === id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      error: 'Бронювання не знайдено'
    });
  }
  
  booking.status = 'cancelled';
  
  res.json({
    success: true,
    data: booking,
    message: 'Бронювання скасовано'
  });
});

// ============================================
// ОБРОБКА ПОМИЛОК
// ============================================

// 404 - не знайдено
app.use('*', (req, res) => {
  console.log(`❌ Маршрут не знайдено: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Маршрут не знайдено'
  });
});

// Глобальна обробка помилок
app.use((err, req, res, next) => {
  console.error('🔥 ГЛОБАЛЬНА ПОМИЛКА:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Внутрішня помилка сервера'
  });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
app.listen(PORT, () => {
  console.log(`
===================================================
🚀 СЕРВЕР ЗАПУЩЕНО НА ПОРТІ ${PORT}
📍 Локальний URL: http://localhost:${PORT}
📡 Доступний з фронтенду: http://localhost:3000
===================================================

📊 СТАТИСТИКА ДАНИХ:
   📝 Відгуків: ${testReviews.length}
   📅 Бронювань: ${testBookings.length}
   🛒 Замовлень: ${testOrders.length}

📋 ДОСТУПНІ МАРШРУТИ:
   [GET]  /api/health                    - Перевірка здоров'я
   [GET]  /api/test                     - Тестовий маршрут
   
   [GET]  /api/menu                     - Меню
   
   [GET]  /api/reviews/all              - Всі відгуки
   [POST] /api/reviews                  - Створити відгук
   [GET]  /api/reviews/user/:userId     - Відгуки користувача
   
   [POST] /api/bookings                 - Створити бронювання
   [GET]  /api/bookings/user/:email     - Бронювання за email
   [PUT]  /api/bookings/:id/cancel      - Скасувати бронювання
   
   [POST] /api/orders                   - Створити замовлення

✅ ВСЕ ПРАЦЮВАТИМЕ НАВІТЬ БЕЗ ПІДКЛЮЧЕННЯ ДО БАЗИ ДАНИХ!
===================================================
  `);
});