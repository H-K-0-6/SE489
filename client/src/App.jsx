import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import AuctionHouse from './pages/AuctionHouse'
import ArtisanDashboard from './pages/ArtisanDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import Wishlist from './pages/Wishlist'
import ProductDetails from './pages/ProductDetails'
import AuctionDetails from './pages/AuctionDetails'
import ArtisansList from './pages/ArtisansList'
import ResetPassword from './pages/ResetPassword'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Catalog />} />
        <Route path="/auctions" element={<AuctionHouse />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/auction/:id" element={<AuctionDetails />} />
        <Route path="/artisans" element={<ArtisansList />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/wishlist" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'ARTISAN', 'ADMIN']}>
            <Wishlist />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/artisan" element={
          <ProtectedRoute allowedRoles={['ARTISAN']}>
            <ArtisanDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/customer" element={
          <ProtectedRoute allowedRoles={['CUSTOMER', 'ARTISAN', 'ADMIN']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/admin" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App
