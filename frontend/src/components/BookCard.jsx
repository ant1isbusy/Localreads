import React, { useState } from 'react';
import '../App.css';
import { API_BASE_URL } from '../config';
import StarRating from './StarRating';

const BookCard = ({ book, onUpdateProgress, onUpdateRatingReview }) => {
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [progressInput, setProgressInput] = useState('');
    const [ratingInput, setRatingInput] = useState(book.rating_stars || 0);
    const [reviewInput, setReviewInput] = useState(book.review || '');

    const handleProgressSubmit = (e) => {
        e.preventDefault();
        const progress = parseFloat(progressInput);
        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
            onUpdateProgress(book.id, progress / 100);
            setShowProgressModal(false);
            setProgressInput('');
        }
    };

    const handleRatingReviewSubmit = (e) => {
        e.preventDefault();
        onUpdateRatingReview(book.id, ratingInput, reviewInput);
        setShowRatingModal(false);
    };

    const getProgressStatus = () => {
        if (book.progress === 0) return 'unread';
        if (book.progress === 1) return 'finished';
        return 'reading';
    };

    const progressStatus = getProgressStatus();
    return (
        <>
            <div className="bg-white border-2 border-gray-200 rounded-md p-4 hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <div className="flex gap-6">
                    <div className="flex-shrink-0">
                        {book.cover_path ? (
                            <img
                                src={`${API_BASE_URL}/${book.cover_path}`}
                                alt={book.title}
                                className="w-20 h-30 object-cover rounded-md"
                            />
                        ) : (
                            <div className="w-20 h-30 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                                No Cover
                            </div>
                        )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-grow">
                        <h3 className="font-sans text-md font-semibold mb-0">{book.title}</h3>
                        <p className="text-gray-500 text-sm mb-1">{book.author}</p>

                        {/* Rating Display */}
                        <div className="mb-4">
                            <StarRating
                                rating={book.rating_stars || 0}
                                onRatingChange={(rating) => {
                                    if (rating === (book.rating_stars || 0)) {
                                        setRatingInput(0);
                                        return;
                                    }
                                    setRatingInput(rating);
                                    setShowRatingModal(true);
                                }}
                                size="sm"
                            />
                            {book.review && (
                                <p className="text-sm text-amber-600 mt-2 line-clamp-2">
                                    "{book.review}"
                                </p>
                            )}
                        </div>

                        {/* Progress or Status */}
                        <div className="flex items-center justify-between">
                            <div className="flex-grow">
                                {progressStatus === 'reading' && (
                                    <div className="space-y-2">
                                        <div className="w-full bg-blue-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.round(book.progress * 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-800">
                                            {Math.round(book.progress * 100)}% read
                                        </span>
                                    </div>
                                )}
                                {progressStatus === 'finished' && (
                                    <span className={"text-xs px-3 py-1.5 rounded-full font-medium bg-green-100 text-green-700 border border-green-200"}>
                                        {"Finished"}
                                    </span>
                                )}
                            </div>

                            <div className="flex space-x-2 ml-4">
                                <button
                                    onClick={() => setShowProgressModal(true)}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-thin rounded-md hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Update Modal */}
            {showProgressModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Update Reading Progress</h3>
                        <form onSubmit={handleProgressSubmit}>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Enter percentage (0-100)"
                                value={progressInput}
                                onChange={(e) => setProgressInput(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                                autoFocus
                            />
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                    Save Progress
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProgressModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Rating & Review Modal */}
            {showRatingModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4">Rate & Review</h3>
                        <form onSubmit={handleRatingReviewSubmit}>
                            {/* Star Rating */}
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-medium mb-3">
                                    How many stars?
                                </label>
                                <StarRating
                                    rating={ratingInput}
                                    onRatingChange={setRatingInput}
                                    size="lg"
                                />
                            </div>

                            {/* Review Textarea */}
                            <div className="mb-6">
                                <label htmlFor="review" className="block text-gray-700 text-sm font-medium mb-2">
                                    Your Review (optional)
                                </label>
                                <textarea
                                    id="review"
                                    rows="4"
                                    placeholder="Share your thoughts about this book..."
                                    value={reviewInput}
                                    onChange={(e) => setReviewInput(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white resize-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Rating
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRatingModal(false);
                                        setRatingInput(book.rating_stars || 0);
                                        setReviewInput(book.review || '');
                                    }}
                                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookCard;