import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { ShoppingCart, User, Home, Coffee as CoffeeIcon, Calendar, MessageSquare } from 'lucide-react';


const Header: React.FC = () => {
  const { totalItems } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  // Показуємо скелетон під час завантаження
  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-coffee-dark text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
              <div>
                <div className="h-6 w-40 bg-gray-700 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative p-2">
                <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="p-2">
                <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-coffee-dark text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Логотип з зображенням */}
          {/* Змініть цей блок */}
          <Link to="/" className="flex items-center space-x-4 group header-logo">
            {/* Контейнер для круглого лого */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-accent transition-colors shadow-lg">
              {/* Ваше лого */}
              <img 
                src="/images/logo3.png" 
                alt="Логотип кав'ярні Затишок"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Назва */}
            <div className="ml-2"> {/* Змінили space-x-4 на ml-2 */}
              <h1 className="text-xl md:text-2xl font-bold font-serif italic">
                Holy Cow
              </h1>
              <p className="text-coffee-light text-xs md:text-sm opacity-80">
                о-му-ніти як смачно!
              </p>
            </div>
          </Link>

          {/* Навігація */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link 
              to="/" 
              className="nav-link hover:text-accent transition-colors flex items-center"
            >
              <Home size={18} className="mr-2 transition-transform nav-icon" />
              <span className="nav-text">Головна</span>
            </Link>
            <Link 
              to="/menu" 
              className="nav-link hover:text-accent transition-colors flex items-center"
            >
              <CoffeeIcon size={18} className="mr-2 transition-transform nav-icon" />
              <span className="nav-text">Меню</span>
            </Link>
            <Link 
              to="/booking" 
              className="nav-link hover:text-accent transition-colors flex items-center"
            >
              <Calendar size={18} className="mr-2 transition-transform nav-icon" />
              <span className="nav-text">Бронювання</span>
            </Link>
            <Link 
              to="/reviews" 
              className="nav-link hover:text-accent transition-colors flex items-center"
            >
              <MessageSquare size={18} className="mr-2 transition-transform nav-icon" />
              <span className="nav-text">Відгуки</span>
            </Link>
            {isAuthenticated && (
              <Link 
                to="/profile" 
                className="nav-link hover:text-accent transition-colors flex items-center"
              >
                <User size={18} className="mr-2 transition-transform nav-icon" />
                <span className="nav-text">Профіль</span>
              </Link>
            )}
          </nav>

          {/* Іконки та профіль */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Кошик */}
            <Link 
              to="/checkout" 
              className="relative p-2 hover:bg-coffee/20 rounded-full transition-all cart-button"
              title="Кошик"
            >
              <ShoppingCart size={24} className="transition-transform cart-icon" />
              {totalItems > 0 && (
                <>
                  <span className="cart-badge absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                  {/* Анімована підсвітка */}
                  <span className="absolute inset-0 rounded-full bg-accent/20 opacity-0 cart-ping"></span>
                </>
              )}
              {/* Тултіп */}
              <div className="cart-tooltip absolute top-full right-0 mt-2 w-32 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 transition-opacity pointer-events-none z-50">
                Кошик та замовлення
              </div>
            </Link>
            
            {/* Профіль */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 profile-container">
                <span className="hidden md:inline text-sm font-medium">
                  Привіт, {user?.displayName?.split(' ')[0] || 'Користувач'}!
                </span>
                <Link 
                  to="/profile" 
                  className="p-2 hover:bg-coffee/20 rounded-full transition-all profile-button"
                  title="Мій профіль"
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/30 profile-image">
                    {user?.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'Профіль'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-coffee to-accent flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="p-2 hover:bg-coffee/20 rounded-full transition-all auth-button"
                title="Увійти"
              >
                <User size={24} className="transition-transform auth-icon" />
                {/* Тултіп */}
                <div className="auth-tooltip absolute top-full right-0 mt-2 w-20 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 transition-opacity pointer-events-none z-50">
                  Увійти
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Мобільна навігація */}
        <div className="mt-4 flex md:hidden justify-around bg-coffee/30 rounded-lg py-2">
          <Link 
            to="/" 
            className="text-xs hover:text-accent flex flex-col items-center transition-colors mobile-nav-item"
          >
            <Home size={16} />
            <span className="mt-1">Головна</span>
          </Link>
          <Link 
            to="/menu" 
            className="text-xs hover:text-accent flex flex-col items-center transition-colors mobile-nav-item"
          >
            <CoffeeIcon size={16} />
            <span className="mt-1">Меню</span>
          </Link>
          <Link 
            to="/booking" 
            className="text-xs hover:text-accent flex flex-col items-center transition-colors mobile-nav-item"
          >
            <Calendar size={16} />
            <span className="mt-1">Бронювання</span>
          </Link>
          <Link 
            to="/reviews" 
            className="text-xs hover:text-accent flex flex-col items-center transition-colors mobile-nav-item"
          >
            <MessageSquare size={16} />
            <span className="mt-1">Відгуки</span>
          </Link>
          <Link 
            to="/checkout" 
            className="text-xs hover:text-accent flex flex-col items-center transition-colors mobile-nav-item relative"
          >
            <ShoppingCart size={16} />
            <span className="mt-1">Кошик</span>
            {totalItems > 0 && (
              <span className="mobile-cart-badge absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;