import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminPage from './components/AdminPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  )
}

export default App
