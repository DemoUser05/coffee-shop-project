const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Публічні маршрути
router.post('/', orderController.createOrder);
router.get('/user', orderController.getUserOrders);

// Маршрути, що потребують автентифікації
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);

module.exports = router;