import React, { useState } from 'react';

const StarRating = ({ rating = 0, onRatingChange, size = 'md', readonly = false }) => {
    const [hover, setHover] = useState(null);

    const sizeClasses = {
        small: 'w-3.5 h-3.5',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const textSizeClasses = {
        small: 'text-xs',
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
    };

    const handleClick = (value) => {
        if (!readonly) {
            onRatingChange(value === rating ? 0 : value);
        }
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
                            ${readonly ? 'cursor-default' : 'transition-transform hover:scale-110 cursor-pointer'}
                            focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2
                            rounded mr-0.5
                        `}
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => !readonly && setHover(value)}
                        onMouseLeave={() => !readonly && setHover(null)}
                        aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
                        disabled={readonly}
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

            {rating > 0 && (
                <span className={`ml-1.5 ${textSizeClasses[size]} text-gray-700 font-medium`}>
                    {rating}/5
                </span>
            )}
        </div>
    );
};

export default StarRating;