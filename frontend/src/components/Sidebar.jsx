import React from 'react';
import CollectionList from './CollectionList';

const Sidebar = ({
    isOpen,
    onClose,
    collections,
    onSelectCollection,
    onCreateCollection,
    onDeleteCollection,
    onScanLibrary,
    scanning,
}) => {
    const handleSelectCollection = (collectionId) => {
        onSelectCollection(collectionId);
        onClose();
    };

    const handleScanLibrary = () => {
        onScanLibrary();
    };

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="font-serif text-2xl font-bold">Library</h2>
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

                    {/* Library Views */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="space-y-2">
                            <button
                                onClick={() => handleSelectCollection(null)}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="font-medium">All Books</div>
                                <div className="text-sm text-gray-500">View entire library</div>
                            </button>
                            <button
                                onClick={() => handleSelectCollection('hidden')}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                    <div className="font-medium">Hidden Books</div>
                                </div>
                                <div className="text-sm text-gray-500">Removed from library</div>
                            </button>
                        </div>
                    </div>

                    {/* Collections */}
                    <div className="flex-1 overflow-hidden">
                        <CollectionList
                            collections={collections}
                            onSelectCollection={handleSelectCollection}
                            onCreateCollection={onCreateCollection}
                            onDeleteCollection={onDeleteCollection}
                        />
                    </div>

                    {/* Scan Library Button at bottom */}
                    <div className="p-6 border-t border-gray-200">
                        <button
                            onClick={handleScanLibrary}
                            disabled={scanning}
                            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="flex items-center gap-2">
                                {scanning ? (
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                )}
                                <div className="font-medium">{scanning ? 'Scanning...' : 'Scan Library'}</div>
                            </div>
                            <div className="text-sm text-gray-500">Update book collection</div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;