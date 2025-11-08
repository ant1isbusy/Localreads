import React from 'react';
import CollectionList from './CollectionList';

const Sidebar = ({ 
    isOpen, 
    onClose, 
    collections,
    onSelectCollection,
    onCreateCollection,
    onDeleteCollection,
    view,
    onViewChange
}) => {
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
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
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

                {/* View Selector */}
                <div className="p-6 border-b border-gray-200">
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                onViewChange('library');
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                view === 'library' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                            }`}
                        >
                            <div className="font-medium">Library</div>
                            <div className="text-sm text-gray-500">View all books</div>
                        </button>
                        <button
                            onClick={() => onViewChange('collections')}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                view === 'collections' ? 'bg-blue-100 text-blue-900' : 'hover:bg-gray-100'
                            }`}
                        >
                            <div className="font-medium">Collections</div>
                            <div className="text-sm text-gray-500">Organize books</div>
                        </button>
                    </div>
                </div>

                {/* Content based on view */}
                {view === 'collections' ? (
                    <CollectionList
                        collections={collections}
                        onSelectCollection={(collectionId) => {
                            onSelectCollection(collectionId);
                            onClose();
                        }}
                        onCreateCollection={onCreateCollection}
                        onDeleteCollection={onDeleteCollection}
                    />
                ) : (
                    <div className="p-6">
                        <p className="text-gray-500 text-sm">
                            Library view selected. Use Collections to organize your books.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default Sidebar;