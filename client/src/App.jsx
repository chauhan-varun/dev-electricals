import { 
  createBrowserRouter, 
  RouterProvider,
  Outlet
} from 'react-router-dom';
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
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProductDetails from './pages/ProductDetails';
import ServiceBooking from './pages/ServiceBooking';
import ScheduleRepair from './pages/ScheduleRepair';

// Layout component that includes the Navbar
const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-28">
        <Outlet />
      </main>
    </div>
  );
};

// Create router with the new configuration and both future flags
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/services",
        element: <Services />,
      },
      {
        path: "/repairs",
        element: <Repairs />,
      },
      {
        path: "/sell",
        element: <Sell />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/checkout",
        element: <Checkout />,
      },
      {
        path: "/order-confirmation",
        element: <OrderConfirmation />,
      },
      {
        path: "/admin",
        element: <Dashboard />,
        children: [
          {
            path: "",
            element: <Overview />,
          },
        ],
      },
      {
        path: "/signin",
        element: <SignIn />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/products/:id",
        element: <ProductDetails />,
      },
      {
        path: "/service-booking",
        element: <ServiceBooking />,
      },
      {
        path: "/schedule-repair",
        element: <ScheduleRepair />,
      },
    ],
  },
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
