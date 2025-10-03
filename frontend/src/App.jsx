import React, { useState, useEffect } from 'react';
import BookList from './components/BookList';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/books/');
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
      const response = await fetch(`http://localhost:8000/books/${bookId}/progress`, {
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
      const response = await fetch('http://localhost:8000/scan/', { method: 'POST' });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-100 flex flex-col">
      {/* Header */}
      <header className="bg-amber-100 border-b border-amber-200 sticky top-0 z-40 shadow-sm">
        <div className="w-full px-4 py-4">
          <div className="flex items-center max-w-6xl mx-auto justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-amber-50 font-bold text-sm">LR</span>
              </div>
              <h1 className="text-2xl font-bold text-amber-900">Localreads</h1>
            </div>
            <button
              onClick={scanLibrary}
              disabled={scanning}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg shadow hover:bg-amber-600 transition disabled:opacity-50"
            >
              {scanning ? 'Scanning...' : 'Scan Library'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <BookList
          books={books}
          onUpdateProgress={updateBookProgress}
          loading={loading}
        />
        {scanResult && (
          <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-lg ${scanResult.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {scanResult.message}
          </div>
        )}
      </main>


    </div>
  );
}

export default App;