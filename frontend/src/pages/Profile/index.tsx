import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { logoutUser } from '../../services/authService';
import { bookingApi, Booking } from '../../services/bookingService';
import { orderApi, Order } from '../../services/orderService';
import { Coffee, User as UserIcon, Mail, Calendar, Edit, LogOut, Users, Clock, CheckCircle, Package, Truck, CreditCard, Home, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.email) {
      fetchUserBookings();
      fetchUserOrders();
    }
  }, [isAuthenticated, user]);

  const fetchUserBookings = async () => {
    try {
      setBookingsLoading(true);
      const response = await bookingApi.getUserBookings(user!.email!);
      if (response.success && response.data) {
        setRecentBookings(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('❌ Помилка завантаження бронювань:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await orderApi.getUserOrders(user!.uid, user!.email!);
      if (response.success && response.data) {
        setRecentOrders(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error('❌ Помилка завантаження замовлень:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        dispatch(logout());
        navigate('/');
      } else {
        alert(result.error || 'Помилка при виході');
      }
    } catch (error: any) {
      alert(error.message || 'Помилка при виході');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBookingStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Очікує';
      case 'confirmed': return 'Підтверджено';
      case 'cancelled': return 'Скасовано';
      case 'completed': return 'Виконано';
      default: return status;
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'В обробці';
      case 'confirmed': return 'Підтверджено';
      case 'preparing': return 'Готується';
      case 'on_the_way': return 'В дорозі';
      case 'delivered': return 'Доставлено';
      case 'cancelled': return 'Скасовано';
      default: return status;
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} className="mr-1 flex-shrink-0" />;
      case 'confirmed': return <CheckCircle size={14} className="mr-1 flex-shrink-0" />;
      case 'preparing': return <Coffee size={14} className="mr-1 flex-shrink-0" />;
      case 'on_the_way': return <Truck size={14} className="mr-1 flex-shrink-0" />;
      case 'delivered': return <Package size={14} className="mr-1 flex-shrink-0" />;
      case 'cancelled': return <div className="w-3 h-3 bg-red-500 rounded-full mr-1 flex-shrink-0"></div>;
      default: return <Clock size={14} className="mr-1 flex-shrink-0" />;
    }
  };

  const getStatusColor = (status: string, type: 'booking' | 'order' = 'booking') => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
      case 'completed': 
        return 'bg-green-100 text-green-800';
      case 'cancelled': 
        return 'bg-red-100 text-red-800';
      case 'preparing':
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800';
      case 'pending': 
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount} грн`;
  };

  const getPaymentMethodText = (method?: string) => {
    if (!method) return 'Не вказано';
    return method === 'cash' ? 'Готівка' : 'Картка';
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-coffee-dark">Доступ заборонено</h1>
          <Coffee size={48} className="mx-auto text-coffee mb-4 sm:mb-6" />
          <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
            Будь ласка, увійдіть в акаунт для доступу до профілю
          </p>
          <Link 
            to="/auth" 
            className="inline-block bg-coffee-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-coffee transition-colors text-sm sm:text-base"
          >
            Увійти в акаунт
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Мобільна навігація */}
      <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-coffee-dark"
          >
            <Home size={20} className="mr-1" />
            <span className="text-sm font-medium">На головну</span>
          </button>
          <h1 className="text-lg font-bold text-coffee-dark">Мій профіль</h1>
          <div className="w-10"></div> {/* Для балансу */}
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-6xl">
          {/* Заголовок для десктопу */}
          <div className="hidden md:block mb-6 lg:mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-coffee-dark">Мій профіль</h1>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Профільна інформація */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-24">
                <div className="text-center mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-coffee-light rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon size={40} className="text-coffee-dark sm:w-12 sm:h-12 lg:w-16 lg:h-16" />
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 truncate px-2">
                    {user.displayName || 'Користувач'}
                  </h2>
                  <p className="text-gray-600 flex items-center justify-center text-sm sm:text-base">
                    <Mail size={14} className="mr-2 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  <div className="mt-2 sm:mt-3">
                    <span className="inline-block px-2 sm:px-3 py-1 bg-coffee-light text-coffee-dark rounded-full text-xs sm:text-sm">
                      Звичайний користувач
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 sm:space-y-3">
                  <Link 
                    to="/booking" 
                    className="block bg-coffee-dark text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-coffee transition-colors text-center text-sm sm:text-base"
                  >
                    Забронювати столик
                  </Link>
                  
                  <Link 
                    to="/menu" 
                    className="block bg-coffee text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-coffee-dark transition-colors text-center text-sm sm:text-base"
                  >
                    Замовити доставку
                  </Link>
                  
                  <Link 
                    to="/profile/bookings" 
                    className="block border border-coffee-dark text-coffee-dark py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-sm sm:text-base"
                  >
                    <Calendar size={16} className="inline mr-1 sm:mr-2" />
                    Мої бронювання
                  </Link>
                  
                  <Link 
                    to="/profile/orders" 
                    className="block border border-coffee-dark text-coffee-dark py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-sm sm:text-base"
                  >
                    <Package size={16} className="inline mr-1 sm:mr-2" />
                    Мої замовлення
                  </Link>
                  
                  <Link 
                    to="/profile/reviews"  
                    className="block border border-coffee-dark text-coffee-dark py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center text-sm sm:text-base"
                  >
                    Мої відгуки
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className={`w-full flex items-center justify-center border border-red-500 text-red-500 py-2 sm:py-3 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm sm:text-base ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <LogOut size={16} className="mr-1 sm:mr-2 flex-shrink-0" />
                    {loading ? 'Виходимо...' : 'Вийти з акаунту'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Історія та активність */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Останні бронювання */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                    <Calendar className="mr-2 text-coffee w-5 h-5 sm:w-6 sm:h-6" />
                    Останні бронювання
                  </h3>
                  
                  {bookingsLoading ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-coffee-dark mx-auto"></div>
                      <p className="mt-2 sm:mt-3 text-gray-600 text-sm sm:text-base">Завантаження...</p>
                    </div>
                  ) : recentBookings.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Calendar size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">У вас ще немає бронювань</p>
                      <Link 
                        to="/booking" 
                        className="inline-block bg-coffee-dark text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-coffee transition-colors text-sm sm:text-base"
                      >
                        Забронювати столик
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id || booking._id} className="border-b pb-3 sm:pb-4 last:border-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center mb-1">
                                <Calendar size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                                <span className="font-medium text-sm sm:text-base truncate">
                                  {formatDate(booking.date)} о {booking.time}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-1 sm:gap-2">
                                <div className="flex items-center">
                                  <Users size={12} className="mr-1 flex-shrink-0" />
                                  <span>{booking.guests} гостей</span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <span className="truncate">{booking.user_phone || booking.userPhone || 'Телефон не вказано'}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)} whitespace-nowrap`}>
                                {getBookingStatusText(booking.status)}
                              </span>
                              <Link 
                                to="/profile/bookings"
                                className="text-xs sm:text-sm text-coffee-dark hover:text-coffee whitespace-nowrap"
                              >
                                Детальніше
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-2">
                        <Link 
                          to="/profile/bookings" 
                          className="block text-center text-coffee-dark hover:text-coffee font-medium text-sm sm:text-base"
                        >
                          Всі бронювання →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Останні замовлення */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center">
                    <Package className="mr-2 text-coffee w-5 h-5 sm:w-6 sm:h-6" />
                    Останні замовлення
                  </h3>
                  
                  {ordersLoading ? (
                    <div className="text-center py-6 sm:py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-coffee-dark mx-auto"></div>
                      <p className="mt-2 sm:mt-3 text-gray-600 text-sm sm:text-base">Завантаження...</p>
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <Package size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                      <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">У вас ще немає замовлень</p>
                      <Link 
                        to="/menu" 
                        className="inline-block bg-coffee-dark text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-coffee transition-colors text-sm sm:text-base"
                      >
                        Зробити замовлення
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id || order._id} className="border-b pb-3 sm:pb-4 last:border-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center mb-1 gap-1 sm:gap-2">
                                <span className="font-medium text-coffee-dark mr-1 sm:mr-2 text-sm sm:text-base">
                                  №{order.order_number || order.orderNumber}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500">
                                  {formatDate(order.created_at || order.createdAt || new Date().toISOString())}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-600 gap-1 sm:gap-2 mb-1">
                                <div className="flex items-center">
                                  <CreditCard size={12} className="mr-1 flex-shrink-0" />
                                  <span className="capitalize">
                                    {getPaymentMethodText(order.payment_method || order.paymentMethod)}
                                  </span>
                                </div>
                                <span className="hidden sm:inline">•</span>
                                <div className="flex items-center truncate">
                                  <Truck size={12} className="mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {order.delivery_address ? 
                                      (order.delivery_address.includes(',') ? 
                                        order.delivery_address.split(',')[0] : 
                                        order.delivery_address) :
                                      order.deliveryAddress ? 
                                        (order.deliveryAddress.includes(',') ? 
                                          order.deliveryAddress.split(',')[0] : 
                                          order.deliveryAddress) :
                                      'Адреса не вказана'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center text-sm sm:text-base font-medium">
                                {formatCurrency(order.final_amount || order.finalAmount || 0)}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-start gap-2">
                              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status, 'order')} whitespace-nowrap`}>
                                {getOrderStatusIcon(order.status)}
                                {getOrderStatusText(order.status)}
                              </div>
                              <Link 
                                to={`/profile/orders/${order.id || order._id}`}
                                className="text-xs sm:text-sm text-coffee-dark hover:text-coffee whitespace-nowrap"
                              >
                                Детальніше
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-2">
                        <Link 
                          to="/profile/orders" 
                          className="block text-center text-coffee-dark hover:text-coffee font-medium text-sm sm:text-base"
                        >
                          Всі замовлення →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Моя активність */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-coffee-dark">Моя активність</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Calendar size={18} className="text-blue-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-coffee-dark mb-1">{recentBookings.length}</p>
                      <p className="text-gray-600 text-xs sm:text-sm">Бронювань</p>
                    </div>
                    
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 text-center hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <Package size={18} className="text-green-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-coffee-dark mb-1">{recentOrders.length}</p>
                      <p className="text-gray-600 text-xs sm:text-sm">Замовлень</p>
                    </div>
                    
                    <div className="col-span-2 sm:col-span-1 border border-gray-200 rounded-lg p-3 sm:p-4 text-center hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <CheckCircle size={18} className="text-purple-600 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-coffee-dark mb-1">1</p>
                      <p className="text-gray-600 text-xs sm:text-sm">Роки з нами</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                      <div>
                        <p className="font-medium text-sm sm:text-base">Статус акаунту</p>
                        <p className="text-xs sm:text-sm text-gray-500">Рівень лояльності</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="font-medium text-green-600 text-sm sm:text-base">Активний</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-green-500 h-1.5 sm:h-2 rounded-full" 
                        style={{ width: `${Math.min(recentOrders.length * 20, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">
                      {recentOrders.length > 0 
                        ? `${recentOrders.length} замовлення - продовжуйте в тому ж дусі!` 
                        : 'Зробіть перше замовлення для отримання статусу'}
                    </p>
                  </div>
                </div>
                
                {/* Швидкі дії */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-md p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-coffee-dark">Швидкі дії</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <button 
                      onClick={() => navigate('/menu')}
                      className="text-left p-3 sm:p-4 border border-coffee-light rounded-lg hover:bg-coffee-light transition-colors"
                    >
                      <div className="flex items-center">
                        <Coffee size={20} className="text-coffee-dark mr-2 sm:mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">Нове замовлення</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">Замовте каву або десерт</p>
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/booking')}
                      className="text-left p-3 sm:p-4 border border-coffee-light rounded-lg hover:bg-coffee-light transition-colors"
                    >
                      <div className="flex items-center">
                        <Calendar size={20} className="text-coffee-dark mr-2 sm:mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">Забронювати столик</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">Забронюйте місце в кав'ярні</p>
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/profile/reviews')}
                      className="text-left p-3 sm:p-4 border border-coffee-light rounded-lg hover:bg-coffee-light transition-colors"
                    >
                      <div className="flex items-center">
                        <Edit size={20} className="text-coffee-dark mr-2 sm:mr-3 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">Написати відгук</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">Поділіться враженнями</p>
                        </div>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => navigate('/auth?mode=reset')}
                      className="text-left p-3 sm:p-4 border border-coffee-light rounded-lg hover:bg-coffee-light transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm sm:text-base truncate">Безпека</p>
                          <p className="text-xs sm:text-sm text-gray-500 truncate">Змінити пароль</p>
                        </div>
                      </div>
                    </button>
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

export default ProfilePage;