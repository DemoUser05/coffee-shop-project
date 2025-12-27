// components/common/Card.tsx
import React from 'react';
import { Star } from 'lucide-react';

interface CardProps {
  title: string;
  description: string;
  price?: string;
  rating?: number;
  image?: string;
  type: 'dish' | 'service' | 'testimonial';
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string; // Додаємо className
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  price,
  rating,
  image,
  type,
  children,
  action,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 h-full flex flex-col ${className}`}>
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {type === 'dish' && price && (
            <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full font-bold">
              {price}
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 sm:p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg sm:text-xl font-bold text-coffee-dark">{title}</h3>
          {rating !== undefined && (
            <div className="flex items-center">
              <Star size={16} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
              <span className="ml-1 font-semibold text-sm sm:text-base">{rating}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 mb-3 sm:mb-4 flex-grow text-sm sm:text-base">{description}</p>
        
        {children && (
          <div className="mb-3 sm:mb-4">
            {children}
          </div>
        )}
        
        {action && (
          <div className="mt-auto pt-3 sm:pt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;