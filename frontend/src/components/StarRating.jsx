import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange, size = 'md' }) => {
    const [hover, setHover] = useState(null);

    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const handleClick = (value) => {
        onRatingChange(value === rating ? 0 : value);
    };

    return (
        <div className="flex items-center select-none">
            {[1, 2, 3, 4, 5].map((value) => {
                const filled = value <= (hover ?? rating);

                return (
                    <button
                        key={value}
                        type="button"
                        className={`
              ${sizeClasses[size]}
              transition-transform hover:scale-110
              focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
              rounded mr-1
            `}
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => setHover(value)}
                        onMouseLeave={() => setHover(null)}
                        aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
                    >
                        <svg
                            className={`w-full h-full ${filled ? 'text-amber-400' : 'text-gray-300'
                                } fill-current`}
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}

            <span className="ml-2 text-sm text-gray-700 font-medium">
                {rating > 0 ? `${rating}/5` : ''}
            </span>
        </div>
    );
};

export default StarRating;
