import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { setUser, setError, clearError, setLoading, AppUser } from '../../store/slices/authSlice';
import { 
  registerWithEmail, 
  loginWithEmail, 
  logoutUser,
  loginWithGoogle 
} from '../../services/authService';
import { Coffee, Mail, Lock, User as UserIcon } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localErrors[name]) {
      setLocalErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email обов\'язковий';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Невірний формат email';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль має бути не менше 6 символів';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Ім\'я обов\'язкове';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Паролі не співпадають';
      }
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    dispatch(setLoading(true));
    dispatch(clearError());

    try {
      let result;
      
      if (isLogin) {
        result = await loginWithEmail(formData.email, formData.password);
      } else {
        result = await registerWithEmail(formData.email, formData.password, formData.name);
      }

      if (result.success && result.user) {
        const appUser: AppUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || formData.name || 'Користувач',
          photoURL: result.user.photoURL || null,
        };
        dispatch(setUser(appUser));
        navigate('/');
      } else {
        dispatch(setError(result.error || 'Сталася помилка'));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Сталася помилка'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGoogleLogin = async () => {
    dispatch(setLoading(true));
    dispatch(clearError());
    
    try {
      const result = await loginWithGoogle();
      
      if (result.success && result.user) {
        dispatch(setUser(result.user));
        navigate('/');
      } else {
        dispatch(setError(result.error || 'Помилка при вході через Google'));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Помилка при вході через Google'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    dispatch(setLoading(true));
    try {
      const result = await logoutUser();
      if (result.success) {
        dispatch(setUser(null));
      } else {
        dispatch(setError(result.error || 'Помилка при виході'));
      }
    } catch (error: any) {
      dispatch(setError(error.message || 'Помилка при виході'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Якщо користувач вже авторизований
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-md">
          <div className="text-center mb-8">
            <Coffee size={64} className="mx-auto text-coffee mb-4" />
            <h1 className="text-3xl font-bold text-coffee-dark">Вітаємо, {user.displayName || 'Користувач'}!</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-coffee-light rounded-full flex items-center justify-center mx-auto mb-4">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon size={40} className="text-coffee-dark" />
                )}
              </div>
              <h2 className="text-xl font-bold mb-2">{user.displayName || 'Користувач'}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                Користувач
              </span>
            </div>

            <div className="space-y-4">
              <Link 
                to="/booking" 
                className="block w-full bg-coffee-dark text-white py-3 rounded-lg font-medium hover:bg-coffee transition-colors text-center"
              >
                Мої бронювання
              </Link>
              
              <Link 
                to="/reviews" 
                className="block w-full border border-coffee-dark text-coffee-dark py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
              >
                Мої відгуки
              </Link>
              
              <Link 
                to="/profile" 
                className="block w-full border border-coffee text-coffee py-3 rounded-lg font-medium hover:bg-coffee-light transition-colors text-center"
              >
                Повний профіль
              </Link>
              
              <button
                onClick={handleLogout}
                disabled={loading}
                className={`block w-full border border-red-500 text-red-500 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Виходимо...' : 'Вийти з акаунту'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-md">
        <div className="text-center mb-8">
          <Coffee size={64} className="mx-auto text-coffee mb-4" />
          <h1 className="text-3xl font-bold text-coffee-dark">
            {isLogin ? 'Вхід в акаунт' : 'Реєстрація'}
          </h1>
          <p className="text-gray-600">
            {isLogin 
              ? 'Увійдіть, щоб отримати доступ до всіх функцій' 
              : 'Створіть акаунт для бронювання та відгуків'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          {/* Кнопка Google */}
          <div className="mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {/* Іконка Google */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="font-medium">
                {loading ? 'Обробка...' : 'Продовжити з Google'}
              </span>
            </button>
          </div>

          {/* Роздільник */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">або через email</span>
            </div>
          </div>

          {/* Глобальна помилка */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  <UserIcon size={18} className="inline mr-2" />
                  Ім'я
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee ${
                    localErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Введіть ваше ім'я"
                />
                {localErrors.name && (
                  <p className="mt-1 text-sm text-red-500">{localErrors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                <Mail size={18} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee ${
                  localErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="email@example.com"
              />
              {localErrors.email && (
                <p className="mt-1 text-sm text-red-500">{localErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                <Lock size={18} className="inline mr-2" />
                Пароль
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee ${
                  localErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Мінімум 6 символів"
              />
              {localErrors.password && (
                <p className="mt-1 text-sm text-red-500">{localErrors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  <Lock size={18} className="inline mr-2" />
                  Підтвердження пароля
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee ${
                    localErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Повторіть пароль"
                />
                {localErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{localErrors.confirmPassword}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-coffee-dark hover:bg-coffee'
              }`}
            >
              {loading ? 'Обробка...' : (isLogin ? 'Увійти' : 'Зареєструватися')}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  dispatch(clearError());
                  setLocalErrors({});
                }}
                className="text-coffee-dark hover:text-coffee font-medium"
              >
                {isLogin 
                  ? 'Немає акаунту? Зареєструватися' 
                  : 'Вже є акаунт? Увійти'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Реєструючись, ви погоджуєтесь з нашими{' '}
              <a href="#" className="text-coffee-dark hover:underline">Умовами використання</a>
              {' '}та{' '}
              <a href="#" className="text-coffee-dark hover:underline">Політикою конфіденційності</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;