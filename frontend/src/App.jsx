import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    // Test connection to backend
    fetch('http://localhost:8000/health')
      .then(response => response.json())
      .then(data => setBackendStatus('Connected ✅'))
      .catch(error => setBackendStatus('Disconnected ❌'))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Localreads</h1>
          <p className="text-green-600 mt-2">Frontend is working!</p>
          <p className="text-blue-600">Backend: {backendStatus}</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>React + Vite + Tailwind CSS is properly configured!</p>
        </div>
      </main>
    </div>
  )
}

export default App
