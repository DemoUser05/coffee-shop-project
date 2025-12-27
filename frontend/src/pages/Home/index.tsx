import React from "react";
import { Link } from "react-router-dom";
import { Coffee, Calendar, Truck, Star, Clock, MapPin, Users, Award, Heart, ChevronRight, Phone, Shield } from "lucide-react";
import Card from "../../components/common/Card";

const HomePage: React.FC = () => {
  const popularDishes = [
    { 
      id: 1, 
      name: "Еспресо", 
      price: "65 грн", 
      description: "Класична італійська кава",
      rating: 5,
      image: "/images/espresso.png"
    },
    { 
      id: 2, 
      name: "Капучино", 
      price: "95 грн", 
      description: "З ніжною молочною піною",
      rating: 5,
      image: "/images/capuccino.png"
    },
    { 
      id: 3, 
      name: "Лате", 
      price: "90 грн", 
      description: "З ароматним сиропом на вибір",
      rating: 5,
      image: "/images/late.png"
    },
    { 
      id: 4, 
      name: "Чізкейк", 
      price: "115 грн", 
      description: "Нью-Йоркський з полуницею",
      rating: 5,
      image: "/images/cheesecake4.jpg"
    },
  ];

  const features = [
    { icon: <Award size={24} className="sm:w-8 sm:h-8" />, title: "Найкраща якість", description: "Відбірне кавове зерно з Ефіопії, Бразилії та Колумбії" },
    { icon: <Clock size={24} className="sm:w-8 sm:h-8" />, title: "Швидке обслуговування", description: "Готуємо каву не більше 5 хвилин" },
    { icon: <MapPin size={24} className="sm:w-8 sm:h-8" />, title: "Зручне розташування", description: "В самому центрі міста, поруч з парком" },
    { icon: <Users size={24} className="sm:w-8 sm:h-8" />, title: "Затишна атмосфера", description: "Ідеальне місце для роботи та зустрічей" },
  ];

  const testimonials = [
    { name: "Олена Петренко", text: "Найсмачніша кава в місті! Завжди заходжу перед роботою.", rating: 5 },
    { name: "Максим Іванов", text: "Ідеальне місце для бізнес-зустрічей. Швидкий Wi-Fi та чудова кава.", rating: 5 },
    { name: "Анна Коваль", text: "Десерти просто божественні! Особливо раджу чізкейк.", rating: 4 },
  ];

  const specialOffers = [
    { title: "Знижка 20%", description: "На всі напої до 10:00 ранку", code: "EARLYBIRD" },
    { title: "Безкоштовна кава", description: "Купуйте 5 кав - 6 безкоштовно", code: "COFFEELOVER" },
    { title: "Безкоштовна доставка", description: "При замовленні від 300 грн", code: "FREEDELIVERY" },
  ];

  return (
    <div className="min-h-screen">
      {/* Герой секція з слайдером */}
      <div className="relative bg-gradient-to-r from-coffee-dark via-coffee to-coffee-light text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4 sm:mb-6 leading-tight">
              Насолоджуйтесь справжньою кавою в
              <div className="mt-2 sm:mt-3 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-accent">
                HOLY COW
              </div>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 opacity-90 px-2 sm:px-0">
              Де кожна чашка розповідає свою унікальну історію смаку
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-0">
              <Link 
                to="/menu" 
                className="inline-flex items-center justify-center bg-accent hover:bg-accent-light text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                <Coffee className="mr-2 sm:mr-3" size={20} />
                Замовити онлайн
              </Link>
              <Link 
                to="/booking" 
                className="inline-flex items-center justify-center bg-transparent border-2 border-white hover:bg-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all"
              >
                <Calendar className="mr-2 sm:mr-3" size={20} />
                Забронювати столик
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Особливості */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-coffee-dark mb-3 sm:mb-4">
              Чому обирають нас
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Ми дбаємо про кожну деталь, щоб ваша кава була ідеальною
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-4 sm:p-6 rounded-xl bg-gray-50 hover:bg-coffee/5 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-coffee/10 text-coffee mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm sm:text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Популярні страви */}
      <div className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-coffee-dark">
                Найпопулярніші позиції
              </h2>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Ті страви, які обирають наші гості найчастіше
              </p>
            </div>
            <Link 
              to="/menu" 
              className="text-coffee hover:text-coffee-dark font-semibold flex items-center text-sm sm:text-base"
            >
              Дивитися все меню
              <ChevronRight className="ml-1 sm:ml-2" size={18} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {popularDishes.map((dish) => (
              <Card
                key={dish.id}
                title={dish.name}
                description={dish.description}
                price={dish.price}
                rating={dish.rating}
                image={dish.image}
                type="dish"
                action={
                  <button className="btn-primary w-full mt-3 sm:mt-4 text-sm sm:text-base py-2 sm:py-3">
                    Додати до кошика
                  </button>
                }
                className="h-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Спеціальні пропозиції */}
      <div className="py-12 sm:py-16 bg-gradient-to-r from-accent/10 to-coffee/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-coffee-dark mb-3 sm:mb-4">
              Спеціальні пропозиції
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">Скористайтеся нашими акціями та знижками</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {specialOffers.map((offer, index) => (
              <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div>
                    <span className="inline-block bg-accent text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 rounded-full mb-2">
                      Акція
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-coffee-dark">{offer.title}</h3>
                  </div>
                  <Heart className="text-red-400 flex-shrink-0" size={20} />
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{offer.description}</p>
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-500 mb-1">Промокод:</p>
                  <p className="text-lg sm:text-xl font-mono font-bold text-coffee-dark">{offer.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Відгуки клієнтів */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-coffee-dark mb-3 sm:mb-4">
              Що кажуть наші клієнти
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">Найкраща нагорода для нас - ваші посмішки</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 sm:p-6 lg:p-8 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-coffee/10 flex items-center justify-center text-coffee font-bold text-lg sm:text-xl mr-3 sm:mr-4 flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base truncate">{testimonial.name}</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          className={`${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} flex-shrink-0`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic text-sm sm:text-base">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA секція */}
      <div className="py-12 sm:py-16 md:py-20 bg-coffee-dark text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Готові насолодитись ідеальною кавою?
          </h2>
          <p className="text-lg sm:text-xl opacity-90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2 sm:px-0">
            Приходьте до нас сьогодні або замовить онлайн з доставкою додому
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center px-2 sm:px-0">
            <Link 
              to="/menu" 
              className="inline-flex items-center justify-center bg-white text-coffee-dark hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all transform hover:scale-105"
            >
              <Coffee className="mr-2 sm:mr-3" size={20} />
              Замовити з доставкою
            </Link>
            <Link 
              to="/booking" 
              className="inline-flex items-center justify-center bg-transparent border-2 border-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg transition-all"
            >
              <Calendar className="mr-2 sm:mr-3" size={20} />
              Забронювати онлайн
            </Link>
          </div>
          
          {/* Статистика */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">1500+</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Щасливих клієнтів</div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">50+</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Видів кави</div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">45</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Хвилин доставка</div>
            </div>
            <div className="p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl font-bold">4.9</div>
              <div className="text-gray-300 text-xs sm:text-sm md:text-base">Середній рейтинг</div>
            </div>
          </div>
          
          {/* Додаткові переваги */}
          <div className="mt-8 sm:mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Truck className="text-accent" size={20} />
                <span className="text-sm sm:text-base">Безкоштовна доставка від 300 грн</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Phone className="text-accent" size={20} />
                <span className="text-sm sm:text-base">Цілодобова підтримка</span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <Shield className="text-accent" size={20} />
                <span className="text-sm sm:text-base">Гарантія якості</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;