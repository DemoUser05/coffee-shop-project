const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Базовий маршрут для перевірки
router.get('/', (req, res) => {
  res.json({ 
    message: 'Reviews API v1.0 (Supabase)',
    endpoints: [
      'GET /all - Всі відгуки',
      'GET /dish/:dishId - Відгуки для страви',
      'GET /user/:userId - Відгуки користувача',
      'POST / - Створити відгук',
      'PUT /:id - Оновити відгук',
      'DELETE /:id - Видалити відгук'
    ]
  });
});

// Public routes
router.get('/all', reviewController.getAllReviews);
router.get('/dish/:dishId', reviewController.getDishReviews);

// Protected routes (потрібна авторизація)
router.get('/user/:userId', protect, reviewController.getUserReviews);
router.post('/', protect, reviewController.createReview);
router.put('/:id', protect, reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;