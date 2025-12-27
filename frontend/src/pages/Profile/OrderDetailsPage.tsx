import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { orderApi } from '../../services/orderService';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { 
  Package, Truck, Clock, CheckCircle, XCircle, CreditCard, 
  MapPin, Phone, User, Calendar, DollarSign, Coffee, ArrowLeft 
} from 'lucide-react';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id && user) {
      fetchOrder();
    }
  }, [id, user]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrderById(id!);
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.error || 'Замовлення не знайдено');
      }
    } catch (error: any) {
      console.error('❌ Помилка завантаження замовлення:', error);
      setError('Помилка завантаження замовлення');
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
      case 'pending': return <Clock size={20} />;
      case 'confirmed': return <CheckCircle size={20} />;
      case 'preparing': return <Coffee size={20} />;
      case 'on_the_way': return <Truck size={20} />;
      case 'delivered': return <Package size={20} />;
      case 'cancelled': return <XCircle size={20} />;
      default: return <Clock size={20} />;
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

  const getPaymentMethodText = (method: string) => {
    return method === 'cash' ? 'Готівкою кур\'єру' : 'Карткою онлайн';
  };

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-coffee-dark">Доступ заборонено</h1>
          <Coffee size={64} className="mx-auto text-coffee mb-6" />
          <p className="mb-6 text-gray-600">Будь ласка, увійдіть в акаунт</p>
          <button
            onClick={() => navigate('/auth')}
            className="inline-block bg-coffee-dark text-white px-6 py-3 rounded-lg hover:bg-coffee transition-colors"
          >
            Увійти в акаунт
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-dark mx-auto"></div>
          <p className="mt-4 text-gray-600">Завантаження замовлення...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-md text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-6" />
          <h1 className="text-2xl font-bold mb-4 text-gray-700">{error || 'Замовлення не знайдено'}</h1>
          <p className="mb-6 text-gray-600">Можливо, замовлення було видалено або у вас немає доступу</p>
          <button
            onClick={() => navigate('/profile/orders')}
            className="inline-block bg-coffee-dark text-white px-6 py-3 rounded-lg hover:bg-coffee transition-colors"
          >
            Повернутися до замовлень
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate('/profile/orders')}
          className="flex items-center text-coffee-dark hover:text-coffee mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          До всіх замовлень
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Шапка замовлення */}
          <div className="bg-gradient-to-r from-coffee-light to-coffee p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Замовлення №{order.orderNumber}
                </h1>
                <p className="text-coffee-light">
                  <Calendar size={16} className="inline mr-2" />
                  {formatDate(order.createdAt)}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-2">{getStatusText(order.status)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Основна інформація */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Інформація про замовника */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h2 className="text-lg font-bold mb-4 text-coffee-dark">Інформація про замовника</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Ім'я</p>
                      <p className="font-medium">{order.customerName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Phone size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Телефон</p>
                      <p className="font-medium">{order.customerPhone}</p>
                    </div>
                  </div>
                  
                  {order.customerEmail && (
                    <div className="flex items-center">
                      <Mail size={18} className="text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{order.customerEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Інформація про доставку та оплату */}
              <div className="bg-gray-50 rounded-lg p-5">
                <h2 className="text-lg font-bold mb-4 text-coffee-dark">Доставка та оплата</h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Адреса доставки</p>
                      <p className="font-medium">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  
                  {order.deliveryTime && (
                    <div className="flex items-center">
                      <Clock size={18} className="text-gray-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Бажаний час</p>
                        <p className="font-medium">{order.deliveryTime}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <CreditCard size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Спосіб оплати</p>
                      <p className="font-medium">{getPaymentMethodText(order.paymentMethod)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center mr-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Статус оплати</p>
                      <p className="font-medium capitalize">
                        {order.paymentStatus === 'paid' ? 'Оплачено' : 'Очікує оплати'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Товари */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4 text-coffee-dark">Склад замовлення</h2>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6 font-medium">Товар</div>
                    <div className="col-span-2 font-medium text-center">Ціна</div>
                    <div className="col-span-2 font-medium text-center">Кількість</div>
                    <div className="col-span-2 font-medium text-center">Сума</div>
                  </div>
                </div>
                
                <div className="divide-y">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="px-4 py-3 hover:bg-gray-50">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6">
                          <div className="flex items-center">
                            <div className="w-12 h-12 rounded overflow-hidden mr-3">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-gray-500">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <p className="font-medium">{formatCurrency(item.price)}</p>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <p className="font-medium">{item.quantity}</p>
                        </div>
                        
                        <div className="col-span-2 text-center">
                          <p className="font-bold text-coffee-dark">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Підсумок */}
            <div className="bg-coffee-light rounded-lg p-6">
              <h2 className="text-lg font-bold mb-4 text-coffee-dark">Підсумок</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Сума товарів:</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Вартість доставки:</span>
                  <span className={`font-medium ${order.deliveryFee === 0 ? 'text-green-600' : ''}`}>
                    {order.deliveryFee === 0 ? 'Безкоштовно' : formatCurrency(order.deliveryFee)}
                  </span>
                </div>
                
                {order.deliveryNotes && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-1">Додаткові побажання:</p>
                    <p className="italic">{order.deliveryNotes}</p>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">До сплати:</span>
                    <span className="text-2xl font-bold text-coffee-dark">
                      {formatCurrency(order.finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Додаткова інформація */}
            <div className="mt-6 pt-6 border-t text-sm text-gray-500">
              <p>
                <strong>Примітка:</strong> Якщо у вас виникли питання щодо замовлення, 
                зв'яжіться з нами за номером <strong>+380 (68) 123-45-67</strong> або напишіть на 
                <strong> support@coffee-shop.com</strong>. Вкажіть номер замовлення: <strong>{order.orderNumber}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;