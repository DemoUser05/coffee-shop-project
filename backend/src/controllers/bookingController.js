const Booking = require('../models/Booking');

// Створити нове бронювання (доступне для всіх)
exports.createBooking = async (req, res) => {
  try {
    const { name, phone, date, time, guests, email } = req.body;

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

    // Створення бронювання зі статусом "confirmed" одразу
    const bookingData = {
      userName: name,
      userPhone: phone,
      date: bookingDate,
      time,
      guests: guestsNum,
      status: 'confirmed', // Одразу підтверджуємо
      userId: req.user?.id || null
    };

    if (email) bookingData.userEmail = email;

    const booking = await Booking.create(bookingData);

    console.log(`✅ Бронювання створено: ${booking._id}`);

    res.status(201).json({
      success: true,
      data: booking,
      message: 'Столик успішно заброньовано!'
    });
  } catch (error) {
    console.error('❌ Помилка при створенні бронювання:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
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

    const bookings = await Booking.find({ userId })
      .sort({ date: -1, time: -1 });

    console.log(`✅ Знайдено ${bookings.length} бронювань для користувача ${userId}`);

    res.json({
      success: true,
      data: bookings
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
    
    // Шукаємо бронювання по email
    const bookings = await Booking.find({ userEmail: email })
      .sort({ date: -1, time: -1 });
    
    console.log(`✅ Знайдено бронювань для ${email}: ${bookings.length}`);
    
    res.json({
      success: true,
      data: bookings
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

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Бронювання не знайдено'
      });
    }

    // Якщо користувач авторизований, перевіряємо userId
    if (userId) {
      if (booking.userId && booking.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Недостатньо прав для скасування цього бронювання'
        });
      }
    }
    // Якщо не авторизований, можна скасувати тільки по email
    // (У реальному додатку тут має бути перевірка через email confirmation)

    // Змінюємо статус на "cancelled"
    booking.status = 'cancelled';
    await booking.save();

    console.log(`✅ Бронювання ${id} скасовано`);

    res.json({
      success: true,
      data: booking,
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

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Бронювання не знайдено'
      });
    }

    booking.status = status;
    await booking.save();

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

    const booking = await Booking.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Бронювання не знайдено'
      });
    }

    await Booking.findByIdAndDelete(id);

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

    const bookings = await Booking.find()
      .sort({ date: -1, time: -1 });

    console.log(`📊 Адмін: отримано ${bookings.length} бронювань`);

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
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

    // Останні 3 бронювання
    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .limit(3);

    console.log(`✅ Останні бронювання для ${userId}: ${bookings.length}`);

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('❌ Помилка при отриманні останніх бронювань:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні бронювань'
    });
  }
};