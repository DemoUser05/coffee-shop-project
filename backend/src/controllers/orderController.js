const Order = require('../models/Order');

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
    console.log('🔢 [SERVER] Генерація номера замовлення...');
    let orderNumber;
    try {
      orderNumber = await Order.generateOrderNumber();
      console.log(`✅ [SERVER] Згенеровано номер: ${orderNumber}`);
    } catch (generateError) {
      console.error('❌ [SERVER] Помилка генерації номера:', generateError);
      // Якщо генерація не вдалася, створюємо простий номер
      orderNumber = `ORD${Date.now().toString().slice(-8)}`;
      console.log(`🔄 [SERVER] Використано резервний номер: ${orderNumber}`);
    }

    // Розраховуємо загальну суму
    const finalAmount = totalAmount + deliveryFee;
    console.log(`💰 [SERVER] Фінальна сума: ${finalAmount}`);

    // Створюємо замовлення
    const orderData = {
      orderNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      deliveryAddress,
      deliveryTime: deliveryTime || undefined,
      deliveryNotes: deliveryNotes || undefined,
      paymentMethod,
      items,
      totalAmount,
      deliveryFee,
      finalAmount,
      status: 'pending',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      customerId: customerId || undefined
    };

    console.log('💾 [SERVER] Збереження в базу даних...');
    console.log('💾 Дані для збереження:', orderData);
    
    let order;
    try {
      order = await Order.create(orderData);
      console.log(`✅ [SERVER] Замовлення збережено в БД: ${orderNumber}`);
    } catch (dbError) {
      console.error('❌ [SERVER] Помилка збереження в БД:', dbError);
      console.error('❌ [SERVER] Деталі помилки:', dbError.message);
      console.error('❌ [SERVER] Код помилки:', dbError.code);
      console.error('❌ [SERVER] Стек помилки:', dbError.stack);
      
      if (dbError.code === 11000) {
        // Дублікат номера замовлення
        console.log('🔄 [SERVER] Дублікат номера, генеруємо новий...');
        orderData.orderNumber = `ORD${Date.now().toString().slice(-8)}R`;
        try {
          order = await Order.create(orderData);
          console.log(`✅ [SERVER] Замовлення збережено з новим номером: ${orderData.orderNumber}`);
        } catch (retryError) {
          console.error('❌ [SERVER] Помилка при повторній спробі:', retryError);
          return res.status(500).json({
            success: false,
            error: 'Помилка при створенні замовлення'
          });
        }
      } else {
        return res.status(500).json({
          success: false,
          error: 'Помилка бази даних',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        });
      }
    }

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

    let query = {};
    
    // Шукаємо за userId або email
    if (userId) {
      query.customerId = userId;
    } else if (email) {
      query.customerEmail = email;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Необхідно вказати userId або email'
      });
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 });

    console.log(`✅ Знайдено ${orders.length} замовлень`);

    res.json({
      success: true,
      data: orders
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

    const order = await Order.findOne({ 
      $or: [
        { _id: id },
        { orderNumber: id }
      ]
    });

    if (!order) {
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

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Замовлення не знайдено'
      });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    console.log(`✅ Статус замовлення ${order.orderNumber} оновлено на: ${status}`);

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