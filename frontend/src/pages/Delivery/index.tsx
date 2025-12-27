import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Clock, MapPin, Phone, ShoppingBag, Calendar, User, MessageSquare } from "lucide-react";

const DeliveryPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    phone: "",
    address: "",
    orderDetails: "",
    deliveryTime: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 0) {
      if (value.length <= 3) {
        value = `+38${value}`;
      } else if (value.length <= 6) {
        value = `+38 (${value.slice(3, 6)})`;
      } else if (value.length <= 9) {
        value = `+38 (${value.slice(3, 6)}) ${value.slice(6, 9)}`;
      } else {
        value = `+38 (${value.slice(3, 6)}) ${value.slice(6, 9)} ${value.slice(9, 11)} ${value.slice(11, 13)}`;
      }
    }
    
    setFormData(prev => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валідація
    if (!formData.name.trim()) {
      alert("Будь ласка, введіть ваше ім'я");
      return;
    }
    
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      alert("Будь ласка, введіть коректний номер телефону");
      return;
    }
    
    if (!formData.address.trim()) {
      alert("Будь ласка, введіть адресу доставки");
      return;
    }
    
    if (!formData.orderDetails.trim()) {
      alert("Будь ласка, вкажіть що бажаєте замовити");
      return;
    }

    setIsSubmitting(true);

    try {
      // Тут буде запит до API
      console.log("📦 Дані замовлення доставки:", {
        ...formData,
        userEmail: user?.email,
        userId: user?.uid,
      });

      // Імітація запиту
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Показуємо повідомлення про успіх
      setSubmitSuccess(true);
      
      // Скидаємо форму
      setFormData({
        name: user?.displayName || "",
        phone: "",
        address: "",
        orderDetails: "",
        deliveryTime: "",
        notes: "",
      });

      // Ховаємо повідомлення через 5 секунд
      setTimeout(() => setSubmitSuccess(false), 5000);

    } catch (error) {
      console.error("❌ Помилка при оформленні замовлення:", error);
      alert("Помилка при оформленні замовлення. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { name: "Кава Американо", price: 45 },
    { name: "Капучино", price: 55 },
    { name: "Лате", price: 60 },
    { name: "Флет-вайт", price: 65 },
    { name: "Матча лате", price: 70 },
    { name: "Какао", price: 50 },
    { name: "Чай фруктовий", price: 45 },
    { name: "Круасан", price: 40 },
    { name: "Тірамісу", price: 75 },
    { name: "Чізкейк", price: 70 },
  ];

  const addMenuItem = (itemName: string) => {
    setFormData(prev => ({
      ...prev,
      orderDetails: prev.orderDetails ? `${prev.orderDetails}, ${itemName}` : itemName
    }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ліва колонка - Форма */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-coffee-dark mb-3">Доставка кави та десертів</h1>
              <p className="text-gray-600">
                Замовляйте улюблені напої та десерти з доставкою додому чи в офіс
              </p>
            </div>

            {/* Повідомлення про успіх */}
            {submitSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-green-800 font-medium">Замовлення успішно оформлено!</p>
                    <p className="text-green-700 text-sm mt-1">
                      Наш менеджер зв'яжеться з вами найближчим часом для підтвердження.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Особиста інформація */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-coffee-dark flex items-center">
                    <User size={20} className="mr-2" />
                    Особиста інформація
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ваше ім'я *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors"
                        placeholder="Введіть ваше ім'я"
                        required
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
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors"
                        placeholder="+38 (0__) ___ __ __"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Адреса доставки */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Адреса доставки *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors"
                    placeholder="Введіть повну адресу (вулиця, будинок, квартира)"
                    required
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Приклад: вул. Шевченка, 12Б, кв. 34
                  </p>
                </div>

                {/* Деталі замовлення */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ShoppingBag size={16} className="inline mr-2" />
                    Деталі замовлення *
                  </label>
                  <textarea
                    name="orderDetails"
                    value={formData.orderDetails}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors min-h-[120px]"
                    placeholder="Опишіть що бажаєте замовити (наприклад: 2 капучино, 1 тірамісу)"
                    required
                  />
                </div>

                {/* Час доставки */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock size={16} className="inline mr-2" />
                      Бажаний час доставки
                    </label>
                    <input
                      type="time"
                      name="deliveryTime"
                      value={formData.deliveryTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors"
                    />
                    <p className="text-gray-500 text-xs mt-2">
                      Якщо не вкажете, доставимо якнайшвидше
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare size={16} className="inline mr-2" />
                      Додаткові побажання
                    </label>
                    <input
                      type="text"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors"
                      placeholder="Наприклад: без цукру, додати в'язанку"
                    />
                  </div>
                </div>

                {/* Кнопка відправки */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-coffee-dark text-white py-4 rounded-lg font-semibold hover:bg-coffee transition-colors flex items-center justify-center ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Обробка замовлення...
                    </>
                  ) : (
                    "Замовити доставку"
                  )}
                </button>

                <p className="text-gray-500 text-sm text-center">
                  Натискаючи "Замовити доставку", ви погоджуєтесь з нашими умовами доставки
                </p>
              </form>
            </div>
          </div>

          {/* Права колонка - Меню та інформація */}
          <div className="space-y-8">
            {/* Популярні позиції */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-coffee-dark mb-4">Популярні позиції</h3>
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => addMenuItem(item.name)}
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-coffee-dark font-semibold mr-3">{item.price} грн</span>
                      <button
                        type="button"
                        className="w-8 h-8 flex items-center justify-center bg-coffee-light text-coffee-dark rounded-full hover:bg-coffee hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Натисніть на "+" щоб додати позицію до замовлення
                </p>
              </div>
            </div>

            {/* Інформація про доставку */}
            <div className="bg-gradient-to-br from-coffee-light to-coffee-dark text-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Умови доставки</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Мінімальне замовлення: <strong>150 грн</strong></span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Час доставки: <strong>30-60 хвилин</strong></span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Вартість доставки: <strong>50 грн</strong> (безкоштовно від 300 грн)</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Зони доставки: центр міста та прилеглі райони</span>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <h4 className="font-semibold mb-2">Графік роботи</h4>
                <p className="text-sm">Пн-Нд: 08:00 - 22:00</p>
                <p className="text-sm mt-2">Телефон: <strong>+380 (68) 123-45-67</strong></p>
              </div>
            </div>

            {/* Швидке замовлення для авторизованих */}
            {user && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-coffee-dark mb-4">Швидке замовлення</h3>
                <p className="text-gray-600 mb-4">
                  Ви авторизовані як <strong>{user.displayName || user.email}</strong>
                </p>
                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      name: user.displayName || "",
                      phone: "+38 (",
                    }));
                  }}
                  className="w-full bg-coffee-light text-coffee-dark py-3 rounded-lg font-medium hover:bg-coffee hover:text-white transition-colors"
                >
                  Заповнити мої дані
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPage;