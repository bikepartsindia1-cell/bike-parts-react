import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AuthModal from './AuthModal';

const Navbar = () => {
    const { user, signOut, isAuthModalOpen, authView, openAuthModal, closeAuthModal } = useAuth();
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // Check if user is admin
    const isAdmin = user?.email === 'bikepartsindia1@gmail.com' || user?.email === 'admin@bikeparts.com';

    return (
        <>
            <nav className="bg-white shadow-lg sticky top-0 z-40 backdrop-blur-lg bg-opacity-95">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link to="/" className="flex-shrink-0">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-slate-600 bg-clip-text text-transparent">
                                    BikeParts India
                                </h1>
                            </Link>
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-8">
                                <Link to="/" className="text-gray-600 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                                <Link to="/products" className="text-gray-600 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">Products</Link>

                                <Link to="/account" className="text-gray-600 hover:text-amber-500 px-3 py-2 rounded-md text-sm font-medium transition-colors">Account</Link>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Admin Dashboard Button - Only visible for admin users */}
                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </button>
                            )}

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 text-gray-600 hover:text-amber-500 transition-colors focus:outline-none"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="hidden md:block text-sm font-medium">
                                        {user ? user.email.split('@')[0] : 'Login'}
                                    </span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 py-2 border border-gray-100">
                                        {user ? (
                                            <>
                                                <Link
                                                    to="/account"
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    My Account
                                                </Link>
                                                {isAdmin && (
                                                    <Link
                                                        to="/admin"
                                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors md:hidden"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <LayoutDashboard className="w-4 h-4 inline mr-2" />
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                <button
                                                    onClick={() => { signOut(); setIsUserMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" /> Logout
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => { openAuthModal('login'); setIsUserMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Login
                                                </button>
                                                <button
                                                    onClick={() => { openAuthModal('register'); setIsUserMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    Create Account
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-amber-500 transition-colors">
                                <ShoppingCart className="w-6 h-6" />
                                {getCartCount() > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {getCartCount()}
                                    </span>
                                )}
                            </Link>

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 text-gray-600 hover:text-amber-500"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-amber-500">Home</Link>
                            <Link to="/products" className="block px-3 py-2 text-gray-600 hover:text-amber-500">Products</Link>
                            <Link to="/cart" className="block px-3 py-2 text-gray-600 hover:text-amber-500">Cart</Link>
                            <Link to="/account" className="block px-3 py-2 text-gray-600 hover:text-amber-500">Account</Link>
                            {isAdmin && (
                                <Link to="/admin" className="block px-3 py-2 text-purple-600 hover:text-purple-700 font-medium">
                                    <LayoutDashboard className="w-4 h-4 inline mr-2" />
                                    Admin Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                initialView={authView}
            />
        </>
    );
};

export default Navbar;
