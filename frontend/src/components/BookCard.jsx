import React, { useState, useRef } from 'react';
import StarRating from './StarRating';
import { API_BASE_URL } from '../config';

const BookCard = ({ book, onClick, onRemove, onAddToCollection }) => {
    const [contextMenu, setContextMenu] = useState(null);
    const longPressTimer = useRef(null);
    const touchStartPos = useRef(null);
    const contextMenuRef = useRef(null);
    const preventClick = useRef(false);

    const handleContextMenu = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
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

            // Adjust if menu would go off right edge
            if (x + menuWidth > window.innerWidth) {
                x = window.innerWidth - menuWidth - 10;
            }

            // Adjust if menu would go off bottom edge
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

        // If context menu is open, prevent any click
        if (contextMenu || preventClick.current) {
            e.preventDefault();
        }
    };

    const handleTouchMove = (e) => {
        // Cancel long press if finger moves too much
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
        // Check if this is happening right after opening context menu
        if (preventClick.current || contextMenu) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick?.(book);
    };

    const closeContextMenu = () => {
        setContextMenu(null);
        // Clear the prevent flag after a delay
        setTimeout(() => {
            preventClick.current = false;
        }, 300);
    };

    const handleMenuAction = (action) => {
        action();
        closeContextMenu();
    };

    React.useEffect(() => {
        if (contextMenu) {
            const handleOutsideInteraction = (e) => {
                // Check if the interaction is outside the context menu
                if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                    closeContextMenu();
                }
            };

            // Delay adding the listeners to prevent immediate closure
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleOutsideInteraction);
                document.addEventListener('touchstart', handleOutsideInteraction, { passive: true });
            }, 250);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousedown', handleOutsideInteraction);
                document.removeEventListener('touchstart', handleOutsideInteraction);
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
                    ref={contextMenuRef}
                    className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[180px]"
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                    }}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <button
                        onTouchStart={(e) => {
                            e.stopPropagation();
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMenuAction(() => onAddToCollection?.(book));
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMenuAction(() => onAddToCollection?.(book));
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add to Collection
                    </button>
                    <button
                        onTouchStart={(e) => {
                            e.stopPropagation();
                        }}
                        onTouchEnd={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMenuAction(() => onRemove?.(book));
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleMenuAction(() => onRemove?.(book));
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-2 ${book.visibility === 'hidden'
                            ? 'hover:bg-green-50 active:bg-green-100 text-green-600'
                            : 'hover:bg-red-50 active:bg-red-100 text-red-600'
                            }`}
                    >
                        {book.visibility === 'hidden' ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Unhide
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                                Hide
                            </>
                        )}
                    </button>
                </div>
            )}
        </>
    );
};

export default BookCard;