import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { reviewApi, Review, CreateReviewData } from '../../services/reviewService';
import { Star, MessageSquare, User, Calendar, Trash2, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ReviewsPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState<CreateReviewData>({
    dishId: 'general',
    dishName: 'Кав\'ярня в цілому',
    rating: 5,
    comment: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await reviewApi.getAllReviews();
      
      if (response.success && response.data) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження відгуків:', error);
      setError('Не вдалося завантажити відгуки');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setError('Будь ласка, увійдіть, щоб залишити відгук');
      return;
    }

    if (!newReview.comment.trim() || newReview.comment.length < 10) {
      setError('Коментар має містити мінімум 10 символів');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      
      const result = await reviewApi.createReview(newReview, user);
      
      if (result.success && result.data) {
        setReviews(prev => [result.data as Review, ...prev]);
        setNewReview(prev => ({ ...prev, rating: 5, comment: '' }));
        
        alert(result.message || 'Відгук успішно додано!');
        fetchReviews();
      } else {
        setError(result.error || 'Помилка при додаванні відгуку');
      }
    } catch (error: any) {
      setError(error.message || 'Помилка при додаванні відгуку');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей відгук?')) {
      return;
    }

    try {
      const result = await reviewApi.deleteReview(reviewId);
      if (result.success) {
        setReviews(prev => prev.filter(review => review._id !== reviewId));
        alert('Відгук успішно видалено');
      } else {
        alert(result.error || 'Помилка при видаленні відгуку');
      }
    } catch (error) {
      alert('Помилка при видаленні відгуку');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Дата невідома';
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeMap = {
      sm: 16,
      md: 20,
      lg: 24
    };
    
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={sizeMap[size]}
        className={`${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} flex-shrink-0`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-8 text-coffee-dark">Відгуки</h1>
          <div className="text-center py-8 md:py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження відгуків...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Мобільна навігація */}
      <div className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-coffee-dark"
          >
            <ChevronLeft size={24} />
            <span className="ml-1">Назад</span>
          </button>
          <h1 className="text-xl font-bold text-coffee-dark">Відгуки</h1>
          <div className="w-10"></div> {/* Для балансу */}
        </div>
      </div>

      <div className="p-4 md:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Заголовок для десктопу */}
          <div className="hidden md:flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-coffee-dark">
              Відгуки клієнтів
            </h1>
            <div className="flex flex-wrap gap-3">
              {isAuthenticated && (
                <Link
                  to="/profile/reviews"
                  className="px-4 py-2 bg-coffee-light text-coffee-dark rounded-lg hover:bg-coffee transition-colors text-sm lg:text-base"
                >
                  Мої відгуки
                </Link>
              )}
              <button
                onClick={fetchReviews}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm lg:text-base"
              >
                Оновити
              </button>
            </div>
          </div>

          {/* Форма для відгуку */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8 lg:mb-12">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
              <MessageSquare className="mr-2 sm:mr-3 text-coffee" size={20} />
              {isAuthenticated ? 'Залишити відгук про кав\'ярню' : 'Увійдіть, щоб залишити відгук'}
            </h2>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
                {error}
              </div>
            )}

            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
                    Ваша оцінка кав'ярні
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                          className="p-1 hover:scale-110 transition-transform"
                          aria-label={`Оцінити на ${star} зірок`}
                        >
                          <Star
                            size={28}
                            className={
                              star <= newReview.rating 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-lg font-medium ml-0 sm:ml-4">
                      {newReview.rating}/5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
                    Ваш коментар про кав'ярню
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee h-32 sm:h-40 resize-none text-sm sm:text-base"
                    placeholder="Поділіться своїми враженнями від кав'ярні в цілому..."
                    maxLength={500}
                    minLength={10}
                  />
                  <div className="flex flex-col sm:flex-row justify-between mt-2 text-xs sm:text-sm text-gray-500 gap-1">
                    <span>Мінімум 10 символів</span>
                    <span>{newReview.comment.length}/500</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || newReview.comment.length < 10}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-colors text-sm sm:text-base ${
                    submitting || newReview.comment.length < 10
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-coffee-dark hover:bg-coffee'
                  }`}
                >
                  {submitting ? 'Відправка...' : 'Опублікувати відгук'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">Необхідна авторизація</h3>
                <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                  Тільки авторизовані користувачі можуть залишати відгуки.
                  Увійдіть, щоб поділися своїми враженнями про нашу кав'ярню!
                </p>
                <Link
                  to="/auth"
                  className="inline-block bg-coffee-dark text-white px-6 py-3 rounded-lg font-medium hover:bg-coffee transition-colors text-sm sm:text-base"
                >
                  Увійти в акаунт
                </Link>
              </div>
            )}
          </div>

          {/* Список всіх відгуків */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-coffee-dark mb-6">
              Відгуки клієнтів ({reviews.length})
            </h2>

            {reviews.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-lg">
                <MessageSquare size={48} className="mx-auto text-gray-300 mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold mb-2">Ще немає відгуків</h3>
                <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                  Будьте першим, хто залишить відгук про нашу кав'ярню!
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {reviews.map((review) => (
                  <div
                    key={review._id}
                    className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 ${
                      user && review.userId === user.uid 
                        ? 'border-coffee-dark' 
                        : 'border-coffee-light'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:gap-4 mb-4">
                      {/* Верхня частина: користувач та зірки */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-coffee-light rounded-full flex items-center justify-center flex-shrink-0">
                            <User size={20} className="text-coffee-dark" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg truncate">
                              {review.userName}
                              {user && review.userId === user.uid && (
                                <span className="ml-2 text-xs sm:text-sm font-normal text-coffee-dark">
                                  (Ваш відгук)
                                </span>
                              )}
                            </h3>
                            <p className="text-gray-600 text-xs sm:text-sm truncate">
                              {review.userEmail}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
                          <div className="flex items-center">
                            {renderStars(review.rating, 'sm')}
                            <span className="ml-2 font-medium text-sm sm:text-base">
                              {review.rating}/5
                            </span>
                          </div>
                          
                          {user && review.userId === user.uid && (
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-500 hover:text-red-700 p-1 sm:p-2 ml-2"
                              title="Видалити відгук"
                              aria-label="Видалити відгук"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Коментар */}
                      <div className="mb-3 sm:mb-4">
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                          {review.comment}
                        </p>
                      </div>
                    </div>

                    {/* Нижня частина: дата та блюдо */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 sm:pt-4 border-t border-gray-100 gap-2">
                      <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                        <Calendar size={14} className="mr-2 flex-shrink-0" />
                        {formatDate(review.date)}
                      </div>
                      {review.dishName && review.dishName !== 'Кав\'ярня в цілому' && (
                        <div className="inline-block px-3 py-1 bg-coffee-light text-coffee-dark rounded-full text-xs sm:text-sm font-medium truncate max-w-[200px] sm:max-w-none">
                          Про: {review.dishName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Мобільна кнопка "Мої відгуки" */}
          {isAuthenticated && (
            <div className="md:hidden fixed bottom-6 right-6 z-20">
              <Link
                to="/profile/reviews"
                className="flex items-center justify-center bg-coffee-dark text-white rounded-full w-14 h-14 shadow-lg hover:bg-coffee transition-colors"
                title="Мої відгуки"
              >
                <User size={24} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;