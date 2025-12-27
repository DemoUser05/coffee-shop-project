// frontend/src/pages/Profile/MyReviews.tsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { reviewApi, Review, UpdateReviewData } from '../../services/reviewService';
import { Star, MessageSquare, User, Calendar, Trash2, Edit, Coffee, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyReviewsPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editData, setEditData] = useState<UpdateReviewData>({ rating: 5, comment: '' });

  useEffect(() => {
    if (user) {
      fetchMyReviews();
    }
  }, [user]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const response = await reviewApi.getUserReviews(user.uid);
      
      if (response.success && response.data) {
        setReviews(response.data);
        console.log('✅ Мої відгуки:', response.data.length);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('❌ Помилка завантаження моїх відгуків:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей відгук?')) return;
    
    try {
      const result = await reviewApi.deleteReview(reviewId);
      if (result.success) {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
        alert('Відгук успішно видалено');
      } else {
        alert(result.error || 'Помилка при видаленні відгуку');
      }
    } catch (error) {
      alert('Помилка при видаленні відгуку');
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review._id);
    setEditData({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleSaveEdit = async (reviewId: string) => {
    if (!editData.comment || editData.comment.length < 10) {
      alert('Коментар має містити мінімум 10 символів');
      return;
    }

    try {
      const result = await reviewApi.updateReview(reviewId, editData);
      if (result.success && result.data) {
        setReviews(prev => prev.map(r => 
          r._id === reviewId ? result.data as Review : r
        ));
        setEditingReview(null);
        alert('Відгук успішно оновлено');
      } else {
        alert(result.error || 'Помилка при оновленні відгуку');
      }
    } catch (error) {
      alert('Помилка при оновленні відгуку');
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? "button" : undefined}
        onClick={interactive && onChange ? () => onChange(i + 1) : undefined}
        className={interactive ? "hover:scale-110 transition-transform p-1" : ""}
      >
        <Star
          size={interactive ? 28 : 20}
          className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
        />
      </button>
    ));
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-coffee-dark">Мої відгуки</h1>
          <div className="text-center py-12">
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">Необхідна авторизація</h3>
            <p className="text-gray-600 mb-6">Увійдіть, щоб переглянути свої відгуки</p>
            <Link to="/auth" className="btn-primary">Увійти</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-coffee-dark">Мої відгуки</h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Завантаження...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-coffee-dark">Мої відгуки</h1>
          <div className="flex space-x-4">
            <Link
              to="/reviews"
              className="px-4 py-2 bg-coffee-dark text-white rounded-lg hover:bg-coffee transition-colors"
            >
              Всі відгуки
            </Link>
            <button
              onClick={fetchMyReviews}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Оновити
            </button>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg">
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold mb-2">У вас ще немає відгуків</h3>
            <p className="text-gray-600 mb-6">Залиште перший відгук на сторінці всіх відгуків!</p>
            <Link
              to="/reviews"
              className="inline-block bg-coffee-dark text-white px-6 py-3 rounded-lg font-medium hover:bg-coffee transition-colors"
            >
              Перейти до відгуків
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-coffee-light rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <MessageSquare className="text-coffee-dark mr-3" size={24} />
                <p className="text-coffee-dark">
                  Ви залишили <span className="font-bold">{reviews.length}</span> відгуків
                </p>
              </div>
            </div>

            {reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-coffee">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-coffee-light rounded-full flex items-center justify-center">
                      <User size={24} className="text-coffee-dark" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{review.userName}</h3>
                      <p className="text-gray-600 text-sm">{review.userEmail}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      {editingReview === review._id ? (
                        <div className="flex items-center">
                          {renderStars(editData.rating || 5, true, (rating) => 
                            setEditData(prev => ({ ...prev, rating }))
                          )}
                          <span className="ml-2 font-medium">{(editData.rating || 5)}/5</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                          <span className="ml-2 font-medium">{review.rating}/5</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {editingReview === review._id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(review._id)}
                            className="text-green-500 hover:text-green-700 p-2"
                            title="Зберегти"
                          >
                            <Check size={20} />
                          </button>
                          <button
                            onClick={() => setEditingReview(null)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Скасувати"
                          >
                            <X size={20} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-blue-500 hover:text-blue-700 p-2"
                            title="Редагувати"
                          >
                            <Edit size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Видалити"
                          >
                            <Trash2 size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="inline-flex items-center px-3 py-1 bg-coffee-light text-coffee-dark rounded-full text-sm font-medium mb-3">
                    <Coffee size={14} className="mr-2" />
                    {review.dishName}
                  </div>
                  
                  {editingReview === review._id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editData.comment || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, comment: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee"
                        rows={4}
                        placeholder="Ваш коментар..."
                        maxLength={500}
                        minLength={10}
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Мінімум 10 символів</span>
                        <span>{(editData.comment || '').length}/500</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar size={16} className="mr-2" />
                    {formatDate(review.date)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;