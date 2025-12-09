import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState('login');

    useEffect(() => {
        // Check for demo admin first
        const demoAdmin = localStorage.getItem('demo_admin_user');
        if (demoAdmin) {
            setUser(JSON.parse(demoAdmin));
            setLoading(false);
            return;
        }

        // Check active sessions and subscribe to auth changes
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const openAuthModal = (view = 'login') => {
        setAuthView(view);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const signIn = async (email, password) => {
        // Demo admin login bypass
        if (email === 'admin@bikeparts.com' && password === 'admin123') {
            const demoAdmin = {
                id: 'admin-demo-001',
                email: 'admin@bikeparts.com',
                user_metadata: {
                    first_name: 'Admin',
                    last_name: 'User',
                    role: 'admin'
                }
            };
            setUser(demoAdmin);
            localStorage.setItem('demo_admin_user', JSON.stringify(demoAdmin));
            closeAuthModal();
            return { data: { user: demoAdmin }, error: null };
        }

        // Regular Supabase authentication
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (!result.error) closeAuthModal();
        return result;
    };

    const signUp = async (email, password, metaData) => {
        const result = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    ...metaData,
                    full_name: `${metaData.first_name} ${metaData.last_name}` // Add full_name for profiles table
                }
            }
        });
        if (!result.error) closeAuthModal();
        return result;
    };

    const signOut = async () => {
        localStorage.removeItem('demo_admin_user');
        setUser(null);
        return supabase.auth.signOut();
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAuthModalOpen,
        authView,
        openAuthModal,
        closeAuthModal
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
