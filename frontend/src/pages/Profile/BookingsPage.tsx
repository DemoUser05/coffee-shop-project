import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { bookingApi, Booking } from '../../services/bookingService';
import { Calendar, Users, Phone, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const BookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.email) {
        setError('Будь ласка, увійдіть в акаунт для перегляду бронювань');
        setLoading(false);
        return;
      }

      console.log('🔍 Пошук бронювань для:', user.email);
      const response = await bookingApi.getUserBookings(user.email);
      
      console.log('📊 Результат пошуку:', response);
      
      if (response.success) {
        const bookingsData = response.data || [];
        console.log('✅ Знайдено бронювань:', bookingsData.length);
        
        // Використовуємо дані без конвертації (вони вже в правильному форматі)
        setBookings(bookingsData);
        
        if (bookingsData.length === 0) {
          setError('У вас ще немає бронювань');
        }
      } else {
        console.error('❌ Помилка від API:', response.error);
        setError(response.error || 'Помилка завантаження бронювань');
      }
    } catch (error: any) {
      console.error('❌ Загальна помилка:', error);
      setError('Помилка завантаження бронювань. Спробуйте пізніше.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={20} className="text-green-500" />;
      case 'cancelled': return <XCircle size={20} className="text-red-500" />;
      case 'completed': return <CheckCircle size={20} className="text-blue-500" />;
      default: return <AlertCircle size={20} className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Очікує підтвердження';
      case 'confirmed': return 'Підтверджено';
      case 'cancelled': return 'Скасовано';
      case 'completed': return 'Виконано';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Ви впевнені, що хочете скасувати це бронювання?')) return;
    
    try {
      setCancelling(bookingId);
      const response = await bookingApi.cancelBooking(bookingId);
      
      if (response.success) {
        // Оновлюємо список бронювань
        setBookings(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        
        alert('✅ Бронювання успішно скасовано!');
      } else {
        alert(`❌ ${response.error || 'Помилка при скасуванні бронювання'}`);
      }
    } catch (error: any) {
      console.error('❌ Помилка при скасуванні:', error);
      alert('❌ Помилка при скасуванні бронювання. Спробуйте пізніше.');
    } finally {
      setCancelling(null);
    }
  };

  const handleBookAgain = () => {
    navigate('/booking');
  };

  // Фільтруємо бронювання за статусами
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження бронювань...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Заголовок */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-coffee-dark hover:text-coffee mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Назад до профілю
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-coffee-dark">Мої бронювання</h1>
              <p className="text-gray-600 mt-2">Вся історія ваших бронювань</p>
            </div>
            <button
              onClick={fetchBookings}
              className="flex items-center text-coffee-dark hover:text-coffee"
              disabled={loading}
            >
              <RefreshCw size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Оновити
            </button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-coffee-dark mb-1">{bookings.length}</div>
            <div className="text-sm text-gray-600">Всього бронювань</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {pendingBookings.length}
            </div>
            <div className="text-sm text-gray-600">Очікують</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {confirmedBookings.length}
            </div>
            <div className="text-sm text-gray-600">Підтверджені</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600 mb-1">
              {cancelledBookings.length}
            </div>
            <div className="text-sm text-gray-600">Скасовані</div>
          </div>
        </div>

        {/* Помилка */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            {error.includes('увійдіть') ? (
              <Link
                to="/auth"
                className="inline-block mt-2 bg-coffee-dark text-white px-4 py-2 rounded-lg hover:bg-coffee transition-colors"
              >
                Увійти в акаунт
              </Link>
            ) : (
              <button
                onClick={fetchBookings}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
                disabled={loading}
              >
                Спробувати ще раз
              </button>
            )}
          </div>
        )}

        {/* Список всіх бронювань */}
        {bookings.length > 0 ? (
          <div className="bg-white rounded-xl shadow">
            <div className="divide-y">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    {/* Інформація про бронювання */}
                    <div className="mb-4 md:mb-0 md:w-2/3">
                      <div className="flex items-center mb-3">
                        {getStatusIcon(booking.status)}
                        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                        {booking.created_at && (
                          <span className="ml-4 text-sm text-gray-500">
                            Створено: {formatDate(booking.created_at)}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <Calendar size={18} className="text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{formatDate(booking.date)}</p>
                            <p className="text-sm text-gray-600">Дата</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock size={18} className="text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{booking.time}</p>
                            <p className="text-sm text-gray-600">Час</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Users size={18} className="text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium">{booking.guests} {booking.guests === 1 ? 'гість' : 'гостей'}</p>
                            <p className="text-sm text-gray-600">Кількість</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex items-center">
                          <Phone size={16} className="text-gray-400 mr-2" />
                          <span className="text-gray-700">{booking.user_phone}</span>
                        </div>
                        <p className="text-gray-600 mt-1">{booking.user_name}</p>
                      </div>
                    </div>
                    
                    {/* Кнопки дій */}
                    <div className="flex flex-col space-y-2">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id!)}
                          disabled={cancelling === booking.id}
                          className={`px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center ${
                            cancelling === booking.id ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {cancelling === booking.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Скасування...
                            </>
                          ) : (
                            'Скасувати бронювання'
                          )}
                        </button>
                      )}
                      <button
                        onClick={handleBookAgain}
                        className="px-4 py-2 border border-coffee-dark text-coffee-dark rounded-lg hover:bg-coffee-light transition-colors"
                      >
                        Забронювати знову
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !error?.includes('увійдіть') && (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Немає бронювань</h3>
            <p className="text-gray-500 mb-6">Ви ще не робили бронювань у нашому кафе</p>
            <Link
              to="/booking"
              className="inline-block bg-coffee-dark text-white px-6 py-3 rounded-lg hover:bg-coffee transition-colors"
            >
              Забронювати столик
            </Link>
          </div>
        )}

        {/* Інформація про статуси */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-2">Інформація про статуси</h3>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span><strong>Очікує підтвердження</strong> - ми зв'яжемося з вами найближчим часом</span>
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span><strong>Підтверджено</strong> - ваше бронювання активне</span>
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span><strong>Скасовано</strong> - бронювання було скасовано</span>
            </li>
            <li className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span><strong>Виконано</strong> - ви відвідали кафе</span>
            </li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              У разі питань телефонуйте: <span className="font-medium">+380 (68) 123-45-67</span>
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Email: <span className="font-medium">support@coffee-shop.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsPage;