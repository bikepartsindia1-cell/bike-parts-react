import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchOrders();
        } else {
            setOrders([]);
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            console.log('Fetching orders for user:', user?.email);

            // Fetch from Supabase
            let query = supabase
                .from('orders')
                .select(`
                    *,
                    order_items (
                        *,
                        products (*)
                    )
                `)
                .order('created_at', { ascending: false });

            // Check if user is admin
            const isAdmin = user?.email === 'bikepartsindia1@gmail.com' || user?.email === 'admin@bikeparts.com';
            console.log('Is Admin?', isAdmin);

            // If not admin, only show their own orders
            if (!isAdmin) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Supabase fetch error:', error);
                throw error;
            }

            console.log('Orders fetched:', data?.length);
            setOrders(data || []);
            // Cache in localStorage
            if (data) {
                localStorage.setItem(`orders_${user.id}`, JSON.stringify(data));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Fallback to localStorage
            const storedOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
            console.log('Falling back to local storage, found:', storedOrders.length);
            setOrders(storedOrders);
        } finally {
            setLoading(false);
        }
    };

    const placeOrder = async (orderData) => {
        try {
            setLoading(true);

            // Prepare order data
            const orderRecord = {
                user_id: user?.id || null,
                total: orderData.total,
                status: 'confirmed',
                shipping_address: {
                    name: orderData.shippingAddress.name,
                    phone: orderData.shippingAddress.phone,
                    address: orderData.shippingAddress.address,
                    city: orderData.shippingAddress.city,
                    pincode: orderData.shippingAddress.pincode
                }
            };

            // Insert order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([orderRecord])
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert order items
            const orderItems = orderData.items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Update local state
            const newOrder = {
                ...order,
                order_items: orderItems
            };
            const updatedOrders = [newOrder, ...orders];
            setOrders(updatedOrders);

            if (user) {
                localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
            }

            return { success: true, order: newOrder };
        } catch (error) {
            console.error('Error placing order:', error);

            // Fallback to local storage
            const newOrder = {
                id: `ORD-${Date.now()}`,
                user_id: user?.id || 'guest',
                created_at: new Date().toISOString(),
                status: 'Pending',
                ...orderData
            };

            const updatedOrders = [newOrder, ...orders];
            setOrders(updatedOrders);
            if (user) {
                localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
            }

            return { success: true, order: newOrder };
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            setLoading(true);

            // Check if it's a local order (starts with ORD-)
            if (typeof orderId === 'string' && orderId.startsWith('ORD-')) {
                console.log('Skipping Supabase update for local order:', orderId);
            } else {
                const { error } = await supabase
                    .from('orders')
                    .update({ status: newStatus })
                    .eq('id', orderId);

                if (error) throw error;
            }

            // Update local state
            const updatedOrders = orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            );
            setOrders(updatedOrders);

            if (user) {
                localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    const deleteOrder = async (orderId) => {
        try {
            setLoading(true);

            // Check if it's a local order (starts with ORD-)
            if (typeof orderId === 'string' && orderId.startsWith('ORD-')) {
                console.log('Skipping Supabase delete for local order:', orderId);
            } else {
                const { error } = await supabase
                    .from('orders')
                    .delete()
                    .eq('id', orderId);

                if (error) throw error;
            }

            // Update local state
            const updatedOrders = orders.filter(order => order.id !== orderId);
            setOrders(updatedOrders);

            if (user) {
                localStorage.setItem(`orders_${user.id}`, JSON.stringify(updatedOrders));
            }
            return { success: true };
        } catch (error) {
            console.error('Error deleting order:', error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    return (
        <OrderContext.Provider value={{ orders, loading, fetchOrders, placeOrder, updateOrderStatus, deleteOrder }}>
            {children}
        </OrderContext.Provider>
    );
};
