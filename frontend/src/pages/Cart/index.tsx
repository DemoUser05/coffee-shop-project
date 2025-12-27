import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { removeFromCart, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Package, CreditCard, Clock, Home, ArrowLeft, Smile } from 'lucide-react';

// Функція для отримання іконки товару
const getItemIcon = (itemName: string) => {
  const name = itemName.toLowerCase();
  if (name.includes('кава') || name.includes('кофе') || name.includes('espresso') || name.includes('латте') || name.includes('капуччино')) {
    return '☕';
  }
  if (name.includes('чай') || name.includes('tea')) {
    return '🍵';
  }
  if (name.includes('торт') || name.includes('десерт') || name.includes('пирог') || name.includes('чізкейк')) {
    return '🍰';
  }
  if (name.includes('сніданок') || name.includes('салат') || name.includes('сандвіч')) {
    return '🥪';
  }
  return '🍽️';
};

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, totalItems } = useSelector((state: RootState) => state.cart);

  const handleQuantityChange = (id: number, change: number) => {
    const item = items.find(item => item.id === id);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity > 0) {
        dispatch(updateQuantity({ id, quantity: newQuantity }));
      } else {
        dispatch(removeFromCart(id));
      }
    }
  };

  const handleRemoveItem = (id: number) => {
    dispatch(removeFromCart(id));
  };

  const handleClearCart = () => {
    if (window.confirm('Ви впевнені, що хочете очистити кошик?')) {
      dispatch(clearCart());
    }
  };

  // Розрахунок вартості доставки
  const deliveryCost = totalAmount >= 200 ? 0 : 50;
  const totalToPay = totalAmount + deliveryCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Мобільна навігація */}
          <div className="md:hidden mb-6">
            <Link 
              to="/menu" 
              className="flex items-center text-coffee-dark text-sm mb-2"
            >
              <ArrowLeft size={16} className="mr-1" />
              Повернутися до меню
            </Link>
            <h1 className="text-2xl font-bold text-coffee-dark">Кошик</h1>
          </div>

          {/* Десктопний заголовок */}
          <div className="hidden md:block mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-coffee-dark">Кошик</h1>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 md:p-8 lg:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={32} className="text-gray-400 sm:w-10 sm:h-10 md:w-12 md:h-12" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Ваш кошик порожній</h2>
            <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
              Почніть свої покупки з нашого меню. У нас є чудова кава, свіжі десерти та смачні снеки.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link 
                to="/menu" 
                className="inline-flex items-center justify-center bg-coffee-dark text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-coffee transition-colors text-sm sm:text-base"
              >
                <ShoppingBag size={16} className="mr-1.5 sm:mr-2" />
                Перейти до меню
              </Link>
              <Link 
                to="/" 
                className="inline-flex items-center justify-center border border-coffee-dark text-coffee-dark px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                <Home size={16} className="mr-1.5 sm:mr-2" />
                На головну
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Мобільна навігація */}
      <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link 
            to="/menu" 
            className="flex items-center text-coffee-dark"
          >
            <ArrowLeft size={20} className="mr-1" />
            <span className="text-sm font-medium">До меню</span>
          </Link>
          <h1 className="text-lg font-bold text-coffee-dark">Кошик ({totalItems})</h1>
          <div className="w-10"></div> {/* Для балансу */}
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Десктопний заголовок */}
          <div className="hidden md:block mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-coffee-dark">
              Ваш кошик 
              <span className="text-coffee ml-3">
                ({totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товари' : 'товарів'})
              </span>
            </h1>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <div className="text-blue-500 mr-2 sm:mr-3 mt-0.5">💾</div>
                <div className="flex-1">
                  <p className="font-medium text-blue-800 text-sm sm:text-base">Ваш кошик зберігається автоматично</p>
                  <p className="text-blue-600 text-xs sm:text-sm mt-0.5">
                    Увійдіть в акаунт, щоб зберігати кошик між пристроями
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Основний контент з позиціонуванням */}
          <div className="relative">
            {/* Ліва колонка - товари */}
            <div className="lg:pr-[calc(33.333%+1rem)]">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Заголовки для десктопу */}
                <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 border-b">
                  <div className="col-span-5 font-medium text-gray-700">Товар</div>
                  <div className="col-span-2 font-medium text-gray-700">Ціна</div>
                  <div className="col-span-3 font-medium text-gray-700">Кількість</div>
                  <div className="col-span-2 font-medium text-gray-700">Сума</div>
                </div>
                
                {/* Товари */}
                {items.map((item) => (
                  <div key={item.id} className="p-3 sm:p-4 border-b last:border-b-0 hover:bg-gray-50/50 transition-colors">
                    {/* Мобільний вигляд */}
                    <div className="md:hidden">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-coffee-light to-coffee/20 rounded-lg flex items-center justify-center shadow flex-shrink-0">
                            <span className="font-bold text-coffee-dark text-xl sm:text-2xl">
                              {getItemIcon(item.name)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-coffee-dark truncate">{item.name}</h3>
                            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Свіже приготування</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
                          aria-label="Видалити"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="text-sm text-gray-600">Ціна за шт.</div>
                          <div className="font-bold text-base sm:text-lg">{item.price} грн</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Сума</div>
                          <div className="font-bold text-lg sm:text-xl text-coffee-dark">
                            {item.price * item.quantity} грн
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">Кількість</div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Зменшити кількість"
                            >
                              <Minus size={16} />
                            </button>
                            <div className="relative">
                              <span className="font-bold text-base sm:text-lg min-w-[50px] text-center block px-3 py-1.5 bg-gray-50 rounded-lg">
                                {item.quantity}
                              </span>
                            </div>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Збільшити кількість"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        
                        {item.quantity > 1 && (
                          <div className="text-green-600 text-xs sm:text-sm text-right">
                            Збережено<br />
                            {item.price * (item.quantity - 1)} грн
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Десктопний вигляд */}
                    <div className="hidden md:grid grid-cols-12 items-center gap-4 md:gap-0">
                      {/* Назва та зображення */}
                      <div className="col-span-5 flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-coffee-light to-coffee/20 rounded-lg flex items-center justify-center shadow">
                          <span className="font-bold text-coffee-dark text-2xl">
                            {getItemIcon(item.name)}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-bold text-lg text-coffee-dark">{item.name}</h3>
                          <p className="text-gray-500 text-sm mt-1">Свіже приготування • Гаряче сервірування</p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center mt-2 transition-colors"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Видалити
                          </button>
                        </div>
                      </div>
                      
                      {/* Ціна за одиницю */}
                      <div className="col-span-2">
                        <div className="text-center">
                          <span className="font-bold text-lg">{item.price} грн</span>
                          <div className="text-gray-500 text-sm">за шт.</div>
                        </div>
                      </div>
                      
                      {/* Кількість */}
                      <div className="col-span-3">
                        <div className="flex flex-col">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Зменшити кількість"
                            >
                              <Minus size={18} />
                            </button>
                            <div className="relative">
                              <span className="font-bold text-lg min-w-[70px] text-center block px-4 py-2 bg-gray-50 rounded-lg">
                                {item.quantity}
                              </span>
                            </div>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                              aria-label="Збільшити кількість"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                          <div className="text-center text-sm text-gray-500 mt-2">
                            {item.quantity} × {item.price} грн
                          </div>
                        </div>
                      </div>
                      
                      {/* Загальна сума за товар */}
                      <div className="col-span-2">
                        <div className="text-right">
                          <div className="font-bold text-xl text-coffee-dark">
                            {item.price * item.quantity} грн
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-green-600 text-sm">
                              Збережено {item.price * (item.quantity - 1)} грн
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Дії з кошиком */}
                <div className="p-3 sm:p-4 border-t bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                    <button
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-700 flex items-center transition-colors text-sm sm:text-base"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Очистити кошик
                    </button>
                    <Link 
                      to="/menu" 
                      className="text-coffee-dark hover:text-coffee flex items-center text-sm sm:text-base"
                    >
                      <Plus size={16} className="mr-2" />
                      Додати ще товари
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Права колонка - підсумки - АБСОЛЮТНЕ ПОЗИЦІОНУВАННЯ */}
            <div className="lg:absolute lg:right-0 lg:top-0 lg:w-1/3 lg:pl-6">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-coffee-dark border-b pb-3 sm:pb-4">
                  Підсумок замовлення
                </h2>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Товари ({totalItems} шт.)</span>
                    <span className="font-bold text-base sm:text-lg">{totalAmount} грн</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Доставка</span>
                    <span className={deliveryCost === 0 ? "text-green-600 font-bold text-sm sm:text-base" : "font-bold text-sm sm:text-base"}>
                      {deliveryCost === 0 ? "Безкоштовно" : "50 грн"}
                    </span>
                  </div>
                  
                  {totalAmount < 200 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-start">
                        <span className="text-yellow-500 mr-2">🎯</span>
                        <div className="text-xs sm:text-sm">
                          <p className="font-medium text-yellow-800">Додайте ще {200 - totalAmount} грн</p>
                          <p className="text-yellow-600">для безкоштовної доставки</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 sm:pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-base sm:text-lg">До сплати</span>
                      <span className="font-bold text-xl sm:text-2xl text-coffee-dark">
                        {totalToPay} грн
                      </span>
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/checkout"
                  className="block w-full bg-gradient-to-r from-coffee-dark to-coffee text-white py-3 sm:py-4 rounded-xl font-bold hover:shadow-lg transition-all mb-3 sm:mb-4 text-center text-base sm:text-lg"
                >
                  Перейти до оформлення
                </Link>
                
                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                  <div className="space-y-2.5 sm:space-y-3 text-sm text-gray-600">
                    <div className="flex items-center text-xs sm:text-sm">
                      <Package size={14} className="mr-2 sm:mr-3 text-coffee flex-shrink-0" />
                      <span>Безкоштовна доставка від 200 грн</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <CreditCard size={14} className="mr-2 sm:mr-3 text-coffee flex-shrink-0" />
                      <span>Оплата готівкою або карткою</span>
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <Clock size={14} className="mr-2 sm:mr-3 text-coffee flex-shrink-0" />
                      <span>Доставка за 30-45 хвилин</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 text-center">
                      Натискаючи "Оформити замовлення", ви погоджуєтесь з умовами доставки та оплати
                    </p>
                  </div>
                  
                  {/* Бонусна система */}
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Smile size={16} className="text-green-600 mr-2" />
                      <span className="font-medium text-green-800 text-sm sm:text-base">Бонусна система</span>
                    </div>
                    <p className="text-green-700 text-xs sm:text-sm">
                      Це замовлення принесе вам {Math.floor(totalAmount / 10)} бонусних балів
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;