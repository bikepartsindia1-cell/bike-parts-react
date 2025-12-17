import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, ShoppingBag, Users, TrendingUp, Plus, Edit, Trash2, Search,
    Bell, LogOut, LayoutDashboard, Box, ShoppingCart, UserCircle, Warehouse, BarChart3,
    ArrowUp, AlertTriangle, X, Save, Eye, Truck, Check, XCircle, Mail
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import { notificationService } from '../lib/notificationService';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const { orders, loading, refreshOrders, placeOrder, updateOrderStatus, deleteOrder } = useOrders();
    const { user, signOut } = useAuth();

    // Customers state
    const [customers, setCustomers] = useState([]);
    const [customersLoading, setCustomersLoading] = useState(false);

    // Notifications state
    const [showNotifications, setShowNotifications] = useState(false);

    // Debug orders
    useEffect(() => {
        console.log('🏪 AdminDashboard - Orders updated:', orders.length, orders);
    }, [orders]);

    // Simple refresh function
    const handleRefreshOrders = async () => {
        console.log('🔄 Refreshing orders...');
        await refreshOrders();
    };

    // Fetch customers from profiles table
    const fetchCustomers = async () => {
        try {
            setCustomersLoading(true);
            console.log('👥 Fetching customers...');

            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Customers fetch error:', error);
                throw error;
            }

            console.log(`✅ Customers fetched: ${profiles?.length || 0} customers`);
            setCustomers(profiles || []);
        } catch (error) {
            console.error('❌ Error fetching customers:', error);
            setCustomers([]);
        } finally {
            setCustomersLoading(false);
        }
    };

    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');

    // Modals
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [isEditProductOpen, setIsEditProductOpen] = useState(false);
    const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Track order count changes and play notification for new orders (admin only)
    useEffect(() => {
        const previousOrderCount = parseInt(localStorage.getItem('previousOrderCount') || '0');
        const currentOrderCount = orders.length;
        
        console.log('📊 Order count check:', { previousOrderCount, currentOrderCount, isAdmin: notificationService.isAdminUser(user) });
        
        // Only play notification if there are new orders and user is admin
        if (currentOrderCount > previousOrderCount && previousOrderCount > 0) {
            if (notificationService.isAdminUser(user)) {
                console.log('🔔 New order detected! Playing admin notification...');
                notificationService.playOrderNotification();
            } else {
                console.log('❌ New order detected but user is not admin');
            }
        }
        
        localStorage.setItem('previousOrderCount', currentOrderCount.toString());
    }, [orders.length, user]);

    // Fetch customers when switching to customers section
    useEffect(() => {
        if (activeSection === 'customers') {
            fetchCustomers();
        }
    }, [activeSection]);

    // Close notifications when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest('.notifications-dropdown')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    // Product form state
    const [productForm, setProductForm] = useState({
        name: '',
        brand: '',
        category: '',
        price: '',
        inStock: '',
        description: '',
        image: '',
        compatibility: ''
    });

    // Brand and Category management
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newBrand, setNewBrand] = useState('');
    const [newCategory, setNewCategory] = useState('');

    // Load brands and categories from localStorage
    useEffect(() => {
        const savedBrands = localStorage.getItem('bikeparts_brands');
        const savedCategories = localStorage.getItem('bikeparts_categories');

        if (savedBrands) {
            setBrands(JSON.parse(savedBrands));
        } else {
            const defaultBrands = ['Royal Enfield', 'Honda', 'Bajaj', 'Hero', 'TVS', 'Yamaha', 'Kawasaki', 'KTM', 'Suzuki', 'Universal'];
            setBrands(defaultBrands);
            localStorage.setItem('bikeparts_brands', JSON.stringify(defaultBrands));
        }

        if (savedCategories) {
            setCategories(JSON.parse(savedCategories));
        } else {
            const defaultCategories = ['Headlights', 'Brakes', 'Engine', 'Body Parts', 'Transmission', 'Exhaust', 'Handlebars', 'Mirrors', 'Tools', 'Suspension', 'Electronics'];
            setCategories(defaultCategories);
            localStorage.setItem('bikeparts_categories', JSON.stringify(defaultCategories));
        }
    }, []);

    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const totalCustomers = new Set(orders.map(o => o.user_id)).size;
    const lowStockProducts = products.filter(p => p.inStock < 10);

    const stats = [
        {
            label: 'Total Orders',
            value: totalOrders,
            icon: ShoppingCart,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-600',
            growth: '+12%'
        },
        {
            label: 'Total Revenue',
            value: formatPrice(totalRevenue),
            icon: TrendingUp,
            color: 'bg-green-500',
            bgColor: 'bg-green-100',
            textColor: 'text-green-600',
            growth: '+8%'
        },
        {
            label: 'Total Customers',
            value: totalCustomers,
            icon: Users,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-600',
            growth: '+15%'
        },
        {
            label: 'Low Stock Items',
            value: lowStockProducts.length,
            icon: AlertTriangle,
            color: 'bg-red-500',
            bgColor: 'bg-red-100',
            textColor: 'text-red-600',
            alert: true
        },
    ];

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Box },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'inventory', label: 'Inventory', icon: Warehouse },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ];

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );



    const handleAddProduct = async (e) => {
        e.preventDefault();

        const newProduct = {
            name: productForm.name,
            brand: productForm.brand,
            category: productForm.category,
            price: parseFloat(productForm.price),
            inStock: parseInt(productForm.inStock),
            description: productForm.description,
            image: productForm.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=500',
            compatibility: productForm.compatibility ? productForm.compatibility.split(',').map(s => s.trim()) : []
        };

        const result = await addProduct(newProduct);
        
        if (result.success) {
            alert('Product added successfully!');
            setIsAddProductOpen(false);
            resetForm();
        } else {
            alert(`Failed to save product to database: ${result.error}`);
        }
    };

    const handleEditProduct = async (e) => {
        e.preventDefault();

        const updatedData = {
            name: productForm.name,
            brand: productForm.brand,
            category: productForm.category,
            price: parseFloat(productForm.price),
            inStock: parseInt(productForm.inStock),
            description: productForm.description,
            image: productForm.image,
            compatibility: productForm.compatibility ? productForm.compatibility.split(',').map(s => s.trim()) : []
        };

        const result = await updateProduct(editingProduct.id, updatedData);
        
        if (result.success) {
            alert('Product updated successfully!');
            setIsEditProductOpen(false);
            setEditingProduct(null);
            resetForm();
        } else {
            alert(`Failed to update product: ${result.error}`);
        }
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(id);
        }
    };

    const resetForm = () => {
        setProductForm({
            name: '',
            brand: '',
            category: '',
            price: '',
            inStock: '',
            description: '',
            image: '',
            compatibility: ''
        });
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: product.price.toString(),
            inStock: product.inStock.toString(),
            description: product.description || '',
            image: product.image || '',
            compatibility: Array.isArray(product.compatibility) ? product.compatibility.join(', ') : ''
        });
        setIsEditProductOpen(true);
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            alert(`Order status updated to ${newStatus}`);
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } else {
            console.error('Update failed:', result.error);
            alert(`Failed to update order status.\nError: ${result.error?.message || JSON.stringify(result.error)}\nYour Email: ${user?.email}`);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this order?')) {
            const result = await deleteOrder(orderId);
            if (result.success) {
                alert('Order deleted successfully');
                if (selectedOrder && selectedOrder.id === orderId) {
                    setIsOrderModalOpen(false);
                    setSelectedOrder(null);
                }
            } else {
                alert('Failed to delete order');
            }
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setIsOrderModalOpen(true);
    };

    const handleNotifyUser = (order) => {
        // Format phone number: remove non-digits, ensure it starts with country code if missing (assuming +91 for India)
        let phone = order.shipping_address?.phone?.replace(/\D/g, '') || '';
        if (phone.length === 10) {
            phone = '91' + phone;
        }

        const message = `Dear Customer, Your order #${order.id} status has been updated to: ${order.status}. Thank you for shopping with BikeParts India!`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank');
    };

    const [addMessage, setAddMessage] = useState({ type: '', text: '' });

    const handleAddBrand = () => {
        const brandToAdd = newBrand.trim();
        if (brandToAdd && !brands.includes(brandToAdd)) {
            const updatedBrands = [...brands, brandToAdd];
            setBrands(updatedBrands);
            localStorage.setItem('bikeparts_brands', JSON.stringify(updatedBrands));
            setNewBrand('');
            setAddMessage({ type: 'success', text: `Brand "${brandToAdd}" added!` });
            setTimeout(() => {
                setIsAddBrandOpen(false);
                setAddMessage({ type: '', text: '' });
            }, 1500);
        } else if (!brandToAdd) {
            setAddMessage({ type: 'error', text: "Please enter a brand name." });
        } else {
            setAddMessage({ type: 'error', text: "This brand already exists." });
        }
    };

    const handleAddCategory = () => {
        const categoryToAdd = newCategory.trim();
        if (categoryToAdd && !categories.includes(categoryToAdd)) {
            const updatedCategories = [...categories, categoryToAdd];
            setCategories(updatedCategories);
            localStorage.setItem('bikeparts_categories', JSON.stringify(updatedCategories));
            setNewCategory('');
            setAddMessage({ type: 'success', text: `Category "${categoryToAdd}" added!` });
            setTimeout(() => {
                setIsAddCategoryOpen(false);
                setAddMessage({ type: '', text: '' });
            }, 1500);
        } else if (!categoryToAdd) {
            setAddMessage({ type: 'error', text: "Please enter a category name." });
        } else {
            setAddMessage({ type: 'error', text: "This category already exists." });
        }
    };

    const handleDeleteBrand = (brandToDelete) => {
        if (window.confirm(`Are you sure you want to delete "${brandToDelete}"?`)) {
            const updatedBrands = brands.filter(b => b !== brandToDelete);
            setBrands(updatedBrands);
            localStorage.setItem('bikeparts_brands', JSON.stringify(updatedBrands));
        }
    };

    const handleDeleteCategory = (categoryToDelete) => {
        if (window.confirm(`Are you sure you want to delete "${categoryToDelete}"?`)) {
            const updatedCategories = categories.filter(c => c !== categoryToDelete);
            setCategories(updatedCategories);
            localStorage.setItem('bikeparts_categories', JSON.stringify(updatedCategories));
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Top Navigation */}
            <nav className="bg-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-slate-600 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                            >
                                <Package className="w-4 h-4 mr-2" /> View Website
                            </button>
                            <div className="relative notifications-dropdown">
                                <button 
                                    onClick={() => {
                                        setShowNotifications(!showNotifications);
                                        // Play cute bell sound when opening notifications
                                        if (!showNotifications) {
                                            notificationService.playBellSound();
                                        }
                                    }}
                                    className="p-2 text-gray-600 hover:text-amber-500 transition-colors relative"
                                    title="Notifications"
                                >
                                    <Bell className="w-5 h-5" />
                                    {(() => {
                                        const recentOrders = orders.filter(order => {
                                            const orderDate = new Date(order.created_at);
                                            const today = new Date();
                                            const diffTime = Math.abs(today - orderDate);
                                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                            return diffDays <= 1; // Orders from last 24 hours
                                        });
                                        const totalNotifications = recentOrders.length + lowStockProducts.length;
                                        
                                        return totalNotifications > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                                {totalNotifications > 99 ? '99+' : totalNotifications}
                                            </span>
                                        );
                                    })()}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                        </div>
                                        
                                        <div className="divide-y divide-gray-100">
                                            {/* Recent Orders */}
                                            {(() => {
                                                const recentOrders = orders.filter(order => {
                                                    const orderDate = new Date(order.created_at);
                                                    const today = new Date();
                                                    const diffTime = Math.abs(today - orderDate);
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                    return diffDays <= 1;
                                                }).slice(0, 5);

                                                return recentOrders.map(order => (
                                                    <div key={`order-${order.id}`} className="p-4 hover:bg-gray-50">
                                                        <div className="flex items-start space-x-3">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    New Order #{order.id}
                                                                </p>
                                                                <p className="text-xs text-gray-600">
                                                                    {order.shipping_address?.name || 'Customer'} • {formatPrice(order.total)}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(order.created_at).toLocaleString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}

                                            {/* Low Stock Alerts */}
                                            {lowStockProducts.slice(0, 5).map(product => (
                                                <div key={`stock-${product.id}`} className="p-4 hover:bg-gray-50">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                Low Stock Alert
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {product.name} - Only {product.inStock} left
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {product.brand}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* No Notifications */}
                                            {orders.filter(order => {
                                                const orderDate = new Date(order.created_at);
                                                const today = new Date();
                                                const diffTime = Math.abs(today - orderDate);
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                return diffDays <= 1;
                                            }).length === 0 && lowStockProducts.length === 0 && (
                                                <div className="p-8 text-center">
                                                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500">No new notifications</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                className="w-full text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Close Notifications
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <div className="hidden lg:block w-64 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen sticky top-16">
                    <div className="p-6">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-white font-semibold">Administrator</h3>
                            <p className="text-gray-400 text-sm">admin@bikeparts.com</p>
                        </div>

                        <nav className="space-y-2">
                            {sidebarItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${activeSection === item.id
                                        ? 'bg-amber-500 text-white transform translate-x-1'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                    {activeSection === 'dashboard' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                                <p className="text-gray-600 mt-2">Monitor your store's performance and manage operations</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                            <div className={`${stat.bgColor} p-3 rounded-lg`}>
                                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            {stat.alert ? (
                                                <div className="flex items-center text-sm text-red-600">
                                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                                    <span>Requires attention</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-sm text-green-600">
                                                    <ArrowUp className="w-4 h-4 mr-1" />
                                                    <span>{stat.growth} from last month</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                                    <button
                                        onClick={() => setActiveSection('orders')}
                                        className="text-sm text-amber-600 hover:text-amber-500 font-medium"
                                    >
                                        View All Orders
                                    </button>

                                    <button
                                        onClick={handleRefreshOrders}
                                        disabled={loading}
                                        className="ml-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 font-medium transition-colors disabled:opacity-50"
                                    >
                                        🔄 Refresh
                                    </button>
                                </div>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                                        <p className="text-gray-500 mt-2">Loading orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">No orders found</p>
                                        <p className="text-sm text-gray-400">
                                            Try the "🔄 Refresh" button above to reload orders
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.slice(0, 5).map(order => (
                                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-medium text-gray-900">#{order.id}</td>
                                                        <td className="py-3 px-4 text-gray-600">{order.order_items?.length || order.items?.length || 0} items</td>
                                                        <td className="py-3 px-4 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                                                        <td className="py-3 px-4">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                                className={`text-xs rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Processing">Processing</option>
                                                                <option value="Shipped">Shipped</option>
                                                                <option value="Delivered">Delivered</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600 text-sm">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleViewOrder(order)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                {/* Notify User button removed as requested */}
                                                                {order.status !== 'Cancelled' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm('Are you sure you want to cancel this order?')) {
                                                                                handleStatusUpdate(order.id, 'Cancelled');
                                                                            }
                                                                        }}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                        title="Cancel Order"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                                                    title="Delete Order"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'products' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900">Product Management</h2>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setIsAddBrandOpen(true)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Brand
                                    </button>
                                    <button
                                        onClick={() => setIsAddCategoryOpen(true)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Add Category
                                    </button>
                                    <button
                                        onClick={() => setIsAddProductOpen(true)}
                                        className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
                                    >
                                        <Plus className="w-5 h-5 mr-2" /> Add New Product
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-600">Total Products:</span>
                                        <span className="font-semibold text-amber-600">{products.length}</span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Image</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Brand</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Price</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Stock</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredProducts.map(product => (
                                                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">{product.brand}</td>
                                                    <td className="py-3 px-4 text-gray-600">{product.category}</td>
                                                    <td className="py-3 px-4 font-semibold text-gray-900">{formatPrice(product.price)}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${product.inStock < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                            }`}>
                                                            {product.inStock} units
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-600">⭐ {product.rating}</td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => openEditModal(product)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'orders' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
                                <button
                                    onClick={handleRefreshOrders}
                                    disabled={loading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    🔄 Refresh Orders
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'Pending').length}</div>
                                    <div className="text-sm text-blue-800 mt-1">Pending Orders</div>
                                </div>
                                <div className="bg-orange-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-orange-600">{orders.filter(o => o.status === 'Processing').length}</div>
                                    <div className="text-sm text-orange-800 mt-1">Processing Orders</div>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-purple-600">{orders.filter(o => o.status === 'Shipped').length}</div>
                                    <div className="text-sm text-purple-800 mt-1">Shipped Orders</div>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-green-600">{orders.filter(o => o.status === 'Delivered').length}</div>
                                    <div className="text-sm text-green-800 mt-1">Completed Orders</div>
                                </div>
                            </div>

                            {/* All Orders Table */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Orders</h3>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                                        <p className="text-gray-500 mt-2">Loading orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">No orders found</p>
                                        <p className="text-sm text-gray-400">
                                            Orders from the database will appear here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Order ID</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Items</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 font-medium text-gray-900">#{order.id}</td>
                                                        <td className="py-3 px-4 text-gray-600">
                                                            {order.shipping_address?.name || order.shippingAddress?.name || 'N/A'}
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600">{order.order_items?.length || order.items?.length || 0} items</td>
                                                        <td className="py-3 px-4 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                                                        <td className="py-3 px-4">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                                className={`text-xs rounded-full px-2 py-1 border-none focus:ring-2 focus:ring-amber-500 cursor-pointer ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                    order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Processing">Processing</option>
                                                                <option value="Shipped">Shipped</option>
                                                                <option value="Delivered">Delivered</option>
                                                                <option value="Cancelled">Cancelled</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-3 px-4 text-gray-600 text-sm">
                                                            {new Date(order.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleViewOrder(order)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                                    title="View Details"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteOrder(order.id)}
                                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                                    title="Delete Order"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'customers' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
                                <button
                                    onClick={async () => {
                                        await Promise.all([
                                            handleRefreshOrders(),
                                            fetchCustomers()
                                        ]);
                                    }}
                                    disabled={loading || customersLoading}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    🔄 Refresh Data
                                </button>
                            </div>

                            {/* Customer Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
                                <div className="bg-blue-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-blue-600">{customers.length}</div>
                                    <div className="text-sm text-blue-800 mt-1">Total Customers</div>
                                </div>
                            </div>

                            {/* Customers Table */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">All Customers</h3>
                                {customersLoading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                                        <p className="text-gray-500 mt-2">Loading customers...</p>
                                    </div>
                                ) : customers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500 mb-4">No customers found</p>
                                        <p className="text-sm text-gray-400">
                                            Customer profiles will appear here when users register
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Phone</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">City</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Pincode</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Orders</th>
                                                    <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customers.map(customer => {
                                                    // Debug: Log customer and order data to check matching
                                                    console.log('🔍 Customer data:', customer);
                                                    console.log('📋 Available orders:', orders.map(o => ({ id: o.id, user_id: o.user_id })));
                                                    
                                                    // Try different possible user ID fields
                                                    const customerUserId = customer.user_id || customer.id || customer.email;
                                                    
                                                    const customerOrders = orders.filter(order => {
                                                        // Try matching with different fields
                                                        const match = order.user_id === customerUserId || 
                                                                     order.user_id === customer.user_id ||
                                                                     order.user_id === customer.id ||
                                                                     order.user_id === customer.email;
                                                        if (match) {
                                                            console.log('✅ Order match found:', order.id, 'for customer:', customer.email);
                                                        }
                                                        return match;
                                                    });
                                                    
                                                    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
                                                    
                                                    console.log('📊 Customer orders count:', customerOrders.length, 'for', customer.email);
                                                    
                                                    return (
                                                        <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                            <td className="py-3 px-4">
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {customer.first_name && customer.last_name 
                                                                            ? `${customer.first_name} ${customer.last_name}`
                                                                            : 'N/A'
                                                                        }
                                                                    </p>
                                                                    {totalSpent > 0 && (
                                                                        <p className="text-sm text-green-600">
                                                                            Total spent: {formatPrice(totalSpent)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600">
                                                                {customer.email || 'N/A'}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600">
                                                                {customer.phone || 'N/A'}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600">
                                                                {customer.city || 'N/A'}
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600">
                                                                {customer.pincode || 'N/A'}
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                                                    customerOrders.length > 0 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {customerOrders.length} orders
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-gray-600 text-sm">
                                                                {customer.created_at 
                                                                    ? new Date(customer.created_at).toLocaleDateString()
                                                                    : 'N/A'
                                                                }
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'inventory' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Inventory Management</h2>
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
                                <div className="space-y-3">
                                    {lowStockProducts.map(product => (
                                        <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                            <div className="flex items-center space-x-4">
                                                <img src={product.image} alt={product.name} className="w-12 h-12 rounded object-cover" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-sm text-gray-600">{product.brand}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-red-600">{product.inStock} units left</p>
                                                <p className="text-sm text-gray-600">Reorder needed</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'analytics' && (
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Analytics & Reports</h2>
                            
                            {/* Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-blue-100 text-sm">Total Revenue</p>
                                            <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                                        </div>
                                        <TrendingUp className="w-8 h-8 text-blue-200" />
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-green-100 text-sm">Avg Order Value</p>
                                            <p className="text-2xl font-bold">
                                                {orders.length > 0 ? formatPrice(totalRevenue / orders.length) : '₹0'}
                                            </p>
                                        </div>
                                        <ShoppingCart className="w-8 h-8 text-green-200" />
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-purple-100 text-sm">Total Products</p>
                                            <p className="text-2xl font-bold">{products.length}</p>
                                        </div>
                                        <Package className="w-8 h-8 text-purple-200" />
                                    </div>
                                </div>
                                
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-orange-100 text-sm">Conversion Rate</p>
                                            <p className="text-2xl font-bold">
                                                {customers.length > 0 ? Math.round((orders.length / customers.length) * 100) : 0}%
                                            </p>
                                        </div>
                                        <Users className="w-8 h-8 text-orange-200" />
                                    </div>
                                </div>
                            </div>

                            {/* Top Priority Sections */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                {/* Monthly Revenue Trend */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
                                    <div className="space-y-4">
                                        {(() => {
                                            const currentMonth = new Date().getMonth();
                                            const currentYear = new Date().getFullYear();
                                            const monthlyOrders = orders.filter(order => {
                                                const orderDate = new Date(order.created_at);
                                                return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
                                            });
                                            const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
                                            
                                            return (
                                                <>
                                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-blue-600">{monthlyOrders.length}</p>
                                                        <p className="text-sm text-blue-800">Orders This Month</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-green-600">{formatPrice(monthlyRevenue)}</p>
                                                        <p className="text-sm text-green-800">Monthly Revenue</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-purple-600">
                                                            {monthlyOrders.length > 0 ? formatPrice(monthlyRevenue / monthlyOrders.length) : '₹0'}
                                                        </p>
                                                        <p className="text-sm text-purple-800">Avg Order Value</p>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Inventory Health */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Health</h3>
                                    <div className="space-y-4">
                                        {(() => {
                                            const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.inStock), 0);
                                            const lowStockCount = products.filter(p => p.inStock < 10).length;
                                            const outOfStockCount = products.filter(p => p.inStock === 0).length;
                                            
                                            return (
                                                <>
                                                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-amber-600">{formatPrice(totalInventoryValue)}</p>
                                                        <p className="text-sm text-amber-800">Total Inventory Value</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-red-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                                                        <p className="text-sm text-red-800">Low Stock Items</p>
                                                    </div>
                                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-gray-600">{outOfStockCount}</p>
                                                        <p className="text-sm text-gray-800">Out of Stock</p>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Pending Orders</span>
                                            <span className="font-semibold text-blue-600">
                                                {orders.filter(o => o.status === 'Pending').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Processing Orders</span>
                                            <span className="font-semibold text-orange-600">
                                                {orders.filter(o => o.status === 'Processing').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Shipped Orders</span>
                                            <span className="font-semibold text-purple-600">
                                                {orders.filter(o => o.status === 'Shipped').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Completed Orders</span>
                                            <span className="font-semibold text-green-600">
                                                {orders.filter(o => o.status === 'Delivered').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-700">Total Customers</span>
                                            <span className="font-semibold text-indigo-600">{customers.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Analytics */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Top Products */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Stock</h3>
                                    <div className="space-y-3">
                                        {products
                                            .sort((a, b) => b.inStock - a.inStock)
                                            .slice(0, 5)
                                            .map((product, index) => (
                                                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{product.name}</p>
                                                            <p className="text-sm text-gray-600">{product.brand}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{product.inStock} units</p>
                                                        <p className="text-sm text-gray-600">{formatPrice(product.price)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Order Status Distribution */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                                    <div className="space-y-3">
                                        {[
                                            { status: 'Pending', count: orders.filter(o => o.status === 'Pending').length, color: 'bg-blue-500' },
                                            { status: 'Processing', count: orders.filter(o => o.status === 'Processing').length, color: 'bg-orange-500' },
                                            { status: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length, color: 'bg-purple-500' },
                                            { status: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, color: 'bg-green-500' },
                                            { status: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length, color: 'bg-red-500' }
                                        ].map((item) => (
                                            <div key={item.status} className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-4 h-4 rounded ${item.color}`}></div>
                                                    <span className="text-gray-700">{item.status}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold text-gray-900">{item.count}</span>
                                                    <span className="text-sm text-gray-500">
                                                        ({orders.length > 0 ? Math.round((item.count / orders.length) * 100) : 0}%)
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Customer Insights & Product Performance */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Top Customers */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Orders</h3>
                                    <div className="space-y-3">
                                        {customers
                                            .map(customer => {
                                                const customerOrders = orders.filter(order => 
                                                    order.user_id === customer.user_id || 
                                                    order.user_id === customer.id
                                                );
                                                const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
                                                return { ...customer, orderCount: customerOrders.length, totalSpent };
                                            })
                                            .filter(customer => customer.orderCount > 0)
                                            .sort((a, b) => b.orderCount - a.orderCount)
                                            .slice(0, 5)
                                            .map((customer, index) => (
                                                <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="w-6 h-6 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {customer.first_name && customer.last_name 
                                                                    ? `${customer.first_name} ${customer.last_name}`
                                                                    : customer.email || 'Customer'
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600">{customer.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">{customer.orderCount} orders</p>
                                                        <p className="text-sm text-green-600">{formatPrice(customer.totalSpent)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        {customers.filter(c => {
                                            const customerOrders = orders.filter(order => 
                                                order.user_id === c.user_id || order.user_id === c.id
                                            );
                                            return customerOrders.length > 0;
                                        }).length === 0 && (
                                            <p className="text-gray-500 text-center py-4">No customer orders found</p>
                                        )}
                                    </div>
                                </div>

                                {/* Product Categories Performance */}
                                <div className="bg-white rounded-xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Categories</h3>
                                    <div className="space-y-3">
                                        {(() => {
                                            const categoryStats = {};
                                            products.forEach(product => {
                                                if (!categoryStats[product.category]) {
                                                    categoryStats[product.category] = {
                                                        count: 0,
                                                        totalValue: 0,
                                                        totalStock: 0
                                                    };
                                                }
                                                categoryStats[product.category].count++;
                                                categoryStats[product.category].totalValue += product.price * product.inStock;
                                                categoryStats[product.category].totalStock += product.inStock;
                                            });
                                            
                                            return Object.entries(categoryStats)
                                                .sort((a, b) => b[1].count - a[1].count)
                                                .slice(0, 6)
                                                .map(([category, stats], index) => (
                                                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="w-6 h-6 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                                                                {index + 1}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium text-gray-900">{category}</p>
                                                                <p className="text-sm text-gray-600">{stats.count} products</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-900">{stats.totalStock} units</p>
                                                            <p className="text-sm text-purple-600">{formatPrice(stats.totalValue)}</p>
                                                        </div>
                                                    </div>
                                                ));
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {orders.slice(0, 8).map((order) => (
                                        <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    order.status === 'Delivered' ? 'bg-green-500' :
                                                    order.status === 'Shipped' ? 'bg-purple-500' :
                                                    order.status === 'Processing' ? 'bg-orange-500' :
                                                    order.status === 'Cancelled' ? 'bg-red-500' :
                                                    'bg-blue-500'
                                                }`}></div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {order.shipping_address?.name || order.shippingAddress?.name || 'Customer'} • {formatPrice(order.total)} • {order.order_items?.length || order.items?.length || 0} items
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">{order.status}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <p className="text-gray-500 text-center py-8">No recent activity</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Product Modal */}
            {(isAddProductOpen || isEditProductOpen) && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => {
                                setIsAddProductOpen(false);
                                setIsEditProductOpen(false);
                                resetForm();
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {isEditProductOpen ? 'Edit Product' : 'Add New Product'}
                        </h2>

                        <form onSubmit={isEditProductOpen ? handleEditProduct : handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text"
                                    required
                                    value={productForm.name}
                                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    placeholder="e.g., LED Headlight Assembly"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                                    <select
                                        required
                                        value={productForm.brand}
                                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        required
                                        value={productForm.category}
                                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        placeholder="2850"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={productForm.inStock}
                                        onChange={(e) => setProductForm({ ...productForm, inStock: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                        placeholder="15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    value={productForm.image}
                                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty for default image</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Compatible Models</label>
                                <input
                                    type="text"
                                    value={productForm.compatibility}
                                    onChange={(e) => setProductForm({ ...productForm, compatibility: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    placeholder="e.g., Classic 350, Meteor 350 (Comma separated) or 'Universal'"
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter 'Universal' for all bikes, or list specific models.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    rows="3"
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    placeholder="Product description..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddProductOpen(false);
                                        setIsEditProductOpen(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isEditProductOpen ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Brand Modal */}
            {isAddBrandOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setIsAddBrandOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Brand</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                <input
                                    type="text"
                                    value={newBrand}
                                    onChange={(e) => setNewBrand(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="e.g., Harley Davidson"
                                />
                                {addMessage.text && (
                                    <p className={`text-sm mt-2 ${addMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {addMessage.text}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setIsAddBrandOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleAddBrand}
                                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Add Brand
                                </button>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Existing Brands</h3>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {brands.map(brand => (
                                        <div key={brand} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <span className="text-sm text-gray-700">{brand}</span>
                                            <button
                                                onClick={() => handleDeleteBrand(brand)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Delete Brand"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Category Modal */}
            {isAddCategoryOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-8 relative">
                        <button
                            onClick={() => setIsAddCategoryOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Category</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="e.g., Tires"
                                />
                                {addMessage.text && (
                                    <p className={`text-sm mt-2 ${addMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {addMessage.text}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setIsAddCategoryOpen(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleAddCategory}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Add Category
                                </button>
                            </div>

                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Existing Categories</h3>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {categories.map(cat => (
                                        <div key={cat} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <span className="text-sm text-gray-700">{cat}</span>
                                            <button
                                                onClick={() => handleDeleteCategory(cat)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                                title="Delete Category"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsOrderModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.id}</h2>
                                <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {selectedOrder.status}
                            </span>
                        </div>

                        <div className="space-y-6">
                            {/* Customer Details */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                    <UserCircle className="w-4 h-4 mr-2" /> Customer Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Phone</p>
                                        <p className="font-medium">{selectedOrder.shippingAddress?.phone || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500">Address</p>
                                        <p className="font-medium">
                                            {selectedOrder.shippingAddress ?
                                                `${selectedOrder.shippingAddress.address}, ${selectedOrder.shippingAddress.city} - ${selectedOrder.shippingAddress.pincode}`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <ShoppingBag className="w-4 h-4 mr-2" /> Order Items
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-gray-500">Item</th>
                                                <th className="px-4 py-2 text-center font-medium text-gray-500">Qty</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-500">Price</th>
                                                <th className="px-4 py-2 text-right font-medium text-gray-500">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {(selectedOrder.items || selectedOrder.order_items || []).map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2">{item.name || `Product #${item.id}`}</td>
                                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right">{formatPrice(item.price)}</td>
                                                    <td className="px-4 py-2 text-right font-medium">{formatPrice(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-2 text-right font-bold">Total Amount:</td>
                                                <td className="px-4 py-2 text-right font-bold text-amber-600">{formatPrice(selectedOrder.total)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    onClick={() => handleNotifyUser(selectedOrder)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                                >
                                    <Mail className="w-4 h-4 mr-2" /> Send Update Email
                                </button>
                                <button
                                    onClick={() => setIsOrderModalOpen(false)}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
