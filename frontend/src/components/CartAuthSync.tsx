// frontend/src/components/CartAuthSync.tsx
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { initCart, syncCartOnAuthChange } from '../store/slices/cartSlice';

const CartAuthSync: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userId: currentCartUserId } = useSelector((state: RootState) => state.cart);
  
  // Зберігаємо попередній userId
  const previousUserIdRef = useRef<string | null>(null);

  // Ефект 1: Ініціалізація при завантаженні додатка
  useEffect(() => {
    // Завантажити auth з localStorage
    const savedAuth = localStorage.getItem('authState');
    let initialUserId = null;
    
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        initialUserId = parsed.user?.uid || null;
      } catch (error) {
        console.error('Помилка парсингу authState:', error);
      }
    }
    
    previousUserIdRef.current = initialUserId;
    dispatch(initCart(initialUserId));
    
    console.log('🛒 Ініціалізовано кошик для:', initialUserId || 'anonymous');
  }, [dispatch]);

  // Ефект 2: Основна логіка синхронізації
  useEffect(() => {
    const newUserId = user?.uid || null;
    
    // Якщо користувач змінився
    if (previousUserIdRef.current !== newUserId) {
      console.log(`🔄 Зміна користувача: ${previousUserIdRef.current} → ${newUserId}`);
      
      // Викликаємо синхронізацію кошика
      dispatch(syncCartOnAuthChange({
        oldUserId: previousUserIdRef.current,
        newUserId: newUserId
      }));
      
      // Оновлюємо референс
      previousUserIdRef.current = newUserId;
    }
  }, [user, dispatch]);

  // Ефект 3: Очищення анонімного кошика при закритті вкладки/сайту
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Якщо поточний користувач - анонімний, очищаємо його кошик
      if (!user) {
        console.log('🧹 Очищаємо анонімний кошик при закритті');
        localStorage.removeItem('anonymous_cart');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  // Ефект 4: Синхронізація між вкладками
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;
      
      const currentUserId = user?.uid || null;
      
      // Якщо змінився кошик поточного користувача
      if (e.key === 'anonymous_cart' || e.key.startsWith('cart_')) {
        const isCurrentUserCart = 
          (!currentUserId && e.key === 'anonymous_cart') ||
          (currentUserId && e.key === `cart_${currentUserId}`);
        
        if (isCurrentUserCart) {
          console.log(`🔄 Оновлення кошика з іншої вкладки`);
          dispatch(initCart(currentUserId));
        }
      }
      
      // Якщо змінилася авторизація
      if (e.key === 'authState') {
        console.log(`🔄 Auth змінилося в іншій вкладці`);
        // Перезавантажуємо сторінку для синхронізації
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, dispatch]);

  return null;
};

export default CartAuthSync;