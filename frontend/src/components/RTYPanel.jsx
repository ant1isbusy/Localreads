import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import BookDetailModal from './BookDetailModal';

const RTYPanel = ({ onUpdateProgress, onUpdateRatingReview }) => {
    const [booksReadThisYear, setBooksReadThisYear] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);

    useEffect(() => {
        fetchBooksReadThisYear();
    }, []);

    const fetchBooksReadThisYear = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/books`);
            if (!response.ok) {
                throw new Error('Failed to fetch books');
            }
            const books = await response.json();

            const currentYear = new Date().getFullYear();
            const finishedThisYear = books.filter(book => {
                if (book.status !== 'finished') return false;
                const lastUpdated = new Date(book.last_updated);
                return lastUpdated.getFullYear() === currentYear;
            });

            setBooksReadThisYear(finishedThisYear);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (bookId, updates) => {
        try {
            if (updates.progress !== undefined || updates.current_page !== undefined) {
                await onUpdateProgress(bookId, updates.progress, updates.current_page);
            }
            if (updates.rating_stars !== undefined || updates.review !== undefined) {
                await onUpdateRatingReview(bookId, updates.rating_stars, updates.review);
            }
            // Refresh the list after update
            await fetchBooksReadThisYear();
        } catch (error) {
            console.error('Error updating book:', error);
            throw error; // Re-throw to let BookDetailModal handle it
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <p className="text-gray-600">Loading books read this year...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <p className="text-red-600">Error: {error}</p>
            </div>
        );
    }

    if (booksReadThisYear.length === 0) {
        return null
    }

    return (
        <>
            <div className="w-full max-w-6xl mx-auto px-4 py-2">
                <div className="flex items-center justify-between mb-2 px-2">
                    <h2 className="font-serif text-[22px] font-bold text-black">
                        Books Read This Year ({booksReadThisYear.length})
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label={isExpanded ? "Collapse panel" : "Expand panel"}
                        >
                            <svg
                                className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className={`bg-white rounded-lg overflow-hidden border-2 border-gray-200 transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100 p-6' : 'max-h-0 opacity-0 p-0'}`}>
                    {booksReadThisYear.length === 0 ? (
                        <p className="text-gray-500">No books finished this year yet. Start reading!</p>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {booksReadThisYear.map((book) => (
                                <div
                                    key={book.id}
                                    className="relative group cursor-pointer"
                                    title={`${book.title} by ${book.author}`}
                                    onClick={() => setSelectedBook(book)}
                                >
                                    <div className="w-16 h-24 rounded shadow-sm overflow-hidden border border-gray-200 hover:scale-105 transition-transform">
                                        {book.cover_path ? (
                                            <img
                                                src={`${API_BASE_URL}/${book.cover_path}`}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold text-center px-1">
                                                    {book.title.substring(0, 3)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                                        {book.title.length > 20 ? `${book.title.substring(0, 17)}...` : book.title}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedBook && (
                <BookDetailModal
                    book={selectedBook}
                    onClose={() => setSelectedBook(null)}
                    onUpdate={handleUpdate}
                />
            )}
        </>
    );
};

export default RTYPanel;