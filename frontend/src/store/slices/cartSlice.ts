// frontend/src/store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  userId: string | null;
}

// Функція для отримання ключа localStorage
const getUserCartKey = (userId: string | null): string => {
  return userId ? `cart_${userId}` : 'anonymous_cart';
};

// Завантажити кошик для користувача
const loadCartFromStorage = (userId: string | null): CartState => {
  try {
    const cartKey = getUserCartKey(userId);
    const savedCart = localStorage.getItem(cartKey);
    
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      
      if (parsed && parsed.items && Array.isArray(parsed.items)) {
        return {
          items: parsed.items || [],
          totalAmount: parsed.totalAmount || 0,
          totalItems: parsed.totalItems || 0,
          userId,
        };
      }
      
      if (Array.isArray(parsed)) {
        const items = parsed;
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        
        return { items, totalAmount, totalItems, userId };
      }
    }
  } catch (error) {
    console.error('❌ Помилка завантаження кошика:', error);
  }
  
  return { items: [], totalAmount: 0, totalItems: 0, userId };
};

// Зберегти кошик
const saveCartToStorage = (state: CartState) => {
  try {
    const cartKey = getUserCartKey(state.userId);
    const cartData = {
      items: state.items,
      totalAmount: state.totalAmount,
      totalItems: state.totalItems,
    };
    localStorage.setItem(cartKey, JSON.stringify(cartData));
  } catch (error) {
    console.error('❌ Помилка збереження кошика:', error);
  }
};

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  userId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Ініціалізувати кошик для користувача
    initCart: (state, action: PayloadAction<string | null>) => {
      const userId = action.payload;
      const loadedCart = loadCartFromStorage(userId);
      
      state.items = loadedCart.items;
      state.totalAmount = loadedCart.totalAmount;
      state.totalItems = loadedCart.totalItems;
      state.userId = userId;
    },
    
    // СИНХРОНІЗАЦІЯ при зміні користувача
    syncCartOnAuthChange: (state, action: PayloadAction<{
      oldUserId: string | null;
      newUserId: string | null;
    }>) => {
      const { oldUserId, newUserId } = action.payload;
      
      console.log(`🔄 Синхронізація: ${oldUserId || 'anonymous'} → ${newUserId || 'anonymous'}`);
      
      // ЗАВЖДИ очищаємо анонімний кошик при будь-якій зміні
      if (oldUserId === null) {
        console.log('🧹 Очищаємо анонімний кошик');
        localStorage.removeItem('anonymous_cart');
      }
      
      // Якщо був автентифікований користувач - зберегти його кошик
      if (oldUserId && oldUserId !== newUserId) {
        saveCartToStorage({
          items: state.items,
          totalAmount: state.totalAmount,
          totalItems: state.totalItems,
          userId: oldUserId,
        });
      }
      
      // Завантажити кошик для нового користувача
      const newUserCart = loadCartFromStorage(newUserId);
      
      // Завжди показуємо кошик нового користувача
      state.items = newUserCart.items;
      state.totalAmount = newUserCart.totalAmount;
      state.totalItems = newUserCart.totalItems;
      state.userId = newUserId;
      
      console.log(`✅ Завантажено кошик для ${newUserId || 'anonymous'}`);
    },
    
    // Додати товар
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(item => item.id === action.payload.id);
      
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      
      saveCartToStorage(state);
    },
    
    // Видалити товар
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      
      saveCartToStorage(state);
    },
    
    // Оновити кількість
    updateQuantity: (state, action: PayloadAction<{ id: number; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        
        if (item.quantity === 0) {
          state.items = state.items.filter(item => item.id !== action.payload.id);
        }
      }
      
      state.totalAmount = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
      
      saveCartToStorage(state);
    },
    
    // Очистити поточний кошик
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
      
      // Видалити з localStorage
      if (state.userId !== null) {
        localStorage.removeItem(getUserCartKey(state.userId));
      } else {
        localStorage.removeItem('anonymous_cart');
      }
    },
    
    // Очистити ВСІ кошики (для адміна/тесту)
    clearAllCarts: () => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cart_') || key === 'anonymous_cart') {
          localStorage.removeItem(key);
        }
      });
      
      return { items: [], totalAmount: 0, totalItems: 0, userId: null };
    }
  },
});

export const { 
  initCart, 
  syncCartOnAuthChange,
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  clearAllCarts 
} = cartSlice.actions;

export default cartSlice.reducer;