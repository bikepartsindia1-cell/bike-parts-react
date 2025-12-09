import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

const CheckoutModal = ({ isOpen, onClose, total }) => {
    const { cart, clearCart } = useCart();
    const { placeOrder } = useOrders();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.target);

            const orderData = {
                items: cart,
                total,
                paymentMethod,
                shippingAddress: {
                    name: `${formData.get('firstName')} ${formData.get('lastName')}`,
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    city: formData.get('city'),
                    pincode: formData.get('pincode')
                }
            };

            console.log('📦 Placing order:', orderData);
            const result = await placeOrder(orderData);
            console.log('✅ Order result:', result);

            if (result && result.success && result.order) {
                console.log('🎉 Order successful! Showing confirmation...');
                setOrderNumber(result.order.id);
                setIsSuccess(true);
                clearCart();
            } else {
                console.error('❌ Order failed:', result);
                alert('Failed to place order. Please check console for details.');
            }
        } catch (error) {
            console.error('❌ Error placing order:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

        return (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-500 shadow-2xl">
                    {/* Success Icon */}
                    <div className="text-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-in zoom-in duration-700">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
                        <p className="text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm text-gray-600">Order Number</p>
                                <p className="text-2xl font-bold text-amber-600">#{orderNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">{formatPrice(total)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-amber-200">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Items Ordered</p>
                                <p className="font-semibold text-gray-900">{cart.length} Products</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                <p className="font-semibold text-gray-900 capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Order Date</p>
                                <p className="font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Estimated Delivery</p>
                                <p className="font-semibold text-green-600">{estimatedDelivery.toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            What's Next?
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Order confirmation email sent to your inbox</li>
                            <li>• Track your order from your account page</li>
                            <li>• Estimated delivery: {estimatedDelivery.toLocaleDateString()}</li>
                            <li>• Contact support for any queries</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => { onClose(); window.location.href = '/account'; }}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Track Order
                        </button>
                        <button
                            onClick={() => { onClose(); window.location.href = '/'; }}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-semibold text-gray-900">Checkout</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input name="firstName" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input name="lastName" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input name="email" type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input name="phone" type="tel" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                            <textarea name="address" required rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"></textarea>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input name="city" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                <input name="pincode" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                                required
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            >
                                <option value="">Select Payment Method</option>
                                <option value="cod">Cash on Delivery</option>
                                <option value="card">Credit/Debit Card</option>
                                <option value="upi">UPI Payment</option>
                            </select>
                        </div>

                        {/* Payment Details based on selection */}
                        {paymentMethod === 'upi' && (
                            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 text-blue-700 font-medium">
                                    <Smartphone className="w-5 h-5" /> UPI Payment
                                </div>
                                <input type="text" placeholder="Enter UPI ID" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                            </div>
                        )}

                        {paymentMethod === 'card' && (
                            <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 text-purple-700 font-medium">
                                    <CreditCard className="w-5 h-5" /> Card Payment
                                </div>
                                <input type="text" placeholder="Card Number" className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="MM/YY" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    <input type="text" placeholder="CVV" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'cod' && (
                            <div className="bg-amber-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 text-amber-700 font-medium">
                                    <Banknote className="w-5 h-5" /> Cash on Delivery
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Pay cash upon delivery.</p>
                            </div>
                        )}

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold mb-4">
                                <span>Total to Pay:</span>
                                <span className="text-amber-600">{formatPrice(total)}</span>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
