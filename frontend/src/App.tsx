import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/store';
import { setUser, setLoading, AppUser } from './store/slices/authSlice';
import { onAuthStateChange } from './services/authService';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/Home';
import MenuPage from './pages/Menu';
import BookingPage from './pages/Booking';
import ReviewsPage from './pages/Reviews';
import AuthPage from './pages/Auth';
import ProfilePage from './pages/Profile';
import MyReviewsPage from './pages/Profile/MyReviews';
import BookingsPage from './pages/Profile/BookingsPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfileOrdersPage from './pages/Profile/ProfileOrdersPage';
import OrderDetailsPage from './pages/Profile/OrderDetailsPage';
import CartAuthSync from './components/CartAuthSync';

// Компонент для ініціалізації авторизації
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLoading(true));
    
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        const appUser: AppUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        dispatch(setUser(appUser));
      } else {
        dispatch(setUser(null));
      }
      
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 500);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
};

function AppContent() {
  return (
    <>
      {/* Компонент синхронізації кошика */}
      <CartAuthSync />
      
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/reviews" element={<MyReviewsPage />} />
              <Route path="/profile/bookings" element={<BookingsPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/profile/orders" element={<ProfileOrdersPage />} />
              <Route path="/profile/orders/:id" element={<OrderDetailsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <AppContent />
      </AuthInitializer>
    </Provider>
  );
}

export default App;