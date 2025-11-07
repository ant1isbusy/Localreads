import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config';
import StarRating from './StarRating';

const BookCard = ({ book, onClick, onRemove, onAddToCollection }) => {
    const [contextMenu, setContextMenu] = useState(null);
    const longPressTimer = useRef(null);
    const [isLongPressing, setIsLongPressing] = useState(false);

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const menuWidth = 180;
        const menuHeight = 100;
        const padding = 8;

        let x = e.clientX;
        let y = e.clientY;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - padding;
        }

        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - padding;
        }

        if (x < padding) {
            x = padding;
        }

        if (y < padding) {
            y = padding;
        }

        setContextMenu({ x, y });
    };

    const handleTouchStart = (e) => {
        setIsLongPressing(false);
        longPressTimer.current = setTimeout(() => {
            setIsLongPressing(true);
            const touch = e.touches[0];

            const menuWidth = 180;
            const menuHeight = 100;
            const padding = 8;

            let x = touch.clientX;
            let y = touch.clientY;

            if (x + menuWidth > window.innerWidth) {
                x = window.innerWidth - menuWidth - padding;
            }

            if (y + menuHeight > window.innerHeight) {
                y = window.innerHeight - menuHeight - padding;
            }

            if (x < padding) {
                x = padding;
            }

            if (y < padding) {
                y = padding;
            }

            setContextMenu({ x, y });
        }, 500);
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleTouchMove = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
        }
    };

    const handleClick = (e) => {
        if (contextMenu) {
            setContextMenu(null);
        } else if (!isLongPressing) {
            onClick(book);
        }
        setIsLongPressing(false);
    };

    const closeContextMenu = () => {
        setContextMenu(null);
    };

    React.useEffect(() => {
        const handleClickOutside = () => setContextMenu(null);
        if (contextMenu) {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
                document.removeEventListener('touchstart', handleClickOutside);
            };
        }
    }, [contextMenu]);

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
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${book.status === 'finished'
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

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[180px]"
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            onAddToCollection?.(book);
                            closeContextMenu();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to Collection
                    </button>
                    <button
                        onClick={() => {
                            onRemove?.(book);
                            closeContextMenu();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove from Library
                    </button>
                </div>
            )}
        </>
    );
};

export default BookCard;