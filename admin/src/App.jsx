import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import Login from './components/Login'
import OrderManagement from './components/OrderManagement'
import UsedProductsManagement from './components/UsedProductsManagement'
import ContactManagement from './components/ContactManagement'

function App() {
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated') === 'true'
    if (isAuth) {
      // Re-authenticate if there's a stored session
      // The login process will be handled by the Login component
    }
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {isAuthenticated && <Navbar />}
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/" element={isAuthenticated ? <Dashboard view="services" /> : <Navigate to="/login" />} />
          <Route path="/services" element={isAuthenticated ? <Dashboard view="services" /> : <Navigate to="/login" />} />
          <Route path="/repairs" element={isAuthenticated ? <Dashboard view="repairs" /> : <Navigate to="/login" />} />
          <Route path="/orders" element={isAuthenticated ? <OrderManagement /> : <Navigate to="/login" />} />
          <Route path="/used-products" element={isAuthenticated ? <UsedProductsManagement /> : <Navigate to="/login" />} />
          <Route path="/contact" element={isAuthenticated ? <ContactManagement /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
