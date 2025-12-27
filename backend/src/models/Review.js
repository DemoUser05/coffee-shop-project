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
    minlength: [10, 'Коментар має містити мінімум 10 символів'],
    maxlength: [500, 'Коментар не може перевищувати 500 символів'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Індекси для швидкого пошуку
reviewSchema.index({ dishId: 1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ date: -1 });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;