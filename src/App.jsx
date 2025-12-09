import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Account from './pages/Account';
import AdminDashboard from './pages/AdminDashboard';
import Contact from './pages/Contact';
import Returns from './pages/Returns';
import Privacy from './pages/Privacy';
import Help from './pages/Help';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="account" element={<Account />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="contact" element={<Contact />} />
          <Route path="returns" element={<Returns />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="help" element={<Help />} />
          {/* Add more routes here */}
          <Route path="*" element={<div className="p-8 text-center">404 Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
