const { supabase } = require('../config/supabaseClient');

// Створити нове бронювання (доступне для всіх)
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, date, time, guests, email, userId } = req.body;

    console.log('📋 Створення бронювання:', { name, phone, date, time, guests, email });

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

    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        error: 'Не можна бронювати столик на минулу дату'
      });
    }

    // Підготовка даних для Supabase
    const bookingData = {
      user_name: name,
      user_phone: phone,
      date: bookingDate.toISOString().split('T')[0], // Тільки дата YYYY-MM-DD
      time: time,
      guests: guestsNum,
      status: 'confirmed',
      user_id: userId || null,
      user_email: email || null
    };

    console.log('💾 Збереження в Supabase:', bookingData);

    // Вставка в Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select();

    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при створенні бронювання'
      });
    }

    const booking = data[0];
    console.log(`✅ Бронювання створено: ${booking.id}`);

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Столик успішно заброньовано!'
    });
  } catch (error) {
    console.error('❌ Помилка при створенні бронювання:', error);
    
    res.status(400).json({
      success: false,
      error: error.message || 'Помилка при створенні бронювання'
    });
  }
};

// Отримати бронювання користувача (Мої бронювання - авторизовані)
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Необхідна авторизація'
      });
    }

    console.log(`👤 Отримання бронювань для користувача: ${userId}`);

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при отриманні бронювань'
      });
    }

    console.log(`✅ Знайдено ${bookings?.length || 0} бронювань для користувача ${userId}`);

    res.json({
      success: true,
      data: bookings || []
    });
  } catch (error) {
    console.error('❌ Помилка при отриманні бронювань користувача:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні бронювань'
    });
  }
};

// Отримати бронювання за email (для ProfilePage - можна використовувати без авторизації)
exports.getUserBookingsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`📧 Отримання бронювань за email: ${email}`);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Будь ласка, вкажіть email'
      });
    }
    
    // Шукаємо бронювання по email в Supabase
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_email', email)
      .order('date', { ascending: false })
      .order('time', { ascending: false });
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при отриманні бронювань'
      });
    }
    
    console.log(`✅ Знайдено бронювань для ${email}: ${bookings?.length || 0}`);
    
    res.json({
      success: true,
      data: bookings || []
    });
  } catch (error) {
    console.error('❌ Помилка при отриманні бронювань за email:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні бронювань'
    });
  }
};

// Скасувати бронювання (доступне для всіх по email)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    console.log(`❌ Спроба скасування бронювання ${id}`);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'ID бронювання не вказано'
      });
    }

    // Отримуємо бронювання з Supabase
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Бронювання не знайдено'
      });
    }

    // Якщо користувач авторизований, перевіряємо userId
    if (userId) {
      if (booking.user_id && booking.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Недостатньо прав для скасування цього бронювання'
        });
      }
    }

    // Оновлюємо статус на "cancelled" в Supabase
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Помилка оновлення:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Помилка при скасуванні бронювання'
      });
    }

    console.log(`✅ Бронювання ${id} скасовано`);

    res.json({
      success: true,
      data: updatedBooking,
      message: 'Бронювання успішно скасовано'
    });
  } catch (error) {
    console.error('❌ Помилка при скасуванні бронювання:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при скасуванні бронювання'
    });
  }
};

// Оновити статус бронювання (тільки для адміна)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Тільки адмін може змінювати статуси
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Недостатньо прав'
      });
    }

    const validStatuses = ['confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Невірний статус. Дозволені статуси: confirmed, cancelled'
      });
    }

    // Оновлення в Supabase
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !booking) {
      return res.status(404).json({
        success: false,
        error: 'Бронювання не знайдено або помилка оновлення'
      });
    }

    console.log(`✅ Адмін: статус бронювання ${id} змінено на: ${status}`);

    res.json({
      success: true,
      data: booking,
      message: 'Статус бронювання успішно оновлено'
    });
  } catch (error) {
    console.error('❌ Помилка при оновленні статусу бронювання:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при оновленні бронювання'
    });
  }
};

// Видалити бронювання (тільки для адміна)
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // Тільки адмін може видаляти бронювання
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Недостатньо прав'
      });
    }

    // Видалення з Supabase
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(404).json({
        success: false,
        error: 'Бронювання не знайдено або помилка видалення'
      });
    }

    console.log(`✅ Адмін: бронювання ${id} видалено`);

    res.json({
      success: true,
      message: 'Бронювання успішно видалено'
    });
  } catch (error) {
    console.error('❌ Помилка при видаленні бронювання:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при видаленні бронювання'
    });
  }
};

// Отримати всі бронювання (тільки для адміна)
exports.getAllBookings = async (req, res) => {
  try {
    // Перевірка на адміна
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Доступ заборонено'
      });
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при отриманні бронювань'
      });
    }

    console.log(`📊 Адмін: отримано ${bookings?.length || 0} бронювань`);

    res.json({
      success: true,
      count: bookings?.length || 0,
      data: bookings || []
    });
  } catch (error) {
    console.error('❌ Помилка при отриманні всіх бронювань:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
};

// Отримати останні бронювання (для профілю - авторизовані)
exports.getRecentBookings = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.json({
        success: true,
        data: [] // Повертаємо пустий масив для неавторизованих
      });
    }

    console.log(`🕐 Отримання останніх бронювань для: ${userId}`);

    // Останні 3 бронювання з Supabase
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при отриманні бронювань'
      });
    }

    console.log(`✅ Останні бронювання для ${userId}: ${bookings?.length || 0}`);

    res.json({
      success: true,
      data: bookings || []
    });
  } catch (error) {
    console.error('❌ Помилка при отриманні останніх бронювань:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні бронювань'
    });
  }
};