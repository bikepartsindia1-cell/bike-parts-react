import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { notificationService } from '../lib/notificationService';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            console.log('🔄 User detected, fetching orders...', user.email);
            fetchOrders();
        } else {
            console.log('❌ No user, clearing orders');
            setOrders([]);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log('📋 Fetching orders for user:', user?.email);

            // Check if user is admin
            const isAdmin = user?.email === 'bikepartsindia1@gmail.com' || user?.email === 'admin@bikeparts.com' || user?.user_metadata?.role === 'admin';
            console.log('👑 Is Admin?', isAdmin);

            // Test basic connection first
            console.log('🔍 Testing database connection...');
            const { data: testData, error: testError } = await supabase
                .from('orders')
                .select('count', { count: 'exact', head: true });

            if (testError) {
                console.error('❌ Database connection failed:', testError);
                throw testError;
            }

            console.log('✅ Database connected. Total orders in DB:', testData);

            // Simple query to fetch orders
            let query = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            // If not admin, only show their own orders
            if (!isAdmin && user?.id) {
                query = query.eq('user_id', user.id);
                console.log('👤 Filtering for user ID:', user.id);
            } else {
                console.log('👑 Admin - fetching ALL orders');
            }

            const { data: orders, error } = await query;

            if (error) {
                console.error('❌ Orders fetch error:', error);
                console.error('Error details:', {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint
                });
                throw error;
            }

            console.log(`✅ Orders fetched: ${orders?.length || 0} orders`);
            console.log('📋 Raw orders data:', orders);
            
            // Fetch order items for each order
            if (orders && orders.length > 0) {
                console.log('🔍 Fetching order items...');
                const ordersWithItems = await Promise.all(
                    orders.map(async (order) => {
                        try {
                            const { data: orderItems, error: itemsError } = await supabase
                                .from('order_items')
                                .select('*')
                                .eq('order_id', order.id);
                            
                            if (itemsError) {
                                console.warn(`⚠️ Items fetch error for order ${order.id}:`, itemsError);
                            }

                            console.log(`📦 Order ${order.id} has ${orderItems?.length || 0} items`);
                            
                            return {
                                ...order,
                                order_items: orderItems || [],
                                items: orderItems || [],
                                shippingAddress: order.shipping_address || {}
                            };
                        } catch (itemError) {
                            console.warn(`❌ Exception fetching items for order ${order.id}:`, itemError);
                            return {
                                ...order,
                                order_items: [],
                                items: [],
                                shippingAddress: order.shipping_address || {}
                            };
                        }
                    })
                );
                
                console.log('✅ Final orders with items:', ordersWithItems);
                setOrders(ordersWithItems);
            } else {
                console.log('📋 No orders found - setting empty array');
                setOrders([]);
            }
            
        } catch (error) {
            console.error('❌ Error fetching orders:', error);
            console.error('❌ Full error object:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async (orderData) => {
        try {
            setLoading(true);

            // Ensure user is authenticated for database orders
            if (!user?.id) {
                throw new Error('User must be logged in to place orders');
            }

            // Prepare order data
            const orderRecord = {
                user_id: user.id,
                total: orderData.total,
                status: 'Pending', // Start with Pending status
                shipping_address: {
                    name: orderData.shippingAddress.name,
                    phone: orderData.shippingAddress.phone,
                    address: orderData.shippingAddress.address,
                    city: orderData.shippingAddress.city,
                    pincode: orderData.shippingAddress.pincode
                }
            };

            console.log('📦 Placing order in database:', orderRecord);

            // Insert order into database
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([orderRecord])
                .select()
                .single();

            if (orderError) {
                console.error('❌ Order insertion failed:', orderError);
                throw orderError;
            }

            console.log('✅ Order created in database:', order);

            // Insert order items
            const orderItems = orderData.items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            console.log('📦 Inserting order items:', orderItems);

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('❌ Order items insertion failed:', itemsError);
                throw itemsError;
            }

            console.log('✅ Order items created in database');

            // Refresh orders from database to get the complete order with items
            await fetchOrders();

            // Log order placement (no sound notification during order placement)
            console.log('📦 New order placed in database!');

            return { success: true, order: order };
        } catch (error) {
            console.error('❌ Error placing order:', error);
            
            // Don't create fallback orders - require database storage
            return { 
                success: false, 
                error: `Failed to place order: ${error.message}. Please ensure you are logged in and try again.` 
            };
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setLoading(true);
            console.log(`📝 Updating order ${orderId} status to: ${newStatus}`);

            // Only work with database orders (numeric IDs)
            if (typeof orderId === 'string' && orderId.startsWith('ORD-')) {
                throw new Error('Cannot update local orders. Please refresh and try again.');
            }

            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) {
                console.error('❌ Database update failed:', error);
                throw error;
            }

            console.log('✅ Order status updated in database');

            // Refresh orders from database to ensure consistency
            await fetchOrders();
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating order status:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            setLoading(true);
            console.log(`🗑️ Deleting order: ${orderId}`);

            // Only work with database orders (numeric IDs)
            if (typeof orderId === 'string' && orderId.startsWith('ORD-')) {
                throw new Error('Cannot delete local orders. Please refresh and try again.');
            }

            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) {
                console.error('❌ Database delete failed:', error);
                throw error;
            }

            console.log('✅ Order deleted from database');

            // Refresh orders from database to ensure consistency
            await fetchOrders();
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting order:', error);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Manual refresh function for debugging
    const refreshOrders = async () => {
        console.log('🔄 Manual refresh triggered');
        await fetchOrders();
    };

    return (
        <OrderContext.Provider value={{ orders, loading, fetchOrders, refreshOrders, placeOrder, updateOrderStatus, deleteOrder }}>
            {children}
        </OrderContext.Provider>
    );
};
