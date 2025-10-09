import React, { useState, useRef, useEffect } from 'react';

const StarRating = ({ rating, onRatingChange, size = 'md' }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [isTouchDragging, setIsTouchDragging] = useState(false);
    const [touchStartTime, setTouchStartTime] = useState(0);
    const [touchStartY, setTouchStartY] = useState(0);
    const starContainerRef = useRef(null);

    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    const handleClick = (stars) => {
        onRatingChange(stars);
    };

    const handleMouseEnter = (stars) => {
        setHoverRating(stars);
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        setTouchStartTime(Date.now());
        setTouchStartY(touch.clientY);
        setIsTouchDragging(false);
    };

    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const starContainer = starContainerRef.current;
        if (!starContainer) return;

        const deltaY = Math.abs(touch.clientY - touchStartY);
        const deltaX = Math.abs(touch.clientX - e.touches[0].clientX);

        // If significant vertical movement, treat as scroll and ignore
        if (deltaY > 10 && deltaY > deltaX) {
            setIsTouchDragging(false);
            return;
        }

        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration > 50 && deltaY < 15) {
            setIsTouchDragging(true);

            const rect = starContainer.getBoundingClientRect();
            const x = touch.clientX - rect.left;

            const cancelZoneWidth = rect.width / 5 * 0.2;

            if (x < cancelZoneWidth) {
                setHoverRating(0);
            } else {
                const starWidth = rect.width / 5;
                const starIndex = Math.floor((x - cancelZoneWidth) / starWidth) + 1;
                const clampedStar = Math.max(1, Math.min(5, starIndex));
                setHoverRating(clampedStar);
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (isTouchDragging) {
            if (hoverRating > 0) {
                onRatingChange(hoverRating);
            } else {
                onRatingChange(0);
            }
        }
        setIsTouchDragging(false);
        setHoverRating(0);
    };

    useEffect(() => {
        return () => {
            setIsTouchDragging(false);
        };
    }, []);

    return (
        <div
            ref={starContainerRef}
            className="flex items-center space-x-1 select-none relative touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);
                return (
                    <button
                        key={star}
                        type="button"
                        className={`${sizeClasses[size]} transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 rounded touch-pan-y`}
                        onClick={() => handleClick(star)}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                        <svg
                            className={`w-full h-full ${isFilled
                                    ? 'text-amber-400 fill-current'
                                    : 'text-gray-300 fill-current'
                                } ${isTouchDragging ? 'scale-105' : ''}`}
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                );
            })}
            <span className="ml-2 text-sm text-amber-700 font-medium">
                {rating > 0 ? `${rating}/5` : 'Not rated'}
            </span>
        </div>
    );
};

export default StarRating;