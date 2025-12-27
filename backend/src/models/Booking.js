const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false // Необов'язкове - може бути анонімне бронювання
  },
  userName: {
    type: String,
    required: [true, 'Ім\'я обов\'язкове'],
    trim: true
  },
  userEmail: {
    type: String,
    required: false,
    lowercase: true
  },
  userPhone: {
    type: String,
    required: [true, 'Телефон обов\'язковий'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Дата обов\'язкова']
  },
  time: {
    type: String,
    required: [true, 'Час обов\'язковий']
  },
  guests: {
    type: Number,
    required: [true, 'Кількість гостей обов\'язкова'],
    min: [1, 'Мінімум 1 гість'],
    max: [20, 'Максимум 20 гостей']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;