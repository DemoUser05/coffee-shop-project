import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { addToCart, removeFromCart, updateQuantity, clearCart } from "../../store/slices/cartSlice";
import { menuApi } from "../../services/api";
import { Coffee, Dessert, Sandwich, ShoppingCart, Plus, Minus, Filter, Search, X, Star, Menu as MenuIcon, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  isPopular?: boolean;
  ingredients?: string[];
}

const MenuPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  const cart = useSelector((state: RootState) => state.cart);
  const cartItems = cart.items;
  const cartTotal = cart.totalAmount;
  const cartItemCount = cart.totalItems;

  useEffect(() => {
    fetchMenu();
  }, []);

  // Мок-дані для меню
  const mockMenuItems: MenuItem[] = [
    // Кава
    {
      id: 1,
      name: "Капучино",
      price: 95,
      category: "кава",
      description: "Так само ніжно, як обійми рожевої корівки.",
      imageUrl: "/images/capuccino.png",
      isPopular: true,
      ingredients: ["Еспресо", "Молоко", "Молочна піна"]
    },
    {
      id: 2,
      name: "Чізкейк",
      price: 110,
      category: "десерти",
      description: "Класика, що тане в роті. Ніжний сир, дрібка ванілі та ягідний вибух зверху. Те, що корова прописала!",
      imageUrl: "/images/cheesecake4.jpg",
      ingredients: ["Сир Маскарпоне", "Пісочна основа"]
    },
    {
      id: 3,
      name: "Кава Американо",
      price: 65,
      category: "кава",
      description: "Твій ранковий заряд енергії. Лаконічний американо з оксамитовою пінкою cremà, що ідеально підкреслює солодкий дизайн кружки.",
      imageUrl: "/images/espresso.png",
      isPopular: true,
      ingredients: ["Еспресо", "Гаряча вода"]
    },
    {
      id: 4,
      name: "Мокка",
      price: 80,
      category: "кава",
      description: "Найтемніший шоколад зустрівся з білою молочною піною. Десертний характер, перед яким неможливо встояти.",
      imageUrl: "/images/mocca.png",
      ingredients: ["Еспресо", "Шоколад", "Молоко", "Вершки"]
    },
    {
      id: 5,
      name: "Матча лате",
      price: 100,
      category: "кава",
      description: "Японська магія на пасовищі! Яскрава пудра матча, збита з ніжним молоком до стану хмаринки. Твій дзен у рожевій кружці.",
      imageUrl: "/images/matcha.png",
      isPopular: true,
      ingredients: ["Матча порошок", "Молоко", "Мед"]
    },
    {
      id: 6,
      name: "Флет-вайт",
      price: 90,
      category: "кава",
      description: "Подвійна порція енергії під тонким шаром шовковистого молока. Стильний вибір для тих, хто любить міцний характер у ніжній рожевій кружці.",
      imageUrl: "/images/flatwhite.png",
      ingredients: ["Дві порції еспресо", "Окроплене молоко"]
    },
    
    // Десерти
    {
      id: 7,
      name: "Тірамісу",
      price: 115,
      category: "десерти",
      description: "Невагомі бісквіти, просочені міцним еспресо, під ковдрою з ніжного маскарпоне. Десерт, що тане в роті швидше, ніж ти встигнеш сказати «Му!».",
      imageUrl: "/images/tiramisu.jpg",
      isPopular: true,
      ingredients: ["Маскарпоне", "Бісквіт", "Кава", "Какао"]
    },
    {
      id: 8,
      name: "Лате",
      price: 95,
      category: "кава",
      description: "Велика порція молочної ніжності для тих, хто нікуди не поспішає. М'який смак, що огортає, як теплий літній ранок на пасовищі.",
      imageUrl: "/images/late.png",
      ingredients: ["Еспресо", "Молоко", "Піна"]
    },
    {
      id: 9,
      name: "Еклер",
      price: 95,
      category: "десерти",
      description: "Заварний пиріжок з ніжною заварною начинкою та шоколадною глазур'ю.",
      imageUrl: "/images/ekler.jpg",
      ingredients: ["Заварне тісто", "Заварний крем"]
    },
    {
      id: 10,
      name: "Медовик",
      price: 105,
      category: "десерти",
      description: "Торт з медових коржів та ніжного сметанного крему.",
      imageUrl: "/images/medovyk.webp",
      ingredients: ["Мед", "Сметана", "Волоські горіхи"]
    },
    
    // Чай
    {
      id: 11,
      name: "Зелений чай",
      price: 75,
      category: "чай",
      description: "Освіжаючий зелений чай з легкими трав'яними нотами.",
      imageUrl: "/images/tea.png",
      ingredients: ["Зелений чай", "Лимон", "Мед"]
    },
    {
      id: 12,
      name: "Чай з жасмином",
      price: 80,
      category: "чай",
      description: "Ніжний зелений чай з ароматом квітів жасмину.",
      imageUrl: "/images/tea5.png",
      ingredients: ["Зелений чай", "Квіти жасмину"]
    },
    {
      id: 13,
      name: "Чай масала",
      price: 85,
      category: "чай",
      description: "Ароматний індійський чай з молоком та спеціями.",
      imageUrl: "/images/tea3.png",
      ingredients: ["Чорний чай", "Молоко", "Імбир", "Кардамон", "Гвоздика"]
    },
    
    // Снеки
    {
      id: 14,
      name: "Круасан",
      price: 90,
      category: "снеки",
      description: "Свіжий французький круасан з вершковим маслом.",
      imageUrl: "/images/cruassant.webp",
      isPopular: true,
      ingredients: ["Борошно", "Вершкове масло"]
    },
    {
      id: 15,
      name: "Брускета",
      price: 95,
      category: "снеки",
      description: "Хрусткий хліб з томатами, базиліком та оливковою олією.",
      imageUrl: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      ingredients: ["Хліб чиаббата", "Томати", "Базилік", "Оливкова олія"]
    },
    {
      id: 16,
      name: "Салат Цезар",
      price: 120,
      category: "снеки",
      description: "Класичний салат з куркою, крутонами та соусом Цезар.",
      imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      ingredients: ["Куряче філе", "Салат ромен", "Крутони", "Соус Цезар", "Пармезан"]
    },
  ];

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setMenuItems(mockMenuItems);
    } catch (error) {
      console.error('Помилка при отриманні меню:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Всі', icon: <Filter size={16} className="sm:w-5 sm:h-5" /> },
    { id: 'кава', name: 'Кава', icon: <Coffee size={16} className="sm:w-5 sm:h-5" /> },
    { id: 'десерти', name: 'Десерти', icon: <Dessert size={16} className="sm:w-5 sm:h-5" /> },
    { id: 'чай', name: 'Чай', icon: <Coffee size={16} className="sm:w-5 sm:h-5" /> },
    { id: 'снеки', name: 'Снеки', icon: <Sandwich size={16} className="sm:w-5 sm:h-5" /> },
  ];
  
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const searchedItems = searchQuery.trim() === '' 
    ? filteredItems 
    : filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ingredients?.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const handleAddToCart = (item: MenuItem) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.imageUrl
    }));
  };

  const handleQuantityChange = (itemId: number, change: number) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    if (cartItem) {
      const newQuantity = cartItem.quantity + change;
      if (newQuantity > 0) {
        dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
      } else {
        dispatch(removeFromCart(itemId));
      }
    }
  };

  const handleOrder = () => {
    if (cartItems.length === 0) {
      alert('Кошик порожній. Додайте товари до кошика.');
      return;
    }
    navigate('/checkout');
    setShowCart(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'кава': return <Coffee size={14} className="inline mr-1 flex-shrink-0" />;
      case 'десерти': return <Dessert size={14} className="inline mr-1 flex-shrink-0" />;
      case 'снеки': return <Sandwich size={14} className="inline mr-1 flex-shrink-0" />;
      default: return null;
    }
  };

  const getItemQuantity = (itemId: number) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleClearCart = () => {
    if (window.confirm('Ви впевнені, що хочете очистити кошик?')) {
      dispatch(clearCart());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-dark mx-auto"></div>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">Завантаження меню...</p>
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
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-coffee-dark"
          >
            <Home size={20} className="mr-1" />
            <span className="text-sm font-medium">На головну</span>
          </button>
          <h1 className="text-lg font-bold text-coffee-dark">Меню</h1>
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="p-2 bg-gray-100 rounded-lg"
          >
            <MenuIcon size={20} />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          {/* Заголовок для десктопу */}
          <div className="hidden md:block mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-coffee-dark">Наше меню</h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                  Оберіть улюблені напої та десерти. Усі страви готуються зі свіжих продуктів.
                </p>
              </div>
              
              {/* Десктоп кошик */}
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-coffee-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-coffee transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <ShoppingCart size={18} className="mr-2" />
                Кошик
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Десктоп пошук */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Пошук страв чи інгредієнтів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors text-sm sm:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Мобільний пошук та кошик */}
          <div className="md:hidden mb-4">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Пошук страв чи інгредієнтів..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee focus:border-coffee outline-none transition-colors text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowCart(!showCart)}
                className="flex-1 relative bg-coffee-dark text-white px-4 py-2.5 rounded-lg hover:bg-coffee transition-colors flex items-center justify-center text-sm"
              >
                <ShoppingCart size={16} className="mr-2" />
                Кошик
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm"
              >
                <Filter size={16} className="mr-2" />
                Фільтри
              </button>
            </div>
          </div>

          {/* Мобільне меню фільтрів */}
          {isFiltersOpen && (
            <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsFiltersOpen(false)}>
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-coffee-dark">Категорії</h3>
                  <button onClick={() => setIsFiltersOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setIsFiltersOpen(false);
                      }}
                      className={`w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === category.id 
                          ? 'bg-coffee-dark text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        {category.icon}
                        <span className="ml-2 text-sm font-medium">{category.name}</span>
                      </div>
                      {selectedCategory === category.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                    setIsFiltersOpen(false);
                  }}
                  className="w-full mt-4 px-4 py-3 bg-coffee-light text-coffee-dark rounded-lg font-medium text-sm hover:bg-coffee hover:text-white transition-colors"
                >
                  Скинути фільтри
                </button>
              </div>
            </div>
          )}

          {/* Фільтри за категоріями (десктоп) */}
          <div className="hidden md:flex flex-wrap gap-2 mb-6 lg:mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg transition-colors flex items-center text-sm sm:text-base ${
                  selectedCategory === category.id 
                    ? 'bg-coffee-dark text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                }`}
              >
                {category.icon}
                <span className="ml-1 sm:ml-2">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Список страв */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {searchedItems.map(item => {
              const itemQuantity = getItemQuantity(item.id);
              
              return (
                <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-lg sm:hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Бейдж для популярних страв */}
                  {item.isPopular && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 flex items-center">
                      <Star size={8} className="mr-1" fill="white" />
                      Популярне
                    </div>
                  )}
                  
                  {/* Зображення страви */}
                  <div className="h-32 sm:h-40 md:h-48 overflow-hidden relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80';
                      }}
                    />
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 bg-white/90 backdrop-blur-sm text-coffee-dark font-bold text-sm sm:text-lg px-2 py-1 rounded-lg">
                      {item.price} грн
                    </div>
                  </div>
                  
                  {/* Інформація про страву */}
                  <div className="p-3 sm:p-4 md:p-5">
                    <div className="mb-1 sm:mb-2">
                      <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 line-clamp-1">{item.name}</h3>
                    </div>
                    
                    <div className="flex items-center mb-2 sm:mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 bg-coffee-light text-coffee-dark rounded-full text-xs sm:text-sm font-medium">
                        {getCategoryIcon(item.category)}
                        {item.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2 sm:mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm md:text-base min-h-[2.5rem] sm:min-h-[3rem]">
                      {item.description}
                    </p>
                    
                    {item.ingredients && item.ingredients.length > 0 && (
                      <div className="mb-2 sm:mb-3">
                        <p className="text-xs text-gray-500 mb-1">Склад:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.ingredients.slice(0, 2).map((ingredient, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {ingredient}
                            </span>
                          ))}
                          {item.ingredients.length > 2 && (
                            <span className="text-xs text-gray-500">+{item.ingredients.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {itemQuantity > 0 ? (
                      <div className="flex items-center justify-between pt-1 sm:pt-2">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            <Minus size={14} className="sm:w-4 sm:h-4" />
                          </button>
                          <span className="font-bold text-base sm:text-lg w-6 sm:w-8 text-center">{itemQuantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-coffee-light text-coffee-dark rounded-lg hover:bg-coffee hover:text-white"
                          >
                            <Plus size={14} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        <span className="font-bold text-coffee-dark text-sm sm:text-base md:text-lg">
                          {item.price * itemQuantity} грн
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="w-full bg-coffee-dark text-white py-2 sm:py-3 rounded-lg font-medium sm:font-semibold hover:bg-coffee transition-colors flex items-center justify-center text-xs sm:text-sm md:text-base"
                      >
                        <ShoppingCart size={14} className="mr-1 sm:mr-2" />
                        Додати до кошика
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Повідомлення якщо нічого не знайдено */}
          {searchedItems.length === 0 && (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl sm:rounded-2xl shadow mt-4">
              <Coffee size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Нічого не знайдено</h3>
              <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base px-4">Спробуйте змінити категорію або пошуковий запит</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="inline-block bg-coffee-dark text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-coffee transition-colors text-sm sm:text-base"
              >
                Показати все меню
              </button>
            </div>
          )}

          {/* Інформація про доставку */}
          <div className="mt-8 sm:mt-12 bg-gradient-to-r from-coffee-light to-coffee-dark text-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Замовляйте з доставкою!</h3>
                <p className="mb-3 sm:mb-4 text-sm sm:text-base">
                  Усі страви з нашого меню доступні для замовлення з доставкою додому або в офіс.
                </p>
                <Link
                  to="/delivery"
                  className="inline-block bg-white text-coffee-dark px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm sm:text-base"
                >
                  Перейти до доставки
                </Link>
              </div>
              <div>
                <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Переваги:</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li className="flex items-center text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    Свіжі продукти щодня
                  </li>
                  <li className="flex items-center text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    Швидка доставка 30-60 хв
                  </li>
                  <li className="flex items-center text-xs sm:text-sm">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-2 sm:mr-3 flex-shrink-0"></div>
                    Безкоштовна доставка від 300 грн
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Кошик (модальне вікно) */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center p-2 sm:p-4 md:items-center">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden mt-4 sm:mt-0">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-coffee-dark flex items-center">
                  <ShoppingCart size={20} className="mr-2" />
                  Ваше замовлення
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                {cartItems.length} позицій, {cartItemCount} шт.
              </p>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[50vh]">
              {cartItems.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                  <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Кошик порожній</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="bg-coffee-dark text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-coffee transition-colors text-sm sm:text-base"
                  >
                    Продовжити вибір
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center border-b pb-3 sm:pb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-3 sm:ml-4 flex-grow min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{item.name}</h4>
                        <p className="text-coffee-dark font-bold text-sm sm:text-base">{item.price} грн</p>
                      </div>
                      <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-200 rounded-full hover:bg-gray-300"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-semibold w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-coffee-light text-coffee-dark rounded-full hover:bg-coffee hover:text-white"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                  <span className="text-gray-600 text-sm sm:text-base">Позицій:</span>
                  <span className="font-semibold text-sm sm:text-base">{cartItems.length}</span>
                </div>
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                  <span className="text-gray-600 text-sm sm:text-base">Кількість:</span>
                  <span className="font-semibold text-sm sm:text-base">{cartItemCount} шт.</span>
                </div>
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-base sm:text-lg font-semibold">Загальна сума:</span>
                  <span className="text-xl sm:text-2xl font-bold text-coffee-dark">{cartTotal} грн</span>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleClearCart}
                    className="flex-1 border border-red-500 text-red-500 py-2 sm:py-3 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm sm:text-base"
                  >
                    Очистити
                  </button>
                  <button
                    onClick={handleOrder}
                    className="flex-1 bg-coffee-dark text-white py-2 sm:py-3 rounded-lg font-semibold hover:bg-coffee transition-colors text-sm sm:text-base"
                  >
                    Оформити
                  </button>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-full mt-2 border border-gray-300 text-gray-700 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Продовжити вибір
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Мобільна плаваюча кнопка кошика */}
      {cartItemCount > 0 && (
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-coffee-dark text-white w-14 h-14 rounded-full shadow-lg hover:bg-coffee transition-colors flex items-center justify-center"
          >
            <ShoppingCart size={24} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cartItemCount}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;