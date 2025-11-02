import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const RTYPanel = () => {
    const [booksReadThisYear, setBooksReadThisYear] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                    Books Read This Year
                </h2>
                <span className="text-3xl font-bold text-blue-600">
                    {booksReadThisYear.length}
                </span>
            </div>

            {booksReadThisYear.length === 0 ? (
                <p className="text-gray-500">No books finished this year yet. Start reading!</p>
            ) : (
                <div className="flex flex-wrap gap-3 mt-4">
                    {booksReadThisYear.map((book) => (
                        <div
                            key={book.id}
                            className="relative group"
                            title={`${book.title} by ${book.author}`}
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
    );
};

export default RTYPanel;