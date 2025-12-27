const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema({
  // Інформація про замовлення
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  finalAmount: {
    type: Number,
    required: true
  },
  
  // Інформація про замовника
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String
  },
  customerId: {
    type: String // Firebase UID
  },
  
  // Інформація про доставку
  deliveryAddress: {
    type: String,
    required: true
  },
  deliveryTime: {
    type: String
  },
  deliveryNotes: {
    type: String
  },
  
  // Спосіб оплати
  paymentMethod: {
    type: String,
    enum: ['cash', 'card'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  
  // Товари
  items: [cartItemSchema],
  
  // Додаткові поля
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Метод для генерації номера замовлення
orderSchema.statics.generateOrderNumber = async function() {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    let todayOrders;
    try {
      // Спрощений підрахунок - без фільтрації по даті
      todayOrders = await this.countDocuments({});
    } catch (countError) {
      console.error('❌ [MODEL] Помилка підрахунку замовлень:', countError);
      todayOrders = 0;
    }
    
    const sequence = (todayOrders + 1).toString().padStart(4, '0');
    const orderNumber = `ORD${year}${month}${day}${sequence}`;
    
    console.log(`✅ [MODEL] Згенеровано номер: ${orderNumber}`);
    return orderNumber;
  } catch (error) {
    console.error('❌ [MODEL] Помилка генерації номера:', error);
    // Резервний варіант
    return `ORD${Date.now().toString().slice(-8)}`;
  }
};

// Коментуємо middleware для тесту (тимчасово)
// orderSchema.pre('save', function(next) {
//   this.updatedAt = Date.now();
//   next();
// });

module.exports = mongoose.model('Order', orderSchema);