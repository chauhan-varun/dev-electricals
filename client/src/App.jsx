import { 
  createBrowserRouter, 
  RouterProvider,
  Outlet,
  useLocation
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Services from './pages/Services';
import Repairs from './pages/Repairs';
import Sell from './pages/Sell';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Dashboard from './pages/admin/Dashboard';
import Overview from './pages/admin/Overview';
import Orders from './pages/admin/Orders';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProductDetails from './pages/ProductDetails';
import ServiceBooking from './pages/ServiceBooking';
import ScheduleRepair from './pages/ScheduleRepair';
import ScheduleService from './pages/ScheduleService';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Layout component that includes the Navbar
const Layout = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="pt-28"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
};

// Create router with the new configuration and both future flags
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "services",
        element: <Services />,
      },
      {
        path: "repairs",
        element: <Repairs />,
      },
      {
        path: "sell",
        element: <Sell />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "order-confirmation",
        element: <OrderConfirmation />,
      },
      {
        path: "admin",
        element: <Dashboard />,
        children: [
          {
            index: true,
            element: <Overview />,
          },
          {
            path: "orders",
            element: <Orders />,
          },
          {
            path: "products",
            element: <Overview />,
          },
          {
            path: "services",
            element: <Overview />,
          },
          {
            path: "customers",
            element: <Overview />,
          },
        ],
      },
      {
        path: "signin",
        element: <SignIn />,
      },
      {
        path: "signup",
        element: <SignUp />,
      },
      {
        path: "service-booking",
        element: <ServiceBooking />,
      },
      {
        path: "schedule-repair",
        element: <ScheduleRepair />,
      },
      {
        path: "schedule-service",
        element: <ScheduleService />,
      },
    ],
  },
  // Add a route for handling Google Auth Callback outside of the Layout
  // This ensures it doesn't show the navbar during processing
  {
    path: "/auth/google/callback",
    element: <GoogleAuthCallback />,
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
});

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
