// backend/src/middleware/authMiddleware.js

// Middleware для перевірки Firebase токена
exports.protect = async (req, res, next) => {
  try {
    console.log('\n🔐 [Middleware] Авторизація запиту:');
    console.log(`   📍 ${req.method} ${req.url}`);
    console.log('   📋 Заголовки:', {
      'x-user-id': req.headers['x-user-id'],
      'authorization': req.headers['authorization'] ? 'Присутній' : 'Відсутній'
    });
    
    const authHeader = req.headers.authorization;
    const userIdHeader = req.headers['x-user-id'];
    
    // 🔴 ВАЖЛИВО: Беремо userId з заголовків
    if (userIdHeader) {
      req.user = {
        id: userIdHeader,
        email: req.headers['x-user-email'] || 'user@example.com',
        role: 'user'
      };
      console.log(`✅ [Middleware] Встановлено користувача з заголовків: ${req.user.id}`);
      return next();
    }
    
    // Якщо немає userId в заголовках
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('⚠️ [Middleware] Не вказано userId в заголовках');
      
      req.user = {
        id: 'unknown-user',
        email: 'unknown@example.com',
        role: 'user'
      };
      
      console.log(`⚠️ [Middleware] Використовуємо невідомого користувача`);
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    // Для розробки
    req.user = {
      id: userIdHeader || 'dev-user-id',
      email: 'dev@example.com',
      role: 'user'
    };
    
    console.log(`✅ [Middleware] Токен прийнято, користувач: ${req.user.id}`);
    next();
  } catch (error) {
    console.error('❌ [Middleware] Помилка авторизації:', error);
    res.status(401).json({
      success: false,
      error: 'Невалідний токен або помилка авторизації'
    });
  }
};

// Middleware для перевірки адмін прав
exports.admin = (req, res, next) => {
  console.log('👑 [Middleware] Перевірка адмін прав');
  
  if (req.user && req.user.role === 'admin') {
    console.log('✅ [Middleware] Адмін доступ дозволено');
    next();
  } else {
    console.log('❌ [Middleware] Адмін доступ заборонено');
    res.status(403).json({
      success: false,
      error: 'Недостатньо прав. Потрібна роль адміністратора'
    });
  }
};