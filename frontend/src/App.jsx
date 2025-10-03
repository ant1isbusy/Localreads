import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import React, { useState, useEffect } from 'react';
import BookList from './components/BookList';

function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (response.ok) {
        const updatedBook = await response.json();
        // Update the local state
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LR</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Localreads</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <BookList
          books={books}
          onUpdateProgress={updateBookProgress}
          loading={loading}
        />
      </main>
    </div>
  );
}

export default App;