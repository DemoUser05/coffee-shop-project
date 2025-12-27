import React, { useState } from "react";
import { bookingApi } from "../../services/bookingService";

const BookingPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '+380',
    date: '',
    time: '',
    guests: '2',
    email: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Обробник для телефону з маскою
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Видаляємо все крім цифр
    const digits = value.replace(/[^\d]/g, '');
    
    // Якщо номер починається не з 380, ставимо 380
    let phoneDigits = digits;
    if (!phoneDigits.startsWith('380') && phoneDigits.length > 0) {
      phoneDigits = '380' + phoneDigits.replace(/^380/, '');
    }
    
    // Обмежуємо до 12 цифр (380 + 9 цифр = 12)
    phoneDigits = phoneDigits.slice(0, 12);
    
    // Форматуємо: +380 (XX) XXX XX XX
    let formatted = '+380';
    if (phoneDigits.length > 3) {
      const part1 = phoneDigits.slice(3, 5);
      if (part1) formatted += ` (${part1}`;
    }
    if (phoneDigits.length > 5) {
      const part2 = phoneDigits.slice(5, 8);
      if (part2) formatted += `) ${part2}`;
    }
    if (phoneDigits.length > 8) {
      const part3 = phoneDigits.slice(8, 10);
      if (part3) formatted += ` ${part3}`;
    }
    if (phoneDigits.length > 10) {
      const part4 = phoneDigits.slice(10, 12);
      if (part4) formatted += ` ${part4}`;
    }
    
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }));
  };

  // Для інших полів
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      handlePhoneChange(e as React.ChangeEvent<HTMLInputElement>);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Валідація телефону перед відправкою
  const validatePhone = (phone: string): boolean => {
    // Видаляємо всі символи крім цифр
    const cleaned = phone.replace(/[^\d]/g, '');
    // Має бути рівно 12 цифр (380 + 9 цифр)
    return cleaned.length === 12;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Валідація
    if (!formData.name || !formData.phone || !formData.date || !formData.time) {
      setErrorMessage('Будь ласка, заповніть обов\'язкові поля');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrorMessage('❌ Будь ласка, введіть коректний номер телефону (9 цифр після +380)');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Очищуємо номер телефону перед відправкою
      const cleanedPhone = formData.phone.replace(/[^\d]/g, '');
      
      const bookingData = {
        ...formData,
        phone: cleanedPhone // Відправляємо тільки цифри
      };
      
      const response = await bookingApi.create(bookingData);
      
      if (response.success) {
        setSuccessMessage('Столик успішно заброньовано!');
        
        // Очистити форму, залишити +380 в телефоні
        setFormData({
          name: '',
          phone: '+380',
          date: '',
          time: '',
          guests: '2',
          email: ''
        });
      } else {
        setErrorMessage(response.error || '❌ Помилка при бронюванні. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Помилка при бронюванні:', error);
      setErrorMessage('❌ Помилка при бронюванні. Спробуйте ще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Генеруємо мінімальну дату (сьогодні)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container з адаптивними відступами */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        
        {/* Заголовок з адаптивним розміром тексту */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-coffee-dark mb-2 sm:mb-3">
            Бронювання столика
          </h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg">
            Забронюйте столик онлайн - швидко та зручно
          </p>
        </div>

        {/* Контейнер форми з адаптивною шириною */}
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
          
          {/* Повідомлення */}
          {successMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl">
              <div className="flex items-start sm:items-center">
                <span className="text-green-500 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0">✅</span>
                <span className="text-green-700 text-sm sm:text-base">{successMessage}</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl">
              <div className="flex items-start sm:items-center">
                <span className="text-red-500 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0">❌</span>
                <span className="text-red-700 text-sm sm:text-base">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Форма з адаптивними відступами */}
          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg lg:shadow-xl p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
              
              {/* Поле імені */}
              <div>
                <label className="block mb-1 sm:mb-2 font-medium text-gray-700 text-sm sm:text-base">
                  Ім'я <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base
                           border border-gray-300 rounded-lg sm:rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-coffee focus:border-transparent
                           transition-all hover:border-gray-400"
                  placeholder="Введіть ваше ім'я"
                  required
                />
              </div>

              {/* Поле телефону */}
              <div>
                <label className="block mb-1 sm:mb-2 font-medium text-gray-700 text-sm sm:text-base">
                  Телефон <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base
                           border border-gray-300 rounded-lg sm:rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-coffee focus:border-transparent
                           transition-all hover:border-gray-400"
                  placeholder="+380 (__) ___ __ __"
                  required
                />
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
                  Введіть 9 цифр вашого номеру
                </p>
              </div>

              {/* Дата і час - адаптивна сітка */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                {/* Дата */}
                <div>
                  <label className="block mb-1 sm:mb-2 font-medium text-gray-700 text-sm sm:text-base">
                    Дата <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="date" 
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={today}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base
                             border border-gray-300 rounded-lg sm:rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-coffee focus:border-transparent
                             transition-all hover:border-gray-400"
                    required
                  />
                </div>

                {/* Час */}
                <div>
                  <label className="block mb-1 sm:mb-2 font-medium text-gray-700 text-sm sm:text-base">
                    Час <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="time" 
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    min="08:00"
                    max="22:00"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base
                             border border-gray-300 rounded-lg sm:rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-coffee focus:border-transparent
                             transition-all hover:border-gray-400"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 sm:hidden">
                    8:00 - 22:00
                  </p>
                </div>
              </div>

              {/* Кількість гостей */}
              <div>
                <label className="block mb-1 sm:mb-2 font-medium text-gray-700 text-sm sm:text-base">
                  Кількість гостей
                </label>
                <div className="relative">
                  <select 
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base
                             border border-gray-300 rounded-lg sm:rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-coffee focus:border-transparent
                             appearance-none bg-white hover:border-gray-400"
                  >
                    <option value="1">1 особа</option>
                    <option value="2">2 особи</option>
                    <option value="3">3 особи</option>
                    <option value="4">4 особи</option>
                    <option value="5">5+ осіб</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 sm:mb-2 font-medium text-gray-700 text-sm sm:text-base">
                  Email (необов'язково)
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base
                           border border-gray-300 rounded-lg sm:rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-coffee focus:border-transparent
                           transition-all hover:border-gray-400"
                  placeholder="email@example.com"
                />
              </div>

              {/* Кнопка з адаптивними розмірами */}
              <div className="pt-2 sm:pt-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-medium
                           text-white text-sm sm:text-base md:text-lg
                           transition-all duration-300 hover:shadow-lg
                           disabled:opacity-50 disabled:cursor-not-allowed
                           ${isSubmitting 
                             ? 'bg-gray-400' 
                             : 'bg-gradient-to-r from-coffee-dark to-coffee hover:from-coffee hover:to-coffee-dark'
                           }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Обробка...
                    </span>
                  ) : 'Забронювати столик'}
                </button>
                
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;