import React, { useState } from 'react';

const CollectionList = ({ collections, onSelectCollection, onCreateCollection, onDeleteCollection }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDescription, setNewCollectionDescription] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        if (newCollectionName.trim()) {
            await onCreateCollection(newCollectionName.trim(), newCollectionDescription.trim());
            setNewCollectionName('');
            setNewCollectionDescription('');
            setIsCreating(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
                <h2 className="font-serif text-2xl font-bold mb-4">My Collections</h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {isCreating ? 'Cancel' : '+ New Collection'}
                </button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="p-6 border-b border-gray-200 bg-gray-50">
                    <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Collection name"
                        autoFocus
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <textarea
                        value={newCollectionDescription}
                        onChange={(e) => setNewCollectionDescription(e.target.value)}
                        placeholder="Description (optional)"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Create
                    </button>
                </form>
            )}

            <div className="flex-1 overflow-y-auto p-6">
                {collections.length > 0 ? (
                    <div className="space-y-2">
                        {collections.map((collection) => (
                            <div
                                key={collection.id}
                                className="group relative"
                            >
                                <button
                                    onClick={() => onSelectCollection(collection.id)}
                                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0 pr-8">
                                            <div className="font-medium truncate">{collection.name}</div>
                                            {collection.description && (
                                                <div className="text-sm text-gray-500 truncate">
                                                    {collection.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => onDeleteCollection(collection.id)}
                                    className="absolute right-2 top-3 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 transition-all"
                                    title="Delete collection"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <p>No collections yet.</p>
                        <p className="text-sm mt-2">Create your first collection to organize your books!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionList;