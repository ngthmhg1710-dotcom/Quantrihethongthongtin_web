import { createBrowserRouter } from 'react-router';
import { Root } from './components/Root';
import { Homepage } from './pages/Homepage';
import { ProductListing } from './pages/ProductListing';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { About } from './pages/About';
import { Contact } from './pages/Contact';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Homepage },
      { path: 'products', Component: ProductListing },
      { path: 'products/:id', Component: ProductDetail },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'login', Component: Login },
      { path: 'dashboard', Component: CustomerDashboard },
      { path: 'admin', Component: AdminDashboard },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
    ],
  },
]);
