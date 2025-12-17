import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
    const [view, setView] = useState(initialView);
    const { signIn, signUp, resendVerificationEmail } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form states - declare before useEffect
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [emailVerificationError, setEmailVerificationError] = useState(false);
    const [resendingEmail, setResendingEmail] = useState(false);

    // Update view when initialView changes
    React.useEffect(() => {
        setView(initialView);
    }, [initialView]);

    // Reset form state when modal is closed or view changes
    React.useEffect(() => {
        if (!isOpen) {
            setError('');
            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setPhone('');
            setPhoneError('');
            setLoading(false);
        }
    }, [isOpen]);

    // Also reset when switching between login/register
    React.useEffect(() => {
        setError('');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setPhone('');
        setPhoneError('');
        setEmailVerificationError(false);
        setResendingEmail(false);
    }, [view]);

    // Handle phone number input - only digits, validate 10 digits
    const handlePhoneChange = (e) => {
        let value = e.target.value;
        
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, '');
        
        // Limit to 10 digits maximum
        const phoneDigits = digits.slice(0, 10);
        
        // Validate phone number length
        if (phoneDigits.length > 0 && phoneDigits.length < 10) {
            setPhoneError('Phone number must be 10 digits');
        } else if (phoneDigits.length === 10) {
            setPhoneError('');
        } else {
            setPhoneError('');
        }
        
        setPhone(phoneDigits);
    };

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (view === 'login') {
                const { data, error } = await signIn(email, password);
                
                if (error) {
                    // Check if it's an email verification error
                    if (error.type === 'email_not_verified') {
                        setEmailVerificationError(true);
                        setError(error.message);
                    } else {
                        setEmailVerificationError(false);
                        setError(error.message);
                    }
                    setLoading(false);
                    return;
                }

                // Check if user is admin and redirect to admin dashboard
                if (data?.user?.email === 'admin@bikeparts.com' || data?.user?.user_metadata?.role === 'admin') {
                    navigate('/admin');
                }
                // Modal closes automatically via AuthContext
            } else {
                // Validate phone number before signup
                if (phone.length !== 10) {
                    setError('Please enter a valid 10-digit phone number');
                    setLoading(false);
                    return;
                }

                const { data, error } = await signUp(email, password, {
                    first_name: firstName,
                    last_name: lastName,
                    phone: `+91${phone}` // Store as +91XXXXXXXXXX
                });
                
                if (error) {
                    setError(error.message);
                    setLoading(false);
                    return;
                }

                // Show success message for signup
                if (data?.user && !data.user.email_confirmed_at) {
                    setError('Account created successfully! Please check your email and click the verification link before logging in.');
                    setLoading(false);
                    return;
                }
                
                // Modal closes automatically via AuthContext
            }
        } catch (err) {
            setError(err.message || 'An error occurred');
            setEmailVerificationError(false);
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        setResendingEmail(true);
        try {
            const result = await resendVerificationEmail(email);
            if (result.success) {
                setError('Verification email sent! Please check your inbox and spam folder.');
            } else {
                setError(result.error || 'Failed to send verification email');
            }
        } catch (error) {
            setError('Failed to send verification email');
        } finally {
            setResendingEmail(false);
        }
    };

    const toggleView = () => {
        setView(view === 'login' ? 'register' : 'login');
        setError('');
        setEmailVerificationError(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900">
                        {view === 'login' ? 'Welcome Back' : 'Create Account'}
                    </h3>
                    <p className="text-gray-500 mt-2">
                        {view === 'login'
                            ? 'Enter your credentials to access your account'
                            : 'Join us to start shopping for premium bike parts'}
                    </p>
                </div>

                {error && (
                    <div className={`p-3 rounded-lg mb-6 text-sm ${
                        error.includes('successfully') || error.includes('Verification email sent') 
                            ? 'bg-green-50 text-green-600' 
                            : 'bg-red-50 text-red-600'
                    }`}>
                        {error}
                        {emailVerificationError && view === 'login' && (
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={resendingEmail}
                                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {view === 'login' && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-amber-900 mb-2">Admin Access</h4>
                                <div className="text-xs text-amber-800 space-y-1">
                                    <p className="font-mono bg-white/50 px-2 py-1 rounded">📧 admin@bikeparts.com</p>
                                    <p className="font-mono bg-white/50 px-2 py-1 rounded">🔑 admin123</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {view === 'register' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Rahul"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Sharma"
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="rahul.sharma@gmail.com"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    {view === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    placeholder="9876543210"
                                    autoComplete="off"
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                        phoneError 
                                            ? 'border-red-300 focus:ring-red-500' 
                                            : 'border-gray-300 focus:ring-amber-500'
                                    }`}
                                    maxLength="10" // 10 digits only
                                />
                            </div>
                            {phoneError && (
                                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                            )}
                            <p className="text-gray-500 text-xs mt-1">Enter 10-digit mobile number</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                        {loading ? 'Processing...' : (view === 'login' ? 'Login' : 'Create Account')}
                        {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        {view === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={toggleView}
                            className="text-amber-600 hover:text-amber-700 font-semibold"
                        >
                            {view === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
