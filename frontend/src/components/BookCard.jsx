import React, { useState } from 'react';

const BookCard = ({ book, onUpdateProgress }) => {
    const [showProgressModal, setShowProgressModal] = useState(false);
    const [progressInput, setProgressInput] = useState('');

    const handleProgressSubmit = (e) => {
        e.preventDefault();
        const progress = parseFloat(progressInput);
        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
            onUpdateProgress(book.id, progress / 100);
            setShowProgressModal(false);
            setProgressInput('');
        }
    };

    const getProgressStatus = () => {
        if (book.progress === 0) return 'unread';
        if (book.progress === 1) return 'finished';
        return 'reading';
    };

    const progressStatus = getProgressStatus();

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                        {book.cover_path ? (
                            <img
                                src={`http://localhost:8000/${book.cover_path}`}
                                alt={book.title}
                                className="w-16 h-24 object-cover rounded-lg shadow-sm"
                            />
                        ) : (
                            <div className="w-16 h-24 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-gray-400 text-xs text-center px-1">No Cover</span>
                            </div>
                        )}
                    </div>

                    {/* Book Info */}
                    <div className="flex-grow min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{book.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{book.author}</p>

                        {/* Progress or Status */}
                        <div className="mt-3">
                            {progressStatus === 'reading' && (
                                <div className="space-y-2">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${Math.round(book.progress * 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                            {Math.round(book.progress * 100)}% read
                                        </span>
                                        <button
                                            onClick={() => setShowProgressModal(true)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(progressStatus === 'unread' || progressStatus === 'finished') && (
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${progressStatus === 'unread'
                                            ? 'bg-gray-100 text-gray-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                        {progressStatus === 'unread' ? 'Unread' : 'Finished'}
                                    </span>
                                    <button
                                        onClick={() => setShowProgressModal(true)}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Update
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Update Modal */}
            {showProgressModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-80 mx-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Update Reading Progress</h3>
                        <form onSubmit={handleProgressSubmit}>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="Enter percentage (0-100)"
                                value={progressInput}
                                onChange={(e) => setProgressInput(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowProgressModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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