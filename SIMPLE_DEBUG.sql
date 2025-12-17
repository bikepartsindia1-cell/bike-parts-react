-- Simple debug script for customer orders
-- Run this in your Supabase SQL Editor

-- 1. Check profiles table
SELECT 'PROFILES:' as section, COUNT(*) as count FROM profiles;
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 3;

-- 2. Check orders table  
SELECT 'ORDERS:' as section, COUNT(*) as count FROM orders;
SELECT * FROM orders ORDER BY created_at DESC LIMIT 3;

-- 3. Match customers with orders
SELECT 
    p.email,
    p.first_name || ' ' || p.last_name as name,
    COUNT(o.id) as order_count,
    COALESCE(SUM(o.total), 0) as total_spent
FROM profiles p
LEFT JOIN orders o ON p.user_id = o.user_id
GROUP BY p.id, p.email, p.first_name, p.last_name
ORDER BY order_count DESC;

SELECT 'Debug complete!' as status;