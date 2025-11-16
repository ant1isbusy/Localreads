import React, { useState, useEffect } from 'react';
import BookList from './components/BookList';
import RTYPanel from './components/RTYPanel';
import Sidebar from './components/Sidebar';
import CollectionPicker from './components/CollectionPicker';
import ConfirmDialog from './components/ConfirmDialog';
import './App.css';
import { API_BASE_URL } from './config';

function App() {
    const [books, setBooks] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [selectedCollection, setSelectedCollectionState] = useState(() => {
        const saved = localStorage.getItem('selectedCollection');
        if (!saved || saved === 'null') return null;
        if (saved === 'hidden') return 'hidden';
        return parseInt(saved, 10);
    });

    const [collectionPickerBook, setCollectionPickerBook] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, collectionId: null });

    useEffect(() => {
        fetchCollections();
    }, []);

    useEffect(() => {
        fetchBooks();
    }, [selectedCollection]);

    useEffect(() => {
        if (scanResult) {
            const timer = setTimeout(() => setScanResult(null), 1300);
            return () => clearTimeout(timer);
        }
    }, [scanResult]);

    const setSelectedCollection = (collectionId) => {
        setSelectedCollectionState(collectionId);
        localStorage.setItem('selectedCollection', collectionId === null ? 'null' : String(collectionId));
    };

    const fetchBooks = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE_URL}/books/`;

            if (selectedCollection && selectedCollection !== 'hidden') {
                url = `${API_BASE_URL}/collections/${selectedCollection}/books`;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                console.log('Fetched books:', data);
                setBooks(data);
            }
        } catch (error) {
            console.error('Error fetching books:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/`);
            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const createCollection = async (name, description) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description }),
            });
            if (response.ok) {
                await fetchCollections();
            }
        } catch (error) {
            console.error('Error creating collection:', error);
        }
    };

    const deleteCollection = async (collectionId) => {
        setConfirmDialog({ isOpen: true, collectionId });
    };

    const handleConfirmDelete = async () => {
        const { collectionId } = confirmDialog;
        setConfirmDialog({ isOpen: false, collectionId: null });

        try {
            const response = await fetch(`${API_BASE_URL}/collections/${collectionId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchCollections();
                if (selectedCollection === collectionId) {
                    setSelectedCollection(null);
                }
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
        }
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ isOpen: false, collectionId: null });
    };

    const addBookToCollection = async (bookId, collectionId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/books`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ book_id: bookId }),
            });
            if (response.ok) {
                await fetchBooks();
                await fetchCollections();
            }
        } catch (error) {
            console.error('Error adding book to collection:', error);
        }
    };

    const removeBookFromCollection = async (bookId, collectionId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/books/${bookId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                await fetchBooks();
                await fetchCollections();
            }
        } catch (error) {
            console.error('Error removing book from collection:', error);
        }
    };

    const removeBookFromLibrary = async (bookId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${bookId}/visibility`, {
                method: 'PATCH',
            });
            if (response.ok) {
                await fetchBooks();
            }
        } catch (error) {
            console.error('Error hiding book:', error);
        }
    };

    const updateBookProgress = async (bookId, progress, current_page = undefined) => {
        try {
            const body = { progress };
            if (current_page !== undefined) body.current_page = current_page;

            if (progress >= 1) {
                body.status = 'finished';
            } else if (progress > 0) {
                body.status = 'reading';
            } else {
                body.status = 'unread';
            }

            const response = await fetch(`${API_BASE_URL}/books/${bookId}/progress`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const updatedBook = await response.json();
                setBooks(prevBooks =>
                    prevBooks.map(book =>
                        book.id === bookId ? { ...book, ...updatedBook } : book
                    )
                );
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const scanLibrary = async () => {
        setScanning(true);
        setScanResult(null);
        try {
            const response = await fetch(`${API_BASE_URL}/scan/`, { method: 'POST' });
            if (response.ok) {
                const result = await response.json();
                setScanResult(result);
                fetchBooks();
            }
        } catch (error) {
            setScanResult({ status: 'error', message: 'Scan failed.' });
        } finally {
            setScanning(false);
        }
    };

    const addFromISBN = async (isbn) => {
        try {
            const response = await fetch(`${API_BASE_URL}/isbn/${isbn}`, {
                method: 'POST',
            });
            if (response.ok) {
                const result = await response.json();
                setScanResult({ status: 'success', message: `Added: ${result.title}` });
                await fetchBooks();
            } else {
                const error = await response.json();
                setScanResult({ status: 'error', message: error.detail || 'Failed to add book' });
            }
        } catch (error) {
            console.error('Error adding book from ISBN:', error);
            setScanResult({ status: 'error', message: 'Failed to add book' });
        }
    };

    const updateBookRatingReview = async (bookId, ratingStars, review) => {
        try {
            const response = await fetch(`${API_BASE_URL}/books/${bookId}/rating_review`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating_stars: ratingStars,
                    review: review
                }),
            });

            if (response.ok) {
                const updatedBook = await response.json();
                setBooks(prevBooks =>
                    prevBooks.map(book =>
                        book.id === bookId ? {
                            ...book,
                            rating_stars: updatedBook.rating_stars,
                            review: updatedBook.review
                        } : book
                    )
                );
            }
        } catch (error) {
            console.error('Error updating rating/review:', error);
        }
    };

    const getFilteredBooks = () => {
        if (selectedCollection === 'hidden') {
            return books.filter(book => book.visibility === 'hidden');
        }
        return books.filter(book => book.visibility !== 'hidden');
    };

    const getCollectionTitle = () => {
        if (selectedCollection === 'hidden') {
            return 'Hidden Books';
        }
        if (selectedCollection === null) {
            return null;
        }
        const collection = collections.find(c => c.id === selectedCollection);
        return collection ? collection.name : 'Collection';
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-serif tracking-tight">Localreads</h1>
                        {getCollectionTitle() && (
                            <>
                                <span className="text-gray-400">/</span>
                                <span className="text-xl font-serif text-gray-600">{getCollectionTitle()}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                collections={collections}
                onSelectCollection={setSelectedCollection}
                onCreateCollection={createCollection}
                onDeleteCollection={deleteCollection}
                onScanLibrary={scanLibrary}
                scanning={scanning}
                onAddFromISBN={addFromISBN}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Delete Collection"
                message="Delete this collection? Books will not be deleted."
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />

            {/* Collection Picker Modal */}
            {collectionPickerBook && (
                <CollectionPicker
                    book={collectionPickerBook}
                    collections={collections}
                    onClose={() => setCollectionPickerBook(null)}
                    onAddToCollection={addBookToCollection}
                    onRemoveFromCollection={removeBookFromCollection}
                    onCreateCollection={createCollection}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 w-full">
                {selectedCollection === null && (
                    <RTYPanel
                        onUpdateProgress={updateBookProgress}
                        onUpdateRatingReview={updateBookRatingReview}
                    />
                )}
                <BookList
                    books={getFilteredBooks()}
                    onUpdateProgress={updateBookProgress}
                    onUpdateRatingReview={updateBookRatingReview}
                    onRemoveBook={removeBookFromLibrary}
                    onAddToCollection={(book) => setCollectionPickerBook(book)}
                    loading={loading}
                />
                {scanResult && (
                    <div
                        className={`
                  fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg
                  transition-opacity duration-500
                  ${scanResult ? 'opacity-100' : 'opacity-0'}
                  ${scanResult.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'}
                `}
                    >
                        {scanResult.message}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;