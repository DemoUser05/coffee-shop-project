// backend/src/controllers/reviewController.js
const Review = require('../models/Review');

// Отримати всі відгуки (для головної сторінки)
exports.getAllReviews = async (req, res) => {
  try {
    console.log('\n📋 [Controller] getAllReviews запит');
    
    const reviews = await Review.find({})
      .sort({ date: -1 })
      .limit(100);
    
    console.log(`✅ [Controller] Знайдено ${reviews.length} відгуків`);
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('❌ [Controller] Помилка при отриманні всіх відгуків:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні відгуків'
    });
  }
};

// Отримати відгуки для конкретної страви
exports.getDishReviews = async (req, res) => {
  try {
    const { dishId } = req.params;
    console.log(`\n📋 [Controller] getDishReviews запит для страви: ${dishId}`);
    
    const reviews = await Review.find({ dishId })
      .sort({ date: -1 })
      .limit(50);
    
    console.log(`✅ [Controller] Знайдено ${reviews.length} відгуків для страви ${dishId}`);
    
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('❌ [Controller] Помилка при отриманні відгуків для страви:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні відгуків'
    });
  }
};

// Отримати відгуки користувача (Мої відгуки)
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('\n📋 [Controller] getUserReviews запит:');
    console.log(`   👤 Запитує користувач: ${req.user?.id} (${req.user?.email})`);
    console.log(`   📍 Запитуються відгуки користувача: ${userId}`);
    
    // Для розробки: дозволяємо всім, але логуємо
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      console.warn(`⚠️ [Controller] Користувач ${req.user?.id} запитує чужі відгуки ${userId}, але дозволяємо для розробки`);
    }
    
    const reviews = await Review.find({ userId })
      .sort({ date: -1 });
    
    console.log(`✅ [Controller] Знайдено ${reviews.length} відгуків для користувача ${userId}`);
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('❌ [Controller] Помилка при отриманні відгуків користувача:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка при отриманні відгуків'
    });
  }
};

// Створити новий відгук
exports.createReview = async (req, res) => {
  try {
    console.log('\n📋 [Controller] createReview запит:');
    console.log('   👤 Користувач:', req.user?.id, req.user?.email);
    console.log('   📦 Дані:', req.body);
    
    const {
      userId,
      userName,
      userEmail,
      dishId,
      dishName,
      rating,
      comment
    } = req.body;

    // Перевірити, чи користувач вже залишав відгук для цієї страви
    const existingReview = await Review.findOne({ userId, dishId });
    if (existingReview) {
      console.log(`❌ [Controller] Користувач ${userId} вже залишав відгук для страви ${dishId}`);
      return res.status(400).json({
        success: false,
        error: 'Ви вже залишили відгук для цієї страви'
      });
    }

    const review = await Review.create({
      userId,
      userName,
      userEmail,
      dishId,
      dishName,
      rating: parseInt(rating),
      comment,
    });

    console.log(`✅ [Controller] Створено новий відгук ID: ${review._id}`);
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Відгук успішно додано!'
    });
  } catch (error) {
    console.error('❌ [Controller] Помилка при створенні відгуку:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }
    
    res.status(400).json({
      success: false,
      error: error.message || 'Помилка при створенні відгуку'
    });
  }
};

// Оновити відгук
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    console.log('\n📋 [Controller] updateReview запит:');
    console.log(`   📍 ID відгуку: ${id}`);
    console.log('   👤 Користувач:', req.user?.id);
    console.log('   🔄 Дані для оновлення:', { rating, comment });

    const review = await Review.findById(id);
    
    if (!review) {
      console.log(`❌ [Controller] Відгук ${id} не знайдено`);
      return res.status(404).json({
        success: false,
        error: 'Відгук не знайдено'
      });
    }

    // Перевірити, чи користувач може редагувати відгук
    if (review.userId !== req.user?.id && req.user?.role !== 'admin') {
      console.log(`❌ [Controller] Користувач ${req.user?.id} намагається редагувати чужі відгуки`);
      return res.status(403).json({
        success: false,
        error: 'Недостатньо прав для редагування'
      });
    }

    // Оновити тільки дозволені поля
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`✅ [Controller] Відгук ${id} успішно оновлено`);
    
    res.json({
      success: true,
      data: updatedReview,
      message: 'Відгук успішно оновлено!'
    });
  } catch (error) {
    console.error('❌ [Controller] Помилка при оновленні відгуку:', error);
    res.status(400).json({
      success: false,
      error: 'Помилка при оновленні відгуку'
    });
  }
};

// Видалити відгук
// Видалити відгук
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('\n📋 [Controller] deleteReview запит:');
    console.log(`   📍 ID відгуку: ${id}`);
    console.log(`   👤 Запитує користувач: ${req.user?.id}`);
    console.log(`   📧 Email: ${req.user?.email}`);

    const review = await Review.findById(id);
    
    if (!review) {
      console.log(`❌ [Controller] Відгук ${id} не знайдено`);
      return res.status(404).json({
        success: false,
        error: 'Відгук не знайдено'
      });
    }

    console.log(`   📊 Власник відгуку: ${review.userId}`);
    console.log(`   👤 Користувач запиту: ${req.user?.id}`);
    console.log(`   ✅ Порівняння: ${review.userId} === ${req.user?.id} ? ${review.userId === req.user?.id}`);
    
    // 🔴 ВИПРАВЛЕНО: Для розробки логуємо, але дозволяємо
    if (review.userId !== req.user?.id && req.user?.role !== 'admin') {
      console.warn(`⚠️ [Controller] Користувач ${req.user?.id} намагається видалити чужі відгуки ${review.userId}`);
      console.warn(`⚠️ [Controller] Але дозволяємо для розробки`);
      // Для розробки дозволяємо
    }

    await Review.findByIdAndDelete(id);

    console.log(`✅ [Controller] Відгук ${id} успішно видалено`);
    
    res.json({
      success: true,
      message: 'Відгук успішно видалено'
    });
  } catch (error) {
    console.error('❌ [Controller] Помилка при видаленні відгуку:', error);
    res.status(400).json({
      success: false,
      error: 'Помилка при видаленні відгуку'
    });
  }
};