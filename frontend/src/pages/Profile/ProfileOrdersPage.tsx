import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { orderApi, Order } from '../../services/orderService';
import { Coffee, Package, Truck, Clock, CheckCircle, XCircle, CreditCard, MapPin, Phone, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProfileOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getUserOrders(user!.uid, user!.email!);
      if (response.success && response.data) {
        let filteredOrders = response.data;
        
        if (filterStatus !== 'all') {
          filteredOrders = response.data.filter(order => order.status === filterStatus);
        }
        
        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження замовлень:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered': 
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'preparing': return <Coffee size={16} />;
      case 'on_the_way': return <Truck size={16} />;
      case 'delivered': return <Package size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return `${amount} грн`;
  };

  const getPaymentMethodText = (method?: string) => {
    if (!method) return 'Не вказано';
    return method === 'cash' ? 'Готівкою' : 'Карткою онлайн';
  };

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-coffee-dark">Доступ заборонено</h1>
          <Coffee size={64} className="mx-auto text-coffee mb-6" />
          <p className="mb-6 text-gray-600">Будь ласка, увійдіть в акаунт</p>
          <Link to="/auth" className="inline-block bg-coffee-dark text-white px-6 py-3 rounded-lg hover:bg-coffee transition-colors">
            Увійти в акаунт
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-coffee-dark hover:text-coffee mb-4"
          >
            ← Повернутися до профілю
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-coffee-dark mb-2">Мої замовлення</h1>
          <p className="text-gray-600">Історія всіх ваших замовлень</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Фільтри та інформація */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4 text-coffee-dark">Фільтр за статусом</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`w-full text-left px-4 py-2 rounded-lg ${filterStatus === 'all' ? 'bg-coffee-light text-coffee-dark' : 'hover:bg-gray-100'}`}
                  >
                    Всі замовлення
                  </button>
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${filterStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'hover:bg-gray-100'}`}
                  >
                    <Clock size={16} className="mr-2" />
                    В обробці
                  </button>
                  <button
                    onClick={() => setFilterStatus('preparing')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${filterStatus === 'preparing' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                  >
                    <Coffee size={16} className="mr-2" />
                    Готується
                  </button>
                  <button
                    onClick={() => setFilterStatus('on_the_way')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${filterStatus === 'on_the_way' ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
                  >
                    <Truck size={16} className="mr-2" />
                    В дорозі
                  </button>
                  <button
                    onClick={() => setFilterStatus('delivered')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${filterStatus === 'delivered' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
                  >
                    <Package size={16} className="mr-2" />
                    Доставлено
                  </button>
                  <button
                    onClick={() => setFilterStatus('cancelled')}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center ${filterStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'hover:bg-gray-100'}`}
                  >
                    <XCircle size={16} className="mr-2" />
                    Скасовано
                  </button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-lg mb-4 text-coffee-dark">Інформація</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Всього замовлень</p>
                    <p className="text-xl font-bold text-coffee-dark">{orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Останнє замовлення</p>
                    <p className="font-medium">
                      {orders.length > 0 ? `№${orders[0]?.order_number || orders[0]?.orderNumber}` : 'Немає'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link
                  to="/menu"
                  className="block w-full bg-coffee-dark text-white py-3 rounded-lg font-medium hover:bg-coffee transition-colors text-center"
                >
                  Зробити нове замовлення
                </Link>
              </div>
            </div>
          </div>

          {/* Список замовлень */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-dark mx-auto"></div>
                <p className="mt-4 text-gray-600">Завантаження замовлень...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-6" />
                <h3 className="text-xl font-semibold text-gray-700 mb-3">У вас ще немає замовлень</h3>
                <p className="text-gray-500 mb-8">Зробіть перше замовлення з нашого меню</p>
                <Link
                  to="/menu"
                  className="inline-block bg-coffee-dark text-white px-8 py-3 rounded-lg font-medium hover:bg-coffee transition-colors"
                >
                  Перейти до меню
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id || order._id} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-xl font-bold text-coffee-dark mr-3">
                              №{order.order_number || order.orderNumber}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{getStatusText(order.status)}</span>
                            </span>
                          </div>
                          <p className="text-gray-600">
                            <Clock size={14} className="inline mr-2" />
                            {formatDate(order.created_at || order.createdAt || new Date().toISOString())}
                          </p>
                        </div>
                        
                        <div className="mt-3 md:mt-0">
                          <p className="text-2xl font-bold text-coffee-dark">
                            {formatCurrency(order.final_amount || order.finalAmount || 0)}
                          </p>
                          <p className="text-gray-600 text-sm mt-1">
                            {order.items.length} товарів
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <User size={16} className="text-gray-500 mr-2" />
                            <span className="font-medium">Замовник</span>
                          </div>
                          <p className="text-gray-700">{order.customer_name || order.customerName || 'Не вказано'}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <Phone size={16} className="text-gray-500 mr-2" />
                            <span className="font-medium">Телефон</span>
                          </div>
                          <p className="text-gray-700">{order.customer_phone || order.customerPhone || 'Не вказано'}</p>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center mb-1">
                            <CreditCard size={16} className="text-gray-500 mr-2" />
                            <span className="font-medium">Оплата</span>
                          </div>
                          <p className="text-gray-700">{getPaymentMethodText(order.payment_method || order.paymentMethod)}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <MapPin size={16} className="text-gray-500 mr-2" />
                          <span className="font-medium">Адреса доставки</span>
                        </div>
                        <p className="text-gray-700">{order.delivery_address || order.deliveryAddress || 'Адреса не вказана'}</p>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Товари:</h4>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded overflow-hidden mr-3">
                                  <img
                                    src={item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-500">{item.price} грн × {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium">{item.price * item.quantity} грн</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Доставка</p>
                          <p className="font-medium">
                            {(order.delivery_fee || order.deliveryFee || 0) === 0 ? 'Безкоштовно' : `${order.delivery_fee || order.deliveryFee} грн`}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => navigate(`/profile/orders/${order.id || order._id}`)}
                          className="px-4 py-2 border border-coffee-dark text-coffee-dark rounded-lg hover:bg-coffee-light transition-colors"
                        >
                          Детальніше
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOrdersPage;