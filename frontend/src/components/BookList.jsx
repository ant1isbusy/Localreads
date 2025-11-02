import React, { useState } from 'react';
import BookCard from './BookCard';
import BookDetailModal from './BookDetailModal';
import '../App.css';

const BookList = ({ books, onUpdateProgress, onUpdateRatingReview, loading }) => {
    const [selectedBook, setSelectedBook] = useState(null);

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
        if (updates.progress !== undefined || updates.current_page !== undefined) {
            await onUpdateProgress(bookId, updates.progress, updates.current_page);
        }
        if (updates.rating_stars !== undefined || updates.review !== undefined) {
            await onUpdateRatingReview(bookId, updates.rating_stars, updates.review);
        }
    };

    const renderBookSection = (books, title) => {
        if (books.length === 0) return null;
        return (
            <div className="mb-5">
                <div className="flex items-center justify-between mb-3 px-2">
                    <h2 className="font-serif text-[22px] font-bold">
                        {title}
                    </h2>
                    <span className="font-serif text-[22px] font-bold text-black">
                        {books.length}
                    </span>
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

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-4">
            {renderBookSection(readingBooks, 'Currently Reading')}
            {renderBookSection(unreadBooks, 'Unread')}
            {renderBookSection(finishedBooks, 'Finished')}

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