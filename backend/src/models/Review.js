const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'ID користувача обов\'язковий'],
  },
  userName: {
    type: String,
    required: [true, 'Ім\'я користувача обов\'язкове'],
  },
  userEmail: {
    type: String,
    required: [true, 'Email користувача обов\'язковий'],
    match: [/.+@.+\..+/, 'Будь ласка, введіть правильний email']
  },
  dishId: {
    type: String,
    required: [true, 'ID страви обов\'язковий'],
  },
  dishName: {
    type: String,
    required: [true, 'Назва страви обов\'язкова'],
  },
  rating: {
    type: Number,
    required: [true, 'Рейтинг обов\'язковий'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Коментар обов\'язковий'],
    minlength: [3, 'Коментар має містити мінімум 3 символи'],
    maxlength: [1000, 'Коментар не може перевищувати 1000 символів'],
  },
  // Залишаємо date для зворотної сумісності
  date: {
    type: Date,
    default: Date.now,
  },
  // Додаємо createdAt для сортування в контролері
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Додаємо updatedAt для оновлення
  updatedAt: {
    type: Date,
    default: Date.now,
  }
}, {
  // Автоматично оновлюємо updatedAt при змінах
  timestamps: { 
    createdAt: 'createdAt', 
    updatedAt: 'updatedAt' 
  }
});

// Middleware: оновлюємо date при створенні
reviewSchema.pre('save', function(next) {
  if (this.isNew) {
    this.date = this.createdAt;
  }
  next();
});

// Індекси для швидкого пошуку
reviewSchema.index({ dishId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ date: -1 }); // для зворотної сумісності

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;