import { useAuth } from './context/AuthContext'
import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Dashboard from './components/Dashboard'
import Navbar from './components/Navbar'
import Login from './components/Login'
import OrderManagement from './components/OrderManagement'
import UsedProductsManagement from './components/UsedProductsManagement'
import ContactManagement from './components/ContactManagement'
import AnimatedLayout from './components/AnimatedLayout'

// Wrapper component to handle AnimatePresence with Routes
const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={!isAuthenticated ? (
          <AnimatedLayout>
            <Login />
          </AnimatedLayout>
        ) : <Navigate to="/" />} />
        <Route path="/" element={isAuthenticated ? (
          <AnimatedLayout>
            <Dashboard view="services" />
          </AnimatedLayout>
        ) : <Navigate to="/login" />} />
        <Route path="/services" element={isAuthenticated ? (
          <AnimatedLayout>
            <Dashboard view="services" />
          </AnimatedLayout>
        ) : <Navigate to="/login" />} />
        <Route path="/repairs" element={isAuthenticated ? (
          <AnimatedLayout>
            <Dashboard view="repairs" />
          </AnimatedLayout>
        ) : <Navigate to="/login" />} />
        <Route path="/orders" element={isAuthenticated ? (
          <AnimatedLayout>
            <OrderManagement />
          </AnimatedLayout>
        ) : <Navigate to="/login" />} />
        <Route path="/used-products" element={isAuthenticated ? (
          <AnimatedLayout>
            <UsedProductsManagement />
          </AnimatedLayout>
        ) : <Navigate to="/login" />} />
        <Route path="/contact" element={isAuthenticated ? (
          <AnimatedLayout>
            <ContactManagement />
          </AnimatedLayout>
        ) : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
};

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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-red-900 font-bold text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {isAuthenticated && <Navbar />}
        <div className="flex-grow">
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  )
}

export default App
