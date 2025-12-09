import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Chatbot from './Chatbot';

const Layout = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <div className="min-h-screen flex flex-col">
            {!isAdminPage && <Navbar />}
            <main className="flex-1">
                <Outlet />
            </main>
            {!isAdminPage && <Footer />}
            {!isAdminPage && <Chatbot />}
        </div>
    );
};

export default Layout;
