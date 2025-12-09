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

const AdminDashboard = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useProducts();
    const { orders, placeOrder, updateOrderStatus, deleteOrder } = useOrders();
    const { signOut } = useAuth();
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

    // Sound notification
    useEffect(() => {
        const audio = new Audio('/notification.mp3');
        const previousOrderCount = parseInt(localStorage.getItem('previousOrderCount') || '0');

        if (orders.length > previousOrderCount) {
            audio.play().catch(e => console.log('Audio play failed:', e));
        }

        localStorage.setItem('previousOrderCount', orders.length.toString());
    }, [orders.length]);

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

    const handleCreateTestOrder = async () => {
        // Use real products if available, otherwise use dummy IDs (which might fail DB constraints)
        const testItems = products.length > 0
            ? [{ id: products[0].id, quantity: 1, price: products[0].price }]
            : [
                { id: 'test-prod-1', quantity: 1, price: 1500 },
                { id: 'test-prod-2', quantity: 2, price: 425 }
            ];

        const dummyOrder = {
            total: testItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            items: testItems,
            shippingAddress: {
                name: 'Test Customer',
                phone: '9876543210',
                address: '123 Test Lane, Demo District',
                city: 'Gurgaon',
                pincode: '122001'
            }
        };

        const result = await placeOrder(dummyOrder);
        if (result.success) {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
            alert('Test order created successfully! Refresh to see it.');
        } else {
            alert('Failed to create test order.');
        }
    };

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

    const { user } = useAuth();

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
                            <button className="p-2 text-gray-600 hover:text-amber-500 transition-colors relative">
                                <Bell className="w-5 h-5" />
                                {lowStockProducts.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        {lowStockProducts.length}
                                    </span>
                                )}
                            </button>
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
                                        onClick={handleCreateTestOrder}
                                        className="ml-4 text-sm bg-amber-100 text-amber-700 px-3 py-1 rounded-md hover:bg-amber-200 font-medium transition-colors"
                                    >
                                        + Create Test Order
                                    </button>
                                </div>
                                {orders.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No orders yet</p>
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
                                                        <td className="py-3 px-4 text-gray-600">{order.items.length} items</td>
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
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Order Management</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-blue-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'Pending').length}</div>
                                    <div className="text-sm text-blue-800 mt-1">Pending Orders</div>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-green-600">{orders.filter(o => o.status === 'Delivered').length}</div>
                                    <div className="text-sm text-green-800 mt-1">Completed Orders</div>
                                </div>
                                <div className="bg-orange-50 p-6 rounded-lg text-center">
                                    <div className="text-3xl font-bold text-orange-600">{orders.filter(o => o.status === 'Processing').length}</div>
                                    <div className="text-sm text-orange-800 mt-1">Processing Orders</div>
                                </div>
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
                                            {selectedOrder.items.map((item, idx) => (
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
