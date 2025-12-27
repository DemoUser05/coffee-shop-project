// backend/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const reviewRoutes = require('./src/routes/reviewRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const orderRoutes = require('./src/routes/orderRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Логування всіх запитів
app.use((req, res, next) => {
  console.log(`📥 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Підключення до MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee_shop';
console.log('🔍 Connecting to MongoDB...');

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB підключено до Atlas'))
.catch(err => console.error('❌ Помилка підключення до MongoDB:', err.message));


// Додаємо тестовий маршрут перед підключенням reviewRoutes
app.get('/api/test', (req, res) => {
  console.log('✅ Тестовий маршрут викликаний');
  res.json({ message: 'Test route works!' });
});

// Маршрути для відгуків
console.log('🔧 Підключаємо reviewRoutes...');
app.use('/api/reviews', reviewRoutes);

app.use('/api/bookings', bookingRoutes);
app.use('/api/orders', orderRoutes);


// Старт сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
  console.log(`🔗 Доступні маршрути:`);
  console.log(`   GET  /api/test`);
  console.log(`   GET  /api/reviews/dish/:dishId`);
  console.log(`   POST /api/reviews`);
});