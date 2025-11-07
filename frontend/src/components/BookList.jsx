import React, { useState } from 'react';
import BookCard from './BookCard';
import BookDetailModal from './BookDetailModal';
import { API_BASE_URL } from '../config';
import '../App.css';

const BookList = ({ books, onUpdateProgress, onUpdateRatingReview, loading }) => {
    const [selectedBook, setSelectedBook] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    const sortedBooks = [...books].sort((a, b) => {
        if (a.progress > 0 && a.progress < 1 && !(b.progress > 0 && b.progress < 1)) return -1;
        if (b.progress > 0 && b.progress < 1 && !(a.progress > 0 && a.progress < 1)) return 1;
        if (a.progress === 0 && b.progress !== 0) return -1;
        if (b.progress === 0 && a.progress !== 0) return 1;
        if (a.progress === 1 && b.progress !== 1) return 1;
        if (b.progress === 1 && a.progress !== 1) return -1;
        return a.title.localeCompare(b.title);
    });

    const readingBooks = sortedBooks.filter(book => book.progress > 0 && book.progress < 1);
    const unreadBooks = sortedBooks.filter(book => book.progress === 0);
    const finishedBooks = sortedBooks.filter(book => book.progress === 1);

    const handleUpdate = async (bookId, updates) => {
        try {
            if (updates.progress !== undefined || updates.current_page !== undefined) {
                await onUpdateProgress(bookId, updates.progress, updates.current_page);
            }
            if (updates.rating_stars !== undefined || updates.review !== undefined) {
                await onUpdateRatingReview(bookId, updates.rating_stars, updates.review);
            }
        } catch (error) {
            console.error('Error updating book:', error);
            throw error; // Re-throw to let BookDetailModal handle it
        }
    };

    const renderBookSection = (books, title) => {
        if (books.length === 0) return null;
        return (
            <div className="mb-5">
                <div className="flex items-center justify-between mb-3 px-2">
                    <h2 className="font-serif text-[22px] font-bold">
                        {title} ({books.length})
                    </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2">
                    {books.map(book => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onClick={setSelectedBook}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const renderGridView = () => {
        if (sortedBooks.length === 0) return null;
        return (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {sortedBooks.map(book => (
                    <div
                        key={book.id}
                        onClick={() => setSelectedBook(book)}
                        className="cursor-pointer group"
                        title={`${book.title} by ${book.author}`}
                    >
                        <div className="w-full aspect-[2/3] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-gray-400 hover:shadow-lg transition-all">
                            {book.cover_path ? (
                                <img
                                    src={`${API_BASE_URL}/${book.cover_path}`}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center p-2">
                                    <span className="text-white text-xs font-semibold text-center">
                                        {book.title.substring(0, 20)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                            {book.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{book.author}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-4">
            {/* View Mode Toggle */}
            <div className="flex justify-end mb-4 px-2">
                <div className="relative inline-flex rounded-full border border-gray-300 bg-gray-100 p-1">
                    {/* Sliding background */}
                    <div
                        className={`absolute top-1 bottom-1 left-1 right-1 w-[calc(50%-0.25rem)] bg-white rounded-full shadow-sm transition-transform duration-300 ease-in-out ${viewMode === 'grid' ? 'translate-x-full' : 'translate-x-0'
                            }`}
                    />

                    <button
                        onClick={() => setViewMode('list')}
                        className={`relative z-10 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${viewMode === 'list'
                            ? 'text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`relative z-10 px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-300 ${viewMode === 'grid'
                            ? 'text-gray-900'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? (
                <>
                    {renderBookSection(readingBooks, 'Currently Reading')}
                    {renderBookSection(unreadBooks, 'Unread')}
                    {renderBookSection(finishedBooks, 'Finished')}
                </>
            ) : (
                renderGridView()
            )}

            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
            )}

            {books.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-amber-700 text-lg">No books found in your library.</p>
                </div>
            )}

            {selectedBook && (
                <BookDetailModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
};

export default BookList;