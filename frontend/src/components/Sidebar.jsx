import React from 'react';

const Sidebar = ({ isOpen, onClose }) => {
    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="font-serif text-2xl font-bold">Menu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <nav className="space-y-4">
                        <a
                            href="#"
                            className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="font-medium">Library</div>
                            <div className="text-sm text-gray-500">View all books</div>
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="font-medium">Statistics</div>
                            <div className="text-sm text-gray-500">Reading stats</div>
                        </a>
                        <a
                            href="#"
                            className="block px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="font-medium">Collections</div>
                            <div className="text-sm text-gray-500">Your book collections</div>
                        </a>
                    </nav>
                </div>
            </div>
        </>
    );
};

export default Sidebar;