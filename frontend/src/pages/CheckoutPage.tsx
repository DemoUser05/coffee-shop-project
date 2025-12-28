import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { clearCart, updateQuantity, removeFromCart } from "../store/slices/cartSlice";
import { orderApi } from '../services/orderService';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  MapPin, 
  Phone, 
  User, 
  CreditCard, 
  Truck, 
  Clock,
  Shield,
  Coffee,
  Cake,
  ShoppingBag,
  AlertCircle,
  Home,
  Package,
  Trash2,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const cart = useSelector((state: RootState) => state.cart);
  
  const [activeTab, setActiveTab] = useState<'cart' | 'delivery' | 'payment'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  const [deliveryForm, setDeliveryForm] = useState({
    name: user?.displayName || "",
    phone: "",
    address: "",
    notes: "",
    deliveryTime: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [phoneError, setPhoneError] = useState<string>('');

  // Ефект для скидання стану після успішного замовлення
  useEffect(() => {
    if (submitSuccess) {
      // Автоматично скидаємо форму через 5 секунд
      const timer = setTimeout(() => {
        resetFormForNewOrder();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  // Функція для скидання форми
  const resetFormForNewOrder = () => {
    setDeliveryForm({
      name: user?.displayName || "",
      phone: "",
      address: "",
      notes: "",
      deliveryTime: "",
    });
    setPaymentMethod('cash');
    setPhoneError('');
    setActiveTab('cart');
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setOrderNumber('');
    setOrderDetails(null);
  };

  // Функція для форматування телефону
  const formatPhoneForServer = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.length === 10 && digits.startsWith('0')) {
      return '+380' + digits.slice(1);
    }
    
    if (digits.length === 12 && digits.startsWith('380')) {
      return '+' + digits;
    }
    
    return digits;
  };

  // Геттери для orderDetails
  const getOrderAmount = (order: any) => 
    order?.final_amount || order?.finalAmount || 0;

  const getDeliveryFee = (order: any) => 
    order?.delivery_fee || order?.deliveryFee || 0;

  const getOrderNumberFromData = (order: any) => 
    order?.order_number || order?.orderNumber || '';

  const handleQuantityChange = (itemId: number, change: number) => {
    const cartItem = (cart?.items || []).find(item => item.id === itemId);
    if (cartItem) {
      const newQuantity = cartItem.quantity + change;
      if (newQuantity > 0) {
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
      } else {
        dispatch(removeFromCart(itemId));
      }
    }
  };

  const handleClearCart = () => {
    if ((cart?.items || []).length === 0) return;
    
    if (window.confirm('Ви впевнені, що хочете очистити кошик?')) {
      dispatch(clearCart());
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryForm(prev => ({ ...prev, [name]: value }));
    
    if (name === 'phone') {
      setPhoneError('');
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    let digits = value.replace(/\D/g, '');
    digits = digits.slice(0, 10);
    
    let formatted = '';
    
    if (digits.length > 0) {
      if (!digits.startsWith('0')) {
        digits = '0' + digits;
      }
      digits = digits.slice(0, 10);
    }
    
    if (digits.length > 0) {
      formatted = digits.charAt(0);
    }
    if (digits.length > 1) {
      formatted += digits.slice(1, 3);
    }
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3, 6);
    }
    if (digits.length > 6) {
      formatted += ' ' + digits.slice(6, 8);
    }
    if (digits.length > 8) {
      formatted += ' ' + digits.slice(8, 10);
    }
    
    setDeliveryForm(prev => ({ ...prev, phone: formatted }));
    setPhoneError('');
  };

  const calculateDeliveryFee = () => {
    return (cart?.totalAmount || 0) >= 300 ? 0 : 50;
  };

  const calculateTotal = () => {
    return (cart?.totalAmount || 0) + calculateDeliveryFee();
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    
    // Тільки основна перевірка - 10 цифр та починається з 0
    if (digits.length !== 10 || !digits.startsWith('0')) {
      setPhoneError('Номер телефону повинен мати 10 цифр та починатися з 0');
      return false;
    }
    
    // Розширений список кодів операторів (додано код 076)
    const operatorCodes = [
      '050', '066', '095', '099', // Vodafone
      '063', '073', '093', // Lifecell
      '067', '068', '096', '097', '098', // Kyivstar
      '039', // Kyivstar (старий)
      '091', '092', '094', // Intertelecom
      '070', // Телетех
      '080', // Пезо
      '089', // ТелеМост
      '076', '077', '078' // ТриМоб
    ];
    
    const code = digits.slice(0, 3);
    
    if (!operatorCodes.includes(code)) {
      setPhoneError(`Код оператора ${code} не знайдено. Використовуйте номер українського оператора`);
      return false;
    }
    
    setPhoneError('');
    return true;
  };

  const validateForm = () => {
    console.log('🔄 Перевірка форми...');
    console.log('Кількість товарів:', (cart?.items || []).length);
    console.log('Ім\'я:', deliveryForm.name);
    console.log('Телефон:', deliveryForm.phone);
    console.log('Адреса:', deliveryForm.address);
    
    if ((cart?.items || []).length === 0) {
      alert("Кошик порожній. Додайте товари до кошика.");
      setActiveTab('cart');
      return false;
    }
    
    if (!deliveryForm.name.trim()) {
      alert("Будь ласка, введіть ваше ім'я");
      return false;
    }
    
    if (!validatePhone(deliveryForm.phone)) {
      return false;
    }
    
    if (!deliveryForm.address.trim()) {
      alert("Будь ласка, введіть адресу доставки");
      return false;
    }
    
    return true;
  };

  const handleSubmitOrder = async () => {
    console.log('✅ Кнопка "Підтвердити замовлення" натиснута');
    
    // Перевірка порожнього кошика
    if ((cart?.items || []).length === 0) {
      alert("Кошик порожній. Додайте товари до кошика.");
      setActiveTab('cart');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Валідація не пройшла');
      return;
    }
    
    setIsSubmitting(true);
    console.log('🔄 Початок відправки замовлення...');

    try {
      const fullPhoneNumber = formatPhoneForServer(deliveryForm.phone);
      console.log('📞 Форматований телефон:', fullPhoneNumber);
      
      const orderData = {
        customerName: deliveryForm.name,
        customerPhone: fullPhoneNumber,
        customerEmail: user?.email || undefined,
        deliveryAddress: deliveryForm.address,
        deliveryTime: deliveryForm.deliveryTime || undefined,
        deliveryNotes: deliveryForm.notes || undefined,
        paymentMethod: paymentMethod,
        items: (cart?.items || []).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || undefined
        })),
        totalAmount: cart?.totalAmount || 0,
        deliveryFee: calculateDeliveryFee(),
        customerId: user?.uid || undefined
      };

      console.log("📦 Дані для відправки:", orderData);

      const response = await orderApi.create(orderData);
      
      if (response.success && response.data) {
        // Нормалізуємо дані для відображення
        const normalizedData = {
          ...response.data,
          // Додаємо camelCase версії для зручності
          finalAmount: response.data.final_amount || response.data.finalAmount,
          deliveryFee: response.data.delivery_fee || response.data.deliveryFee,
          orderNumber: response.data.order_number || response.data.orderNumber,
          totalAmount: response.data.total_amount || response.data.totalAmount,
          paymentMethod: response.data.payment_method || response.data.paymentMethod,
          deliveryAddress: response.data.delivery_address || response.data.deliveryAddress,
          customerName: response.data.customer_name || response.data.customerName,
          customerPhone: response.data.customer_phone || response.data.customerPhone,
          createdAt: response.data.created_at || response.data.createdAt,
        };
        
        const newOrderNumber = getOrderNumberFromData(normalizedData) || 'ORD' + Date.now().toString().slice(-6);
        setOrderNumber(newOrderNumber);
        setOrderDetails(normalizedData);
        
        // Показуємо успіх
        setSubmitSuccess(true);
        
        // ОЧИЩАЄМО КОШИК ПІСЛЯ УСПІШНОГО ЗАМОВЛЕННЯ
        dispatch(clearCart());
        
        console.log('🎉 Замовлення успішно створено! Номер:', newOrderNumber);
        console.log('🛒 Кошик очищено');
        
      } else {
        console.error('❌ Помилка від сервера:', response.error);
        alert(`❌ ${response.error || 'Помилка при оформленні замовлення'}`);
      }

    } catch (error: any) {
      console.error("❌ Помилка при оформленні замовлення:", error);
      
      if (error.response?.data?.error?.toLowerCase().includes('phone')) {
        alert('Помилка: невірний формат телефону');
      } else if (error.response?.data?.error) {
        alert(`❌ Помилка сервера: ${error.response.data.error}`);
      } else if (error.message) {
        alert(`❌ Помилка: ${error.message}`);
      } else {
        alert("❌ Помилка при оформленні замовлення. Спробуйте пізніше.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.toLowerCase().includes('кава') || name.toLowerCase().includes('латте') || name.toLowerCase().includes('капуч')) {
      return <Coffee size={16} className="text-coffee" />;
    } else if (name.toLowerCase().includes('торт') || name.toLowerCase().includes('десерт') || name.toLowerCase().includes('чіз')) {
      return <Cake size={16} className="text-pink-500" />;
    } else if (name.toLowerCase().includes('чай')) {
      return <Coffee size={16} className="text-green-500" />;
    } else {
      return <ShoppingBag size={16} className="text-gray-500" />;
    }
  };

  const fillUserData = () => {
    if (user) {
      setDeliveryForm(prev => ({
        ...prev,
        name: user.displayName || prev.name,
        phone: prev.phone || '0',
      }));
    }
  };

  // Захист від undefined
  const cartItems = cart?.items || [];
  const cartTotalAmount = cart?.totalAmount || 0;
  const cartTotalItems = cart?.totalItems || 0;

  // Сторінка успіху
  if (submitSuccess) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Замовлення оформлено!</h2>
            
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-2">Ваше замовлення</p>
              <p className="text-3xl font-bold text-coffee-dark mb-4">№{orderNumber}</p>
              <p className="text-gray-600 mb-4">
                успішно оформлено. Наш менеджер зв'яжеться з вами найближчим часом.
              </p>
              
              {orderDetails && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Сума замовлення:</span>
                    <span className="font-semibold">
                      {getOrderAmount(orderDetails)} грн
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Доставка:</span>
                    <span className={`font-semibold ${getDeliveryFee(orderDetails) === 0 ? 'text-green-600' : ''}`}>
                      {getDeliveryFee(orderDetails) === 0 ? 'Безкоштовно' : `${getDeliveryFee(orderDetails)} грн`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Статус:</span>
                    <span className="font-semibold text-green-600">В обробці</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Clock size={20} className="text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-800">Час доставки</p>
                  <p className="text-sm text-green-700">30-60 хвилин</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  resetFormForNewOrder();
                  navigate('/menu');
                }}
                className="w-full bg-coffee-dark text-white py-3 rounded-lg font-semibold hover:bg-coffee transition-colors flex items-center justify-center"
              >
                <Coffee size={20} className="mr-2" />
                Повернутися до меню
              </button>
              
              <button
                onClick={() => {
                  resetFormForNewOrder();
                  navigate('/profile/orders');
                }}
                className="w-full border border-coffee-dark text-coffee-dark py-3 rounded-lg font-semibold hover:bg-coffee-light transition-colors flex items-center justify-center"
              >
                <Package size={20} className="mr-2" />
                Переглянути мої замовлення
              </button>
              
              <button
                onClick={resetFormForNewOrder}
                className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <ShoppingCart size={20} className="mr-2" />
                Зробити нове замовлення
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full text-gray-600 py-2 text-sm hover:text-gray-800 transition-colors flex items-center justify-center"
              >
                <Home size={16} className="mr-2" />
                На головну
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Форма автоматично скинеться через 5 секунд
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/menu')}
            className="flex items-center text-coffee-dark hover:text-coffee mb-4"
          >
            <X size={20} className="mr-2" />
            Повернутися до меню
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-coffee-dark mb-2">Оформлення замовлення</h1>
          <p className="text-gray-600">Завершіть ваше замовлення в три прості кроки</p>
        </div>

        {/* Кнопка автозаповнення для авторизованих користувачів */}
        {user && activeTab === 'delivery' && (
          <div className="mb-6">
            <button
              onClick={fillUserData}
              className="inline-flex items-center bg-coffee-light text-coffee-dark px-4 py-2 rounded-lg hover:bg-coffee hover:text-white transition-colors"
            >
              <User size={16} className="mr-2" />
              Заповнити мої дані
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Ви авторизовані як {user.displayName || user.email}
            </p>
          </div>
        )}

        {/* Кроки */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex-1 text-center py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'cart' 
                  ? 'border-coffee-dark text-coffee-dark' 
                  : 'border-gray-300 text-gray-500 hover:text-gray-700'
              }`}
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-center">
                <ShoppingCart size={20} className="mr-2" />
                Кошик
                {cartItems.length > 0 && (
                  <span className="ml-2 bg-coffee text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => cartItems.length > 0 && setActiveTab('delivery')}
              className={`flex-1 text-center py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'delivery' 
                  ? 'border-coffee-dark text-coffee-dark' 
                  : cartItems.length > 0 
                    ? 'border-gray-300 text-gray-500 hover:text-gray-700'
                    : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
              disabled={cartItems.length === 0 || isSubmitting}
            >
              <div className="flex items-center justify-center">
                <Truck size={20} className="mr-2" />
                Доставка
              </div>
            </button>
            
            <button
              onClick={() => cartItems.length > 0 && setActiveTab('payment')}
              className={`flex-1 text-center py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'payment' 
                  ? 'border-coffee-dark text-coffee-dark' 
                  : cartItems.length > 0 
                    ? 'border-gray-300 text-gray-500 hover:text-gray-700'
                    : 'border-gray-300 text-gray-300 cursor-not-allowed'
              }`}
              disabled={cartItems.length === 0 || isSubmitting}
            >
              <div className="flex items-center justify-center">
                <CreditCard size={20} className="mr-2" />
                Оплата
              </div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ліва колонка - Вміст */}
          <div className="lg:col-span-2">
            {activeTab === 'cart' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-coffee-dark flex items-center">
                    <ShoppingCart size={24} className="mr-3" />
                    Ваш кошик
                    {cartItems.length > 0 && (
                      <span className="ml-2 bg-coffee-dark text-white text-sm rounded-full px-2 py-1">
                        {cartTotalItems} шт.
                      </span>
                    )}
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                      Очистити кошик
                    </button>
                  )}
                </div>
                
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Кошик порожній</h3>
                    <p className="text-gray-500 mb-6">Додайте товари з меню до кошика</p>
                    <button
                      onClick={() => navigate('/menu')}
                      className="inline-block bg-coffee-dark text-white px-6 py-3 rounded-lg hover:bg-coffee transition-colors"
                    >
                      Перейти до меню
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center border-b pb-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <div className="flex items-center mb-1">
                            {getCategoryIcon(item.name)}
                            <h4 className="font-semibold text-gray-800 ml-2">{item.name}</h4>
                          </div>
                          <p className="text-coffee-dark font-bold">{item.price} грн</p>
                          <p className="text-sm text-gray-500">Буде видалено після оформлення замовлення</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-semibold w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded disabled:opacity-50"
                              disabled={isSubmitting}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="font-bold text-coffee-dark text-lg min-w-[80px] text-right">
                            {item.price * item.quantity} грн
                          </span>
                          <button
                            onClick={() => dispatch(removeFromCart(item.id))}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                            disabled={isSubmitting}
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 flex justify-between">
                      <button
                        onClick={() => navigate('/menu')}
                        className="border border-coffee-dark text-coffee-dark px-6 py-2 rounded-lg font-medium hover:bg-coffee-light transition-colors"
                      >
                        Додати ще товари
                      </button>
                      <button
                        onClick={() => setActiveTab('delivery')}
                        className="bg-coffee-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-coffee transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Завантаження...' : 'Продовжити до доставки'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-coffee-dark mb-6 flex items-center">
                  <Truck size={24} className="mr-3" />
                  Дані для доставки
                </h2>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="inline mr-2" />
                        Ваше ім'я *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={deliveryForm.name}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Введіть ваше ім'я"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={deliveryForm.phone}
                        onChange={handlePhoneInput}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-coffee outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-coffee'
                        }`}
                        placeholder="0__ ___ __ __"
                        required
                        disabled={isSubmitting}
                      />
                      {phoneError ? (
                        <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                      ) : (
                        <p className="text-gray-500 text-xs mt-1">Формат: 097 765 12 35</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} className="inline mr-2" />
                      Адреса доставки *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={deliveryForm.address}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Введіть повну адресу (вулиця, будинок, квартира)"
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Приклад: вул. Шевченка, 12Б, кв. 34
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-2" />
                        Бажаний час доставки
                      </label>
                      <input
                        type="time"
                        name="deliveryTime"
                        value={deliveryForm.deliveryTime}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        Якщо не вкажете, доставимо якнайшвидше
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <AlertCircle size={16} className="inline mr-2" />
                        Додаткові побажання
                      </label>
                      <input
                        type="text"
                        name="notes"
                        value={deliveryForm.notes}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Наприклад: без цукру, додати в'язанку"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('cart')}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      Назад до кошика
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('payment')}
                      className="bg-coffee-dark text-white px-6 py-2 rounded-lg font-semibold hover:bg-coffee transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      Продовжити до оплати
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-coffee-dark mb-6 flex items-center">
                  <CreditCard size={24} className="mr-3" />
                  Спосіб оплати
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-3">
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        paymentMethod === 'cash' 
                          ? 'border-coffee-dark bg-coffee-light' 
                          : 'border-gray-300 hover:border-coffee'
                      }`}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === 'cash' 
                            ? 'border-coffee-dark bg-coffee-dark' 
                            : 'border-gray-400'
                        }`}>
                          {paymentMethod === 'cash' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">Готівкою кур'єру</p>
                          <p className="text-sm text-gray-600">Оплата при отриманні замовлення</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        paymentMethod === 'card' 
                          ? 'border-coffee-dark bg-coffee-light' 
                          : 'border-gray-300 hover:border-coffee'
                      }`}
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center">
                        <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                          paymentMethod === 'card' 
                            ? 'border-coffee-dark bg-coffee-dark' 
                            : 'border-gray-400'
                        }`}>
                          {paymentMethod === 'card' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">Карткою</p>
                          <p className="text-sm text-gray-600">Безпечна оплата карткою</p>
                        </div>
                      </div>
                    </button>
                  </div>
                  
                  
                  <div className="flex justify-between pt-6">
                    <button
                      onClick={() => setActiveTab('delivery')}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                    >
                      Назад до доставки
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting || cartItems.length === 0}
                      className={`bg-coffee-dark text-white px-8 py-2 rounded-lg font-semibold hover:bg-coffee transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSubmitting ? 'opacity-70' : ''
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Обробка замовлення...
                        </>
                      ) : (
                        'Підтвердити замовлення'
                      )}
                    </button>
                  </div>
                  
                  {/* Інформація про стан */}
                  {isSubmitting && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 text-center">
                        Триває обробка замовлення. Будь ласка, зачекайте...
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Права колонка - Підсумок */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold text-coffee-dark mb-6">Підсумок замовлення</h3>
              
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600">Кошик порожній</p>
                  <p className="text-sm text-gray-500 mt-2">Додайте товари з меню</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Товари ({cartTotalItems} шт.)</span>
                      <span className="font-semibold">{cartTotalAmount} грн</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Доставка</span>
                      <span className={`font-semibold ${calculateDeliveryFee() === 0 ? 'text-green-600' : ''}`}>
                        {calculateDeliveryFee() === 0 ? 'Безкоштовно' : `${calculateDeliveryFee()} грн`}
                      </span>
                    </div>
                    
                    {calculateDeliveryFee() > 0 && cartTotalAmount < 300 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          До безкоштовної доставки залишилось {300 - cartTotalAmount} грн
                        </p>
                      </div>
                    )}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">Всього до сплати</span>
                        <span className="text-2xl font-bold text-coffee-dark">{calculateTotal()} грн</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Інформація про доставку</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-coffee rounded-full mt-1.5 mr-2"></div>
                        <span>Мінімальне замовлення: <strong>150 грн</strong></span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-coffee rounded-full mt-1.5 mr-2"></div>
                        <span>Час доставки: <strong>30-60 хвилин</strong></span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-1.5 h-1.5 bg-coffee rounded-full mt-1.5 mr-2"></div>
                        <span>Зони доставки: центр міста та прилеглі райони</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Допомога */}
            <div className="bg-coffee-light rounded-2xl p-6">
              <h4 className="font-semibold text-coffee-dark mb-3">Потрібна допомога?</h4>
              <p className="text-sm text-coffee-dark mb-4">
                Якщо у вас виникли питання щодо замовлення, зв'яжіться з нами:
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-medium">📞 +380 (68) 123-45-67</p>
                <p className="font-medium">✉️ support@coffee-shop.com</p>
              </div>
            </div>
            
            {/* Інформація про збереження */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center mb-3">
                <Shield size={20} className="text-blue-600 mr-3" />
                <h4 className="font-semibold text-blue-800">Інформація</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
                  <span>Кошик зберігається автоматично</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
                  <span>Очищається після успішного замовлення</span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2"></div>
                  <span>Можна продовжити замовлення пізніше</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;