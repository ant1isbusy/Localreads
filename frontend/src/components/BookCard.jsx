import React, { useState, useRef } from 'react';
import StarRating from './StarRating';
import BookContextMenu from './BookContextMenu';
import { API_BASE_URL } from '../config';

const BookCard = ({ book, onClick, onRemove, onAddToCollection }) => {
    const [contextMenu, setContextMenu] = useState(null);
    const longPressTimer = useRef(null);
    const touchStartPos = useRef(null);
    const preventClick = useRef(false);

    const handleContextMenu = (e) => {
        e.preventDefault();
        const menuWidth = 180;
        const menuHeight = 100;

        let x = e.clientX;
        let y = e.clientY;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }

        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        setContextMenu({ x, y });
    };

    const handleTouchStart = (e) => {
        preventClick.current = false;
        touchStartPos.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            time: Date.now()
        };

        longPressTimer.current = setTimeout(() => {
            const touch = e.touches[0];
            preventClick.current = true;

            const menuWidth = 180;
            const menuHeight = 100;

            let x = touch.clientX;
            let y = touch.clientY;

            if (x + menuWidth > window.innerWidth) {
                x = window.innerWidth - menuWidth - 10;
            }

            if (y + menuHeight > window.innerHeight) {
                y = window.innerHeight - menuHeight - 10;
            }

            setContextMenu({ x, y });
        }, 500);
    };

    const handleTouchEnd = (e) => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }

        if (contextMenu || preventClick.current) {
            e.preventDefault();
        }
    };

    const handleTouchMove = (e) => {
        if (touchStartPos.current) {
            const dx = e.touches[0].clientX - touchStartPos.current.x;
            const dy = e.touches[0].clientY - touchStartPos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 10) {
                if (longPressTimer.current) {
                    clearTimeout(longPressTimer.current);
                }
            }
        }
    };

    const handleClick = (e) => {
        if (preventClick.current || contextMenu) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick?.(book);
    };

    const closeContextMenu = () => {
        setContextMenu(null);
        setTimeout(() => {
            preventClick.current = false;
        }, 300);
    };

    return (
        <>
            <div
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                className="bg-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-200 hover:border-gray-300 p-4 select-none"
            >
                <div className="flex gap-4">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                        <div className="w-24 h-36 rounded overflow-hidden border border-gray-200">
                            {book.cover_path ? (
                                <img
                                    src={`${API_BASE_URL}/${book.cover_path}`}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold text-center px-2">
                                        {book.title.substring(0, 5)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Book Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-sans text-lg font-bold text-gray-900 truncate mb-1">
                            {book.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{book.author}</p>

                        {/* Rating */}
                        {book.rating_stars > 0 && (
                            <div className="mb-2">
                                <StarRating rating={book.rating_stars} size="md" readonly={true} />
                            </div>
                        )}

                        {/* Progress Bar */}
                        {book.progress > 0 && book.progress < 1 && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-800 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${book.progress * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {Math.round(book.progress * 100)}% complete
                                </p>
                            </div>
                        )}

                        {/* Status Badge */}
                        <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                book.status === 'finished'
                                    ? 'bg-green-100 text-green-800'
                                    : book.status === 'reading'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-gray-100 text-gray-800'
                            }`}>
                                {book.status === 'finished' ? 'Finished' : book.status === 'reading' ? 'Reading' : 'Unread'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <BookContextMenu
                book={book}
                position={contextMenu}
                onClose={closeContextMenu}
                onAddToCollection={onAddToCollection}
                onRemove={onRemove}
            />
        </>
    );
};

export default BookCard;