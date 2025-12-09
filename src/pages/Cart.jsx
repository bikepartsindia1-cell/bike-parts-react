import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, Minus, Plus, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { formatPrice } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import CheckoutModal from '../components/CheckoutModal';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
    const { products } = useProducts();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const subtotal = getCartTotal();
    const shipping = subtotal > 0 ? 99 : 0;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax - discount;

    const handleApplyCoupon = () => {
        if (couponCode.toUpperCase() === 'WELCOME10') {
            setDiscount(subtotal * 0.1);
        } else {
            alert('Invalid coupon code');
            setDiscount(0);
        }
    };

    const recommendedProducts = products
        .filter(p => !cart.find(item => item.id === p.id))
        .slice(0, 4);

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link
                    to="/products"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center"
                >
                    Start Shopping <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.brand}</p>
                                        </div>
                                        <p className="font-bold text-amber-600">{formatPrice(item.price * item.quantity)}</p>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-2 hover:bg-gray-50 text-gray-600"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-2 hover:bg-gray-50 text-gray-600"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Move to Wishlist">
                                                <Heart className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 text-sm text-gray-600 mb-6">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="font-medium text-gray-900">{formatPrice(shipping)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (18%)</span>
                                    <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span className="font-medium">-{formatPrice(discount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Coupon Code"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            <div className="border-t pt-4 mb-6">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-amber-600">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsCheckoutOpen(true)}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-amber-500/20"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recommended Products */}
                {recommendedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}

                <CheckoutModal
                    isOpen={isCheckoutOpen}
                    onClose={() => setIsCheckoutOpen(false)}
                    total={total}
                />
            </div>
        </div>
    );
};

export default Cart;
