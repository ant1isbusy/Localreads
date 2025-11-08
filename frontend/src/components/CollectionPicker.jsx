import React, { useState } from 'react';

const CollectionPicker = ({ book, collections, onClose, onAddToCollection, onRemoveFromCollection }) => {
    const [selectedCollections, setSelectedCollections] = useState(
        new Set(book.collections?.map(c => c.id) || [])
    );
    const [newCollectionName, setNewCollectionName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleToggle = (collectionId) => {
        const newSelected = new Set(selectedCollections);
        if (newSelected.has(collectionId)) {
            newSelected.delete(collectionId);
        } else {
            newSelected.add(collectionId);
        }
        setSelectedCollections(newSelected);
    };

    const handleSave = async () => {
        const currentCollectionIds = new Set(book.collections?.map(c => c.id) || []);

        // Add to new collections
        for (const collectionId of selectedCollections) {
            if (!currentCollectionIds.has(collectionId)) {
                await onAddToCollection(book.id, collectionId);
            }
        }

        // Remove from unselected collections
        for (const collectionId of currentCollectionIds) {
            if (!selectedCollections.has(collectionId)) {
                await onRemoveFromCollection(book.id, collectionId);
            }
        }

        onClose();
    };

    const handleCreateCollection = async () => {
        if (newCollectionName.trim()) {
            // This would need to be implemented - create collection and add book
            setNewCollectionName('');
            setIsCreating(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[70vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-serif text-xl font-bold">Add to Collection</h3>
                    <p className="text-sm text-gray-500 mt-1">{book.title}</p>
                </div>

                {/* Collections List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {collections.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No collections yet. Create one below!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {collections.map((collection) => (
                                <label
                                    key={collection.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedCollections.has(collection.id)}
                                        onChange={() => handleToggle(collection.id)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium">{collection.name}</div>
                                        {collection.description && (
                                            <div className="text-sm text-gray-500">
                                                {collection.description}
                                            </div>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Create New Collection */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        {!isCreating ? (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full px-4 py-2 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                + Create New Collection
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={newCollectionName}
                                    onChange={(e) => setNewCollectionName(e.target.value)}
                                    placeholder="Collection name"
                                    autoFocus
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateCollection}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewCollectionName('');
                                        }}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CollectionPicker;