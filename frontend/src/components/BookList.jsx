import React from 'react';
import BookCard from './BookCard';

const BookList = ({ books, onUpdateProgress, loading }) => {
    // Sort books: reading > unread > finished
    const sortedBooks = [...books].sort((a, b) => {
        // Reading books first (0 < progress < 1)
        if (a.progress > 0 && a.progress < 1 && !(b.progress > 0 && b.progress < 1)) return -1;
        if (b.progress > 0 && b.progress < 1 && !(a.progress > 0 && a.progress < 1)) return 1;

        // Then unread (progress = 0)
        if (a.progress === 0 && b.progress !== 0) return -1;
        if (b.progress === 0 && a.progress !== 0) return 1;

        // Then finished (progress = 1)
        if (a.progress === 1 && b.progress !== 1) return 1;
        if (b.progress === 1 && a.progress !== 1) return -1;

        // Within same category, sort by title
        return a.title.localeCompare(b.title);
    });

    // Categorize books for display
    const readingBooks = sortedBooks.filter(book => book.progress > 0 && book.progress < 1);
    const unreadBooks = sortedBooks.filter(book => book.progress === 0);
    const finishedBooks = sortedBooks.filter(book => book.progress === 1);

    const renderBookSection = (books, title, color) => {
        if (books.length === 0) return null;

        return (
            <div className="mb-8">
                <h2 className={`text-lg font-semibold mb-4 ${color}`}>{title} ({books.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            {renderBookSection(readingBooks, 'Currently Reading', 'text-blue-600')}
            {renderBookSection(unreadBooks, 'Unread', 'text-gray-600')}
            {renderBookSection(finishedBooks, 'Finished', 'text-green-600')}

            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            )}

            {books.length === 0 && !loading && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No books found in your library.</p>
                </div>
            )}
        </div>
    );
};

export default BookList;