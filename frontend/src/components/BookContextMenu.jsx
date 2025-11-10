import React, { useRef, useEffect } from 'react';

const BookContextMenu = ({ book, position, onClose, onAddToCollection, onRemove }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        if (position) {
            const handleOutsideInteraction = (e) => {
                if (menuRef.current && !menuRef.current.contains(e.target)) {
                    onClose();
                }
            };

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
    }, [position, onClose]);

    if (!position) return null;

    const handleMenuAction = (action) => {
        action();
        onClose();
    };

    return (
        <div
            ref={menuRef}
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[180px]"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
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
                    handleMenuAction(() => onAddToCollection(book));
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMenuAction(() => onAddToCollection(book));
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
                    handleMenuAction(() => onRemove(book));
                }}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMenuAction(() => onRemove(book));
                }}
                className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-2 ${
                    book.visibility === 'hidden'
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
    );
};

export default BookContextMenu;