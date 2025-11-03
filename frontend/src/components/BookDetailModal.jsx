import React, { useState } from 'react';
import { API_BASE_URL } from '../config';
import StarRating from './StarRating';

const BookDetailModal = ({ book, onClose, onUpdate }) => {
    const [progress, setProgress] = useState(book.progress);
    const [currentPage, setCurrentPage] = useState(book.current_page);
    const [rating, setRating] = useState(book.rating_stars);
    const [review, setReview] = useState(book.review || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onUpdate(book.id, {
                progress,
                current_page: currentPage,
                rating_stars: rating,
                review: review.trim() || null,
            });
            onClose();
        } catch (error) {
            console.error('Failed to update book:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleProgressChange = (e) => {
        const newProgress = parseFloat(e.target.value);
        setProgress(newProgress);
        if (book.pages) {
            setCurrentPage(Math.round(newProgress * book.pages));
        }
    };

    const handlePageChange = (e) => {
        const value = e.target.value;
        const page = value === '' ? 0 : parseInt(value);
        setCurrentPage(page);
        if (book.pages) {
            setProgress(Math.min(page / book.pages, 1));
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-bold text-gray-900">Book Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Book Info Section */}
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                        {/* Cover */}
                        <div className="flex-shrink-0">
                            <div className="w-48 h-72 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                                {book.cover_path ? (
                                    <img
                                        src={`${API_BASE_URL}/${book.cover_path}`}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        <span className="text-white text-xl font-semibold text-center px-4">
                                            {book.title.substring(0, 10)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title & Author */}
                        <div className="flex-1">
                            <h3 className="font-serif text-3xl font-bold text-gray-900 mb-2">
                                {book.title}
                            </h3>
                            <p className="text-xl text-gray-600 mb-4">{book.author}</p>
                            {book.pages && (
                                <p className="text-sm text-gray-500">{book.pages} pages</p>
                            )}
                        </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-serif text-lg font-semibold mb-3">Reading Progress</h4>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Progress: {Math.round(progress * 100)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={progress}
                                onChange={handleProgressChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>

                        {book.pages && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Page
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max={book.pages}
                                    value={currentPage}
                                    onChange={handlePageChange}
                                    onFocus={(e) => e.target.select()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>

                    {/* Rating Section */}
                    <div className="mb-6">
                        <h4 className="font-serif text-lg font-semibold mb-3">Rating</h4>
                        <StarRating rating={rating} onRatingChange={setRating} size="lg" />
                    </div>

                    {/* Review Section */}
                    <div className="mb-6">
                        <h4 className="font-serif text-lg font-semibold mb-3">Review</h4>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Write your thoughts about this book..."
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailModal;