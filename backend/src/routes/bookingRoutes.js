const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Публічні маршрути (доступні для всіх)
router.post('/', bookingController.createBooking);
router.get('/user/:email', bookingController.getUserBookingsByEmail);
router.put('/:id/cancel', bookingController.cancelBooking); // Скасування доступне всім

// Захищені маршрути (тільки для авторизованих)
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.get('/recent', protect, bookingController.getRecentBookings);

// Адмін маршрути
router.get('/admin/all', protect, admin, bookingController.getAllBookings);
router.put('/admin/:id/status', protect, admin, bookingController.updateBookingStatus);
router.delete('/admin/:id', protect, admin, bookingController.deleteBooking);

module.exports = router;