const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SUPABASE ПІДКЛЮЧЕННЯ
// ============================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase підключено');
} else {
  console.warn('⚠️  Supabase не налаштовано - використовуються тестові дані');
}

// ============================================
// MIDDLEWARE
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'https://coffee-cow-shop-project.netlify.app',
  'https://coffee-cow-shop-project.netlify.app/'
];

app.use(cors({
  origin: function(origin, callback) {
    // Дозволити запити без origin (наприклад, мобільні додатки)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'CORS політика не дозволяє доступ з цього джерела';
      console.warn('❌ CORS помилка:', origin);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ============================================
// МАРШРУТИ ДЛЯ ВІДГУКІВ
// ============================================

// 1. Отримати всі відгуки (з Supabase)
app.get('/api/reviews/all', async (req, res) => {
  try {
    console.log('📥 Запит всіх відгуків');
    
    if (!supabase) {
      return res.json({
        success: true,
        data: [],
        message: 'Supabase не налаштовано'
      });
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.json({
        success: true,
        data: [],
        error: error.message
      });
    }
    
    res.json({
      success: true,
      count: data?.length || 0,
      data: data || []
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// 2. Створити відгук
app.post('/api/reviews', async (req, res) => {
  try {
    console.log('📝 Створення відгуку:', req.body);
    
    const { userId, userName, userEmail, dishId, dishName, rating, comment } = req.body;
    
    if (!userId || !userName || !dishId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        error: 'Заповніть всі поля'
      });
    }
    
    if (!supabase) {
      // Тимчасово зберігаємо в пам'яті
      const tempReview = {
        id: 'temp_' + Date.now(),
        user_id: userId,
        user_name: userName,
        dish_id: dishId,
        dish_name: dishName || 'Загальний відгук',
        rating: parseInt(rating),
        comment: comment,
        created_at: new Date().toISOString()
      };
      
      return res.json({
        success: true,
        data: tempReview,
        message: 'Відгук додано (тимчасово)'
      });
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        dish_id: dishId,
        dish_name: dishName,
        rating: parseInt(rating),
        comment: comment
      }])
      .select();
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка бази даних'
      });
    }
    
    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Відгук успішно додано!'
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// 3. Отримати відгуки користувача (новий маршрут)
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`👤 [SERVER] Запит відгуків користувача: ${userId}`);
    
    if (!supabase) {
      return res.json({
        success: true,
        data: [],
        message: 'Supabase не налаштовано'
      });
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Помилка Supabase при пошуку відгуків:', error);
      return res.json({
        success: true,
        data: [],
        error: error.message
      });
    }
    
    console.log(`✅ [SERVER] Знайдено відгуків: ${data?.length || 0}`);
    
    // Перетворюємо дані з Supabase в формат, який очікує frontend
    const formattedReviews = (data || []).map(review => ({
      _id: review.id,
      id: review.id,
      userId: review.user_id,
      userName: review.user_name,
      userEmail: review.user_email,
      dishId: review.dish_id,
      dishName: review.dish_name,
      rating: review.rating,
      comment: review.comment,
      date: review.created_at,
      createdAt: review.created_at
    }));
    
    res.json({
      success: true,
      count: formattedReviews.length,
      data: formattedReviews
    });
    
  } catch (error) {
    console.error('❌ [SERVER] Помилка сервера при отриманні відгуків:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// 4. Отримати відгуки для конкретної страви (опціонально)
app.get('/api/reviews/dish/:dishId', async (req, res) => {
  try {
    const { dishId } = req.params;
    console.log(`🍽️ [SERVER] Запит відгуків для страви: ${dishId}`);
    
    if (!supabase) {
      return res.json({
        success: true,
        data: [],
        message: 'Supabase не налаштовано'
      });
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('dish_id', dishId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.json({
        success: true,
        data: [],
        error: error.message
      });
    }
    
    const formattedReviews = (data || []).map(review => ({
      _id: review.id,
      id: review.id,
      userId: review.user_id,
      userName: review.user_name,
      userEmail: review.user_email,
      dishId: review.dish_id,
      dishName: review.dish_name,
      rating: review.rating,
      comment: review.comment,
      date: review.created_at,
      createdAt: review.created_at
    }));
    
    res.json({
      success: true,
      count: formattedReviews.length,
      data: formattedReviews
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// 5. Оновити відгук
app.put('/api/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    
    console.log(`🔄 [SERVER] Оновлення відгуку: ${reviewId}`, req.body);
    
    if (!supabase) {
      return res.json({
        success: true,
        message: 'Supabase не налаштовано, відгук не оновлено'
      });
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment })
      .eq('id', reviewId)
      .select();
    
    if (error) {
      console.error('❌ Помилка Supabase при оновленні:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка бази даних'
      });
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Відгук не знайдено'
      });
    }
    
    const updatedReview = data[0];
    
    res.json({
      success: true,
      data: {
        _id: updatedReview.id,
        id: updatedReview.id,
        userId: updatedReview.user_id,
        userName: updatedReview.user_name,
        userEmail: updatedReview.user_email,
        dishId: updatedReview.dish_id,
        dishName: updatedReview.dish_name,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        date: updatedReview.created_at,
        createdAt: updatedReview.created_at
      },
      message: 'Відгук успішно оновлено!'
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// 6. Видалити відгук
app.delete('/api/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    console.log(`🗑️ [SERVER] Видалення відгуку: ${reviewId}`);
    
    if (!supabase) {
      return res.json({
        success: true,
        message: 'Supabase не налаштовано, відгук не видалено'
      });
    }
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    
    if (error) {
      console.error('❌ Помилка Supabase при видаленні:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка бази даних'
      });
    }
    
    res.json({
      success: true,
      message: 'Відгук успішно видалено!'
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// ============================================
// МАРШРУТИ ДЛЯ БРОНЮВАНЬ
// ============================================

// 3. Створити бронювання
app.post('/api/bookings', async (req, res) => {
  try {
    console.log('📅 Створення бронювання:', req.body);
    
    const { name, phone, date, time, guests, email, userId } = req.body;
    
    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({
        success: false,
        error: 'Заповніть всі поля'
      });
    }
    
    if (!supabase) {
      const tempBooking = {
        id: 'temp_' + Date.now(),
        user_name: name,
        user_phone: phone,
        date: date,
        time: time,
        guests: parseInt(guests),
        status: 'confirmed',
        created_at: new Date().toISOString()
      };
      
      return res.json({
        success: true,
        data: tempBooking,
        message: 'Бронювання створено (тимчасово)'
      });
    }
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: userId || null,
        user_name: name,
        user_email: email || null,
        user_phone: phone,
        date: date,
        time: time,
        guests: parseInt(guests),
        status: 'confirmed'
      }])
      .select();
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка бази даних'
      });
    }
    
    res.status(201).json({
      success: true,
      data: data[0],
      message: 'Столик успішно заброньовано!'
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// 4. Отримати бронювання користувача
// Отримати бронювання користувача (додайте логування)
app.get('/api/bookings/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log(`📧 [SERVER] Пошук бронювань для: ${email}`);
    
    if (!supabase) {
      console.log('❌ Supabase не підключено');
      return res.json({
        success: true,
        data: [],
        message: 'Supabase не налаштовано'
      });
    }
    
    // Детальний пошук
    console.log(`🔍 [SERVER] Виконую запит до Supabase...`);
    
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ [SERVER] Помилка Supabase:', error);
      console.error('❌ [SERVER] Код помилки:', error.code);
      console.error('❌ [SERVER] Повідомлення:', error.message);
      
      return res.json({
        success: true,
        data: [],
        error: error.message
      });
    }
    
    console.log(`✅ [SERVER] Знайдено бронювань: ${data?.length || 0}`);
    if (data && data.length > 0) {
      console.log('📋 [SERVER] Знайдені бронювання:');
      data.forEach((booking, index) => {
        console.log(`   ${index + 1}. ${booking.user_name} - ${booking.date} ${booking.time}`);
      });
    }
    
    // Повертаємо масив без додаткового обгортання
    res.json(data || []);
    
  } catch (error) {
    console.error('❌ [SERVER] Критична помилка:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// ============================================
// МАРШРУТИ ДЛЯ ЗАМОВЛЕНЬ
// ============================================

// 5. Створити замовлення
app.post('/api/orders', async (req, res) => {
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
    
    if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Заповніть всі поля'
      });
    }
    
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
    const finalAmount = (parseFloat(totalAmount) || 0) + (parseFloat(deliveryFee) || 0);
    
    if (!supabase) {
      const tempOrder = {
        id: 'temp_' + Date.now(),
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        items: items,
        total_amount: parseFloat(totalAmount) || 0,
        delivery_fee: parseFloat(deliveryFee) || 0,
        final_amount: finalAmount,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      return res.json({
        success: true,
        data: tempOrder,
        message: 'Замовлення створено (тимчасово)'
      });
    }
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
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
        items: items
      }])
      .select();
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка бази даних'
      });
    }
    
    res.status(201).json({
      success: true,
      data: data[0],
      message: `Замовлення №${orderNumber} успішно оформлено!`
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// 6. Отримати замовлення користувача (ВИПРАВЛЕНО!)
app.get('/api/orders/user', async (req, res) => {
  try {
    const { userId, email } = req.query;
    console.log(`👤 Замовлення для: userId=${userId}, email=${email}`);
    
    if (!supabase) {
      return res.json({
        success: true,
        data: [],
        message: 'Supabase не налаштовано'
      });
    }
    
    let query = supabase.from('orders').select('*');
    
    if (userId) {
      query = query.eq('customer_id', userId);
    } else if (email) {
      query = query.eq('customer_email', email);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Вкажіть userId або email'
      });
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.json({
        success: true,
        data: [],
        error: error.message
      });
    }
    
    res.json({
      success: true,
      data: data || []
    });
    
  } catch (error) {
    console.error('❌ Помилка сервера:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
});

// ============================================
// ІНШІ МАРШРУТИ
// ============================================

// 7. Меню
app.get('/api/menu', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'coffee_latte', name: 'Лате', price: 85, category: 'coffee' },
      { id: 'coffee_cappuccino', name: 'Капучино', price: 80, category: 'coffee' },
      { id: 'coffee_espresso', name: 'Еспресо', price: 60, category: 'coffee' },
      { id: 'bakery_croissant', name: 'Круасан', price: 45, category: 'bakery' },
      { id: 'bakery_bagel', name: 'Бейгл', price: 40, category: 'bakery' },
      { id: 'dessert_cake', name: 'Шоколадний торт', price: 65, category: 'desserts' }
    ]
  });
});

// 8. Перевірка здоров'я
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    supabase: !!supabase,
    port: PORT
  });
});

// 9. Налаштування таблиць
app.get('/api/setup-tables', async (req, res) => {
  if (!supabase) {
    return res.json({
      success: false,
      message: 'Supabase не налаштовано'
    });
  }
  
  try {
    // Перевіряємо наявність таблиць
    const tables = ['reviews', 'bookings', 'orders'];
    const results = {};
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      results[table] = error ? 'missing' : 'exists';
    }
    
    res.json({
      success: true,
      tables: results,
      instructions: results.reviews === 'missing' 
        ? 'Створіть таблиці в Supabase: reviews, bookings, orders' 
        : 'Таблиці готові'
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ЗАПУСК
// ============================================
app.listen(PORT, () => {
  console.log(`
🚀 Сервер запущено: http://localhost:${PORT}
📊 Supabase: ${supabase ? '✅ Підключено' : '❌ Не налаштовано'}

📋 МАРШРУТИ:
   GET    /api/health
   GET    /api/setup-tables
   
   GET    /api/menu
   
   GET    /api/reviews/all
   POST   /api/reviews
   
   POST   /api/bookings
   GET    /api/bookings/user/:email
   
   POST   /api/orders
   GET    /api/orders/user?userId=...&email=...
  `);
});