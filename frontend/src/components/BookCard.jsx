import React from 'react';
import { API_BASE_URL } from '../config';
import StarRating from './StarRating';

const BookCard = ({ book, onClick }) => {
    return (
        <div
            onClick={() => onClick(book)}
            className="bg-white rounded-lg hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-200 hover:border-gray-300 p-4"
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
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
    );
};

export default BookCard;