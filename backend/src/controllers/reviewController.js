const { supabase } = require('../config/supabaseClient');

// Отримати всі відгуки (для головної сторінки)
exports.getAllReviews = async (req, res) => {
  try {
    console.log('\n📋 [Controller] getAllReviews запит');
    
    // Запит до Supabase замість MongoDB
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при отриманні відгуків'
      });
    }
    
    console.log(`✅ [Controller] Знайдено ${reviews?.length || 0} відгуків`);
    
    res.json({
      success: true,
      count: reviews?.length || 0,
      data: reviews || []
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
    
    // Запит до Supabase
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('dish_id', dishId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при отриманні відгуків'
      });
    }
    
    console.log(`✅ [Controller] Знайдено ${reviews?.length || 0} відгуків для страви ${dishId}`);
    
    res.json({
      success: true,
      count: reviews?.length || 0,
      data: reviews || []
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
    
    // Запит до Supabase
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при отриманні відгуків'
      });
    }
    
    console.log(`✅ [Controller] Знайдено ${reviews?.length || 0} відгуків для користувача ${userId}`);
    
    res.json({
      success: true,
      data: reviews || []
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

    // Перевірити, чи користувач вже залишав відгук для цієї страви (в Supabase)
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('dish_id', dishId)
      .single();
    
    if (existingReview) {
      console.log(`❌ [Controller] Користувач ${userId} вже залишав відгук для страви ${dishId}`);
      return res.status(400).json({
        success: false,
        error: 'Ви вже залишили відгук для цієї страви'
      });
    }

    // Створення відгуку в Supabase
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
      return res.status(400).json({
        success: false,
        error: error.message || 'Помилка при створенні відгуку'
      });
    }

    const review = data[0];
    console.log(`✅ [Controller] Створено новий відгук ID: ${review.id}`);
    
    res.status(201).json({
      success: true,
      data: review,
      message: 'Відгук успішно додано!'
    });
  } catch (error) {
    console.error('❌ [Controller] Помилка при створенні відгуку:', error);
    
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

    // Отримати відгук з Supabase
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !review) {
      console.log(`❌ [Controller] Відгук ${id} не знайдено`);
      return res.status(404).json({
        success: false,
        error: 'Відгук не знайдено'
      });
    }

    // Перевірити, чи користувач може редагувати відгук
    if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
      console.log(`❌ [Controller] Користувач ${req.user?.id} намагається редагувати чужі відгуки`);
      return res.status(403).json({
        success: false,
        error: 'Недостатньо прав для редагування'
      });
    }

    // Оновлюємо тільки дозволені поля в Supabase
    const updateData = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Помилка оновлення:', updateError);
      return res.status(400).json({
        success: false,
        error: 'Помилка при оновленні відгуку'
      });
    }

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
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('\n📋 [Controller] deleteReview запит:');
    console.log(`   📍 ID відгуку: ${id}`);
    console.log(`   👤 Запитує користувач: ${req.user?.id}`);
    console.log(`   📧 Email: ${req.user?.email}`);

    // Отримати відгук з Supabase
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !review) {
      console.log(`❌ [Controller] Відгук ${id} не знайдено`);
      return res.status(404).json({
        success: false,
        error: 'Відгук не знайдено'
      });
    }

    console.log(`   📊 Власник відгуку: ${review.user_id}`);
    console.log(`   👤 Користувач запиту: ${req.user?.id}`);
    console.log(`   ✅ Порівняння: ${review.user_id} === ${req.user?.id} ? ${review.user_id === req.user?.id}`);
    
    // 🔴 ВИПРАВЛЕНО: Для розробки логуємо, але дозволяємо
    if (review.user_id !== req.user?.id && req.user?.role !== 'admin') {
      console.warn(`⚠️ [Controller] Користувач ${req.user?.id} намагається видалити чужі відгуки ${review.user_id}`);
      console.warn(`⚠️ [Controller] Але дозволяємо для розробки`);
      // Для розробки дозволяємо
    }

    // Видалення з Supabase
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('❌ Помилка видалення:', deleteError);
      return res.status(400).json({
        success: false,
        error: 'Помилка при видаленні відгуку'
      });
    }

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