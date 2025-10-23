import React, { useState, useEffect } from 'react';
import BookList from './components/BookList';
import './App.css';
import { API_BASE_URL } from './config';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => setScanResult(null), 1300);
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books/`);
      if (response.ok) {
        const data = await response.json();
        setBooks(data);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookProgress = async (bookId, progress) => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/${bookId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress }),
      });
      if (response.ok) {
        const updatedBook = await response.json();
        setBooks(prevBooks =>
          prevBooks.map(book =>
            book.id === bookId ? { ...book, progress: updatedBook.progress } : book
          )
        );
      } else {
        console.error('Failed to update progress:', response.status);
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
      } else {
        console.error('Failed to update rating/review:', response.status);
      }
    } catch (error) {
      console.error('Error updating rating/review:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 text-white font-serif flex items-center justify-center rounded-md">LR</div>
            <h1 className="text-3xl font-serif tracking-tight">Localreads</h1>
          </div>
          <button
            onClick={scanLibrary}
            disabled={scanning}
            className="px-3 py-1 bg-gray-200 border-2 border-gray-300 font-sans text-sm rounded-full text-black hover:bg-gray-800 hover:text-white transition disabled:opacity-50"
          >
            {scanning ? 'Scanning... ' : 'Scan Library'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <BookList
          books={books}
          onUpdateProgress={updateBookProgress}
          onUpdateRatingReview={updateBookRatingReview}
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