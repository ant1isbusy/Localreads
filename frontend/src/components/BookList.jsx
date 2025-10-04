import React from 'react';
import BookCard from './BookCard';
import '../App.css';

const BookList = ({ books, onUpdateProgress, loading }) => {
    // Sort books: reading > unread > finished
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

    const renderBookSection = (books, title, colorClass) => {
        if (books.length === 0) return null;
        return (
            <div className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${colorClass}`}>
                    {title} <span className="text-amber-600 font-normal">({books.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                    {books.map(book => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onUpdateProgress={onUpdateProgress}
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {renderBookSection(readingBooks, 'Currently Reading', 'text-amber-700')}
            {renderBookSection(finishedBooks, 'Finished', 'text-amber-700')}
            {renderBookSection(unreadBooks, 'Unread', 'text-amber-700')}

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
        </div>
    );
};

export default BookList;