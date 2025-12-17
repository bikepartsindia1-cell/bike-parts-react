import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { profilesService } from '../lib/profilesService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState('login');

    useEffect(() => {
        let timeoutId;
        
        const initializeAuth = async () => {
            try {
                // Set a timeout to prevent infinite loading
                timeoutId = setTimeout(() => {
                    console.warn('Authentication check timed out, proceeding without user session');
                    setLoading(false);
                }, 5000); // 5 second timeout

                // Test profiles table connection (non-blocking)
                profilesService.testConnection().then(result => {
                    if (!result.exists) {
                        console.error('❌ Profiles table does not exist:', result.error);
                        console.log('🔧 Please run the NO_RESTRICTIONS_PROFILES.sql script in Supabase');
                    } else if (!result.canInsert) {
                        console.error('❌ Profiles table exists but cannot insert:', result.error);
                        console.log('🔧 Please run the NO_RESTRICTIONS_PROFILES.sql script to remove restrictions');
                    } else {
                        console.log('✅ Profiles table is working correctly - ready to create profiles!');
                    }
                }).catch(error => {
                    console.warn('Could not test profiles table connection:', error);
                });

                // Check for demo admin first
                const demoAdmin = localStorage.getItem('demo_admin_user');
                if (demoAdmin) {
                    setUser(JSON.parse(demoAdmin));
                    clearTimeout(timeoutId);
                    setLoading(false);
                    return;
                }

                // Check active sessions and subscribe to auth changes
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                clearTimeout(timeoutId);
                setLoading(false);

                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setUser(session?.user ?? null);
                });

                return () => subscription.unsubscribe();
            } catch (error) {
                console.error('Authentication initialization error:', error);
                clearTimeout(timeoutId);
                setLoading(false);
            }
        };

        const cleanup = initializeAuth();
        
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            cleanup?.then(unsubscribe => unsubscribe?.());
        };
    }, []);

    const openAuthModal = (view = 'login') => {
        setAuthView(view);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const signIn = async (email, password) => {
        try {
            // Admin login credentials
            const adminCredentials = [
                { email: 'admin@bikeparts.com', password: 'admin123' },
                { email: 'bikepartsindia1@gmail.com', password: 'admin123' }
            ];

            // Check if this is an admin login
            const adminCred = adminCredentials.find(cred => cred.email === email && cred.password === password);
            
            if (adminCred) {
                const demoAdmin = {
                    id: `admin-demo-${Date.now()}`,
                    email: adminCred.email,
                    user_metadata: {
                        first_name: 'Admin',
                        last_name: 'User',
                        role: 'admin'
                    }
                };
                setUser(demoAdmin);
                localStorage.setItem('demo_admin_user', JSON.stringify(demoAdmin));
                closeAuthModal();
                console.log('Admin logged in:', adminCred.email);
                return { data: { user: demoAdmin }, error: null };
            }

            // Regular Supabase authentication with database verification
            console.log('🔐 Attempting login for:', email);
            const result = await supabase.auth.signInWithPassword({ email, password });
            
            // Check for errors and provide detailed logging
            if (result.error) {
                console.error('❌ Login error:', result.error);
                console.log('Error details:', {
                    message: result.error.message,
                    status: result.error.status,
                    code: result.error.code
                });

                // Skip email confirmation checks - allow all logins

                // Check for invalid credentials
                if (result.error.message.includes('Invalid login credentials') || 
                    result.error.message.includes('invalid_credentials')) {
                    return { 
                        data: null, 
                        error: { 
                            message: 'Invalid email or password. Please check your credentials and try again.',
                            type: 'invalid_credentials'
                        } 
                    };
                }

                // Return other errors as-is with better formatting
                return { 
                    data: null, 
                    error: { 
                        message: result.error.message || 'Login failed. Please try again.',
                        type: 'auth_error'
                    } 
                };
            }
            
            if (result.data?.user) {
                console.log('✅ Login successful for:', email);
                console.log('User data:', result.data.user);
                
                // Email confirmation disabled - allow all logins

                // Check if we need to create profile for this user
                const signupData = localStorage.getItem(`signup_data_${result.data.user.id}`);
                if (signupData) {
                    console.log('📝 Creating profile on first login...');
                    try {
                        const userData = JSON.parse(signupData);
                        
                        const { error: profileError } = await supabase
                            .from('profiles')
                            .insert([{
                                id: result.data.user.id,
                                email: email,
                                first_name: userData.firstName,
                                last_name: userData.lastName,
                                full_name: `${userData.firstName} ${userData.lastName}`,
                                phone: userData.phone || null,
                                password: userData.password
                            }]);

                        if (!profileError) {
                            console.log('✅ Profile created on first login');
                            localStorage.removeItem(`signup_data_${result.data.user.id}`);
                        } else {
                            console.warn('⚠️ Profile creation failed on login:', profileError);
                        }
                    } catch (e) {
                        console.warn('⚠️ Could not create profile on login:', e);
                    }
                }

                // Fetch user profile from database
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', result.data.user.id)
                        .single();

                    if (profile) {
                        // Merge profile data with user object
                        result.data.user.profile = profile;
                        console.log('✅ Profile data loaded:', profile);
                    }
                } catch (profileError) {
                    console.warn('⚠️ Could not load profile:', profileError);
                }
                
                console.log('✅ Regular user logged in:', email);
                closeAuthModal();
            }
            
            return result;
        } catch (error) {
            console.error('Login error:', error);
            return { data: null, error: error.message };
        }
    };

    const signUp = async (email, password, metaData) => {
        try {
            console.log('🔐 Starting simple signup process for:', email);

            // Simple signup without any metadata to avoid trigger issues
            const result = await supabase.auth.signUp({
                email,
                password
            });

            console.log('🔐 Auth signup result:', result);

            // Check if auth signup failed
            if (result.error) {
                console.error('❌ Auth signup failed:', result.error);
                return result;
            }

            // If signup successful, we'll create profile on first login instead
            if (result.data?.user) {
                console.log('✅ User created in auth successfully:', result.data.user.id);
                console.log('📝 Profile will be created on first login');
                
                // Store signup data in localStorage for profile creation on login
                localStorage.setItem(`signup_data_${result.data.user.id}`, JSON.stringify({
                    firstName: metaData.first_name,
                    lastName: metaData.last_name,
                    phone: metaData.phone,
                    password: password
                }));
            }

            if (!result.error) {
                console.log('✅ Signup completed successfully');
                closeAuthModal();
            }
            return result;
        } catch (error) {
            console.error('❌ Signup error:', error);
            return { 
                data: null, 
                error: { 
                    message: `Signup failed: ${error.message}`,
                    type: 'signup_error'
                } 
            };
        }
    };

    const signOut = async () => {
        localStorage.removeItem('demo_admin_user');
        setUser(null);
        return supabase.auth.signOut();
    };

    // Email confirmation disabled

    // Check if current user is admin (more secure check)
    const isAdmin = () => {
        if (!user) return false;
        
        // Check if user has admin role in metadata
        if (user.user_metadata?.role === 'admin') {
            // Verify the email is one of the allowed admin emails
            const adminEmails = ['admin@bikeparts.com', 'bikepartsindia1@gmail.com'];
            return adminEmails.includes(user.email);
        }
        
        return false;
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
        closeAuthModal,
        isAdmin
    };

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <AuthContext.Provider value={value}>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading...</p>
                    </div>
                </div>
            </AuthContext.Provider>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
