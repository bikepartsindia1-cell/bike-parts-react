import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4 bg-gradient-to-br from-amber-400 to-slate-400 bg-clip-text text-transparent">
                            BikeParts India
                        </h3>
                        <p className="text-gray-400">Your trusted partner for premium motorcycle parts and accessories.</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-amber-500 transition-colors">Home</Link></li>
                            <li><Link to="/products" className="text-gray-400 hover:text-amber-500 transition-colors">Products</Link></li>
                            <li><Link to="/cart" className="text-gray-400 hover:text-amber-500 transition-colors">Cart</Link></li>
                            <li><Link to="/account" className="text-gray-400 hover:text-amber-500 transition-colors">Account</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><Link to="/contact" className="text-gray-400 hover:text-amber-500 transition-colors">Contact Us</Link></li>
                            <li><Link to="/returns" className="text-gray-400 hover:text-amber-500 transition-colors">Returns Policy</Link></li>
                            <li><Link to="/privacy" className="text-gray-400 hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/help" className="text-gray-400 hover:text-amber-500 transition-colors">Help Center</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><i className="fas fa-phone mr-2"></i> +91 93543 09314</li>
                            <li><i className="fas fa-envelope mr-2"></i> bikepartsindia1@gmail.com</li>
                            <li><i className="fas fa-map-marker-alt mr-2"></i> Gurgaon, Haryana</li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-700 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} BikeParts India. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
