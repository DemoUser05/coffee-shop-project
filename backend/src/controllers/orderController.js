const { supabase } = require('../config/supabaseClient');

// Створити нове замовлення
exports.createOrder = async (req, res) => {
  try {
    console.log('📨 [SERVER] Отримано POST запит на /api/orders');
    console.log('📨 [SERVER] Тіло запиту:', req.body);

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

    console.log('📝 [SERVER] Дані замовлення:');
    console.log('- Ім\'я:', customerName);
    console.log('- Телефон:', customerPhone);
    console.log('- Email:', customerEmail);
    console.log('- Адреса:', deliveryAddress);
    console.log('- Кількість товарів:', items?.length);
    console.log('- Сума:', totalAmount);
    console.log('- Доставка:', deliveryFee);

    // Валідація
    if (!customerName || !customerPhone || !deliveryAddress || !items || items.length === 0) {
      console.error('❌ [SERVER] Валідація не пройдена: відсутні обов\'язкові поля');
      return res.status(400).json({
        success: false,
        error: 'Будь ласка, заповніть всі обов\'язкові поля'
      });
    }

    console.log('✅ [SERVER] Валідація пройдена');

    // Генеруємо номер замовлення
    const orderNumber = `ORD${Date.now().toString().slice(-8)}`;
    console.log(`✅ [SERVER] Згенеровано номер: ${orderNumber}`);

    // Розраховуємо загальну суму
    const finalAmount = totalAmount + deliveryFee;
    console.log(`💰 [SERVER] Фінальна сума: ${finalAmount}`);

    // Підготуємо дані для Supabase
    const orderData = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      delivery_address: deliveryAddress,
      delivery_time: deliveryTime || null,
      delivery_notes: deliveryNotes || null,
      payment_method: paymentMethod || 'cash',
      payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'pending',
      total_amount: totalAmount,
      delivery_fee: deliveryFee,
      final_amount: finalAmount,
      items: items || [],
      customer_id: customerId || null
    };

    console.log('💾 [SERVER] Збереження в Supabase...');
    console.log('💾 Дані для збереження:', orderData);
    
    // Вставляємо в Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select();

    if (error) {
      console.error('❌ [SERVER] Помилка збереження в Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка при створенні замовлення',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    const order = data[0];
    console.log(`🎉 [SERVER] Замовлення успішно створено: ${orderNumber}`);
    console.log('📤 [SERVER] Відправляємо відповідь клієнту...');

    res.status(201).json({
      success: true,
      data: order,
      message: `Замовлення №${orderNumber} успішно оформлено!`
    });
    
  } catch (error) {
    console.error('🔥 [SERVER] КРИТИЧНА ПОМИЛКА при створенні замовлення:');
    console.error('🔥 Повідомлення:', error.message);
    console.error('🔥 Назва:', error.name);
    console.error('🔥 Стек:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Помилка сервера при створенні замовлення',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Отримати замовлення користувача
exports.getUserOrders = async (req, res) => {
  try {
    const { userId, email } = req.query;
    
    console.log('👤 Отримання замовлень для:', { userId, email });

    let query = supabase.from('orders').select('*');
    
    // Шукаємо за userId або email
    if (userId) {
      query = query.eq('customer_id', userId);
    } else if (email) {
      query = query.eq('customer_email', email);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Необхідно вказати userId або email'
      });
    }

    // Сортуємо за датою створення
    query = query.order('created_at', { ascending: false });

    const { data: orders, error } = await query;

    if (error) {
      console.error('❌ Помилка Supabase:', error);
      return res.status(500).json({
        success: false,
        error: 'Помилка бази даних'
      });
    }

    console.log(`✅ Знайдено ${orders?.length || 0} замовлень`);

    res.json({
      success: true,
      data: orders || []
    });
  } catch (error) {
    console.error('❌ Помилка при отриманні замовлень:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
};

// Отримати конкретне замовлення
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Шукаємо за ID або номером замовлення
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .or(`id.eq.${id},order_number.eq.${id}`)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('❌ Помилка при отриманні замовлення:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
};

// Оновити статус замовлення
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Невірний статус'
      });
    }

    // Оновлюємо в Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено або помилка оновлення'
      });
    }

    console.log(`✅ Статус замовлення ${order.order_number} оновлено на: ${status}`);

    res.json({
      success: true,
      data: order,
      message: 'Статус замовлення оновлено'
    });
  } catch (error) {
    console.error('❌ Помилка при оновленні статусу замовлення:', error);
    res.status(500).json({
      success: false,
      error: 'Помилка сервера'
    });
  }
};