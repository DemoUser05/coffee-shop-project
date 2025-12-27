import React from 'react';
import { MapPin, Phone, Clock, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Контактна інформація */}
          <div>
            <h3 className="text-xl font-bold mb-4">Контакти</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={20} />
                <span>вул. Сахарова, 25, м. Львів</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={20} />
                <span>+38 (044) 123-45-67</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={20} />
                <span>info@coffee-shop.com</span>
              </div>
            </div>
          </div>

          {/* Години роботи */}
          <div>
            <h3 className="text-xl font-bold mb-4">Години роботи</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock size={20} />
                <div>
                  <p>Пн-Пт: 8:00 - 22:00</p>
                  <p>Сб-Нд: 9:00 - 23:00</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p>&copy; {new Date().getFullYear()} Кав'ярня "Holy Cow". Всі права захищені.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;