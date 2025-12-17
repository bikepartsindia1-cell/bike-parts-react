import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { User, ShoppingBag, Heart, MapPin, Settings, LogOut } from 'lucide-react';
import AuthModal from '../components/AuthModal';
import { formatPrice } from '../lib/utils';
import { profilesService } from '../lib/profilesService';
import { supabase } from '../lib/supabase';

const Account = () => {
    const { user, signOut } = useAuth();
    const { orders } = useOrders();
    const [activeTab, setActiveTab] = useState('profile');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authView, setAuthView] = useState('login');
    const [profile, setProfile] = useState(null);
    const [profileForm, setProfileForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        pincode: ''
    });
    const [updating, setUpdating] = useState(false);

    // Load user profile data
    useEffect(() => {
        if (user?.id) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
                setProfileForm({
                    firstName: profileData.first_name || '',
                    lastName: profileData.last_name || '',
                    phone: profileData.phone || '',
                    address: profileData.address || '',
                    city: profileData.city || '',
                    pincode: profileData.pincode || ''
                });
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);

        // Validate pincode
        if (profileForm.pincode && !/^[0-9]{6}$/.test(profileForm.pincode)) {
            alert('Pincode must be exactly 6 digits');
            setUpdating(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: profileForm.firstName,
                    last_name: profileForm.lastName,
                    full_name: `${profileForm.firstName} ${profileForm.lastName}`,
                    phone: profileForm.phone,
                    address: profileForm.address,
                    city: profileForm.city,
                    pincode: profileForm.pincode
                })
                .eq('id', user.id);

            if (error) throw error;

            alert('Profile updated successfully!');
            await loadProfile(); // Reload profile data
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile: ' + error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login to Access Your Account</h2>
                    <p className="text-gray-600 mb-8">Create an account or login to manage your profile, orders, and preferences.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => { setAuthView('login'); setIsAuthModalOpen(true); }}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setAuthView('register'); setIsAuthModalOpen(true); }}
                            className="border-2 border-gray-300 hover:border-amber-500 text-gray-700 hover:text-amber-500 font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
                <AuthModal
                    isOpen={isAuthModalOpen}
                    onClose={() => setIsAuthModalOpen(false)}
                    initialView={authView}
                />
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'orders', label: 'Orders', icon: ShoppingBag },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <span className="text-3xl font-bold text-white">
                                        {user.email[0].toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {profile?.first_name || 'User'} {profile?.last_name || ''}
                                </h3>
                                <p className="text-gray-500 text-sm">{user.email}</p>
                            </div>

                            <nav className="space-y-2">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-4 py-3 rounded-xl font-medium flex items-center transition-all duration-200 ${activeTab === tab.id
                                                ? 'bg-amber-500 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                                            }`}
                                    >
                                        <tab.icon className="w-5 h-5 mr-3" />
                                        {tab.label}
                                    </button>
                                ))}
                                <button
                                    onClick={signOut}
                                    className="w-full text-left px-4 py-3 rounded-xl font-medium flex items-center text-red-600 hover:bg-red-50 transition-all duration-200 mt-4"
                                >
                                    <LogOut className="w-5 h-5 mr-3" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm p-8 min-h-[500px]">
                            {activeTab === 'profile' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.firstName}
                                                    onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.lastName}
                                                    onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input type="email" value={user.email} disabled className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input 
                                                type="tel" 
                                                value={profileForm.phone}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none" 
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <textarea 
                                                value={profileForm.address}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                                                rows="2"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                placeholder="Enter your full address"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.city}
                                                    onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                                    placeholder="Enter your city"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                                <input 
                                                    type="text" 
                                                    value={profileForm.pincode}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                                        if (value.length <= 6) {
                                                            setProfileForm(prev => ({ ...prev, pincode: value }));
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    placeholder="Enter 6-digit pincode"
                                                    maxLength="6"
                                                    pattern="[0-9]{6}"
                                                />
                                                {profileForm.pincode && profileForm.pincode.length !== 6 && (
                                                    <p className="text-red-500 text-xs mt-1">Pincode must be exactly 6 digits</p>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={updating}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {updating ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                                    {orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h3>
                                            <p className="text-gray-500">Start shopping to see your orders here!</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map(order => (
                                                <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <div>
                                                            <p className="font-bold text-gray-900">Order #{order.id}</p>
                                                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-amber-600">{formatPrice(order.total)}</p>
                                                            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                                                                {order.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-gray-100 pt-4">
                                                        <p className="text-sm text-gray-600 mb-2">{order.items.length} Items</p>
                                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                                            {order.items.map((item, idx) => (
                                                                <img key={idx} src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'wishlist' && (
                                <div className="text-center py-12">
                                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
                                    <p className="text-gray-500">Add products you love to your wishlist!</p>
                                </div>
                            )}

                            {activeTab === 'addresses' && (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                                        <button className="text-amber-600 hover:text-amber-700 font-medium">
                                            + Add New Address
                                        </button>
                                    </div>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                                        No addresses saved yet.
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-4 border-b border-gray-100">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                                                <p className="text-sm text-gray-500">Receive updates about your orders</p>
                                            </div>
                                            <input type="checkbox" defaultChecked className="toggle-checkbox" />
                                        </div>
                                        <div className="pt-6">
                                            <button className="text-red-600 hover:text-red-700 font-medium">
                                                Delete Account
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
