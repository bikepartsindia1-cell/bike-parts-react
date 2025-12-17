-- =====================================================
-- BIKEPARTS INDIA - COMPLETE DATABASE SETUP
-- =====================================================
-- This file contains all SQL commands needed to set up the complete database
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. PROFILES TABLE SETUP
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  password TEXT, -- For legacy compatibility (NOT recommended for production)
  address TEXT,
  city TEXT,
  pincode TEXT CHECK (pincode ~ '^[0-9]{6}$'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for admin access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- =====================================================
-- 2. ORDERS TABLES SETUP
-- =====================================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for admin access
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO anon;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON order_items TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 3. REVIEWS SYSTEM SETUP
-- =====================================================

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_replies table
CREATE TABLE IF NOT EXISTS review_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_helpful_votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_email)
);

-- Disable RLS for reviews system
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON reviews TO anon;
GRANT ALL ON review_replies TO authenticated;
GRANT ALL ON review_replies TO anon;
GRANT ALL ON review_helpful_votes TO authenticated;
GRANT ALL ON review_helpful_votes TO anon;

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replies_review_id ON review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_replies_created_at ON review_replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_helpful_votes_review_id ON review_helpful_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_helpful_votes_user_email ON review_helpful_votes(user_email);

-- =====================================================
-- 4. UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update product ratings from reviews
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $
BEGIN
  UPDATE products 
  SET 
    rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    reviews = (
      SELECT COUNT(*)
      FROM reviews 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

-- Create triggers for product rating updates
DROP TRIGGER IF EXISTS update_product_rating_on_insert ON reviews;
CREATE TRIGGER update_product_rating_on_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

DROP TRIGGER IF EXISTS update_product_rating_on_update ON reviews;
CREATE TRIGGER update_product_rating_on_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

DROP TRIGGER IF EXISTS update_product_rating_on_delete ON reviews;
CREATE TRIGGER update_product_rating_on_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- =====================================================
-- 5. PROFILE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to get profile by email
CREATE OR REPLACE FUNCTION get_profile_by_email(user_email TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  password TEXT,
  address TEXT,
  city TEXT,
  pincode TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.password,
    p.address,
    p.city,
    p.pincode,
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.email = user_email;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id UUID,
  new_first_name TEXT DEFAULT NULL,
  new_last_name TEXT DEFAULT NULL,
  new_phone TEXT DEFAULT NULL,
  new_avatar_url TEXT DEFAULT NULL,
  new_password TEXT DEFAULT NULL,
  new_address TEXT DEFAULT NULL,
  new_city TEXT DEFAULT NULL,
  new_pincode TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $
BEGIN
  UPDATE profiles
  SET 
    first_name = COALESCE(new_first_name, first_name),
    last_name = COALESCE(new_last_name, last_name),
    full_name = CASE 
      WHEN new_first_name IS NOT NULL OR new_last_name IS NOT NULL 
      THEN COALESCE(new_first_name, first_name) || ' ' || COALESCE(new_last_name, last_name)
      ELSE full_name
    END,
    phone = COALESCE(new_phone, phone),
    avatar_url = COALESCE(new_avatar_url, avatar_url),
    password = COALESCE(new_password, password),
    address = COALESCE(new_address, address),
    city = COALESCE(new_city, city),
    pincode = COALESCE(new_pincode, pincode),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. REVIEW HELPER FUNCTIONS
-- =====================================================

-- Function to get helpful count for a review
CREATE OR REPLACE FUNCTION get_helpful_count(review_uuid UUID)
RETURNS INTEGER AS $
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM review_helpful_votes
    WHERE review_id = review_uuid
  );
END;
$ LANGUAGE plpgsql;

-- Function to check if user has voted helpful for a review
CREATE OR REPLACE FUNCTION user_voted_helpful(review_uuid UUID, user_email_param TEXT)
RETURNS BOOLEAN AS $
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM review_helpful_votes
    WHERE review_id = review_uuid AND user_email = user_email_param
  );
END;
$ LANGUAGE plpgsql;

-- Function to toggle helpful vote
CREATE OR REPLACE FUNCTION toggle_helpful_vote(review_uuid UUID, user_email_param TEXT)
RETURNS BOOLEAN AS $
DECLARE
  vote_exists BOOLEAN;
BEGIN
  -- Check if vote exists
  SELECT EXISTS (
    SELECT 1 FROM review_helpful_votes 
    WHERE review_id = review_uuid AND user_email = user_email_param
  ) INTO vote_exists;
  
  IF vote_exists THEN
    -- Remove vote
    DELETE FROM review_helpful_votes 
    WHERE review_id = review_uuid AND user_email = user_email_param;
    RETURN false; -- Vote removed
  ELSE
    -- Add vote
    INSERT INTO review_helpful_votes (review_id, user_email) 
    VALUES (review_uuid, user_email_param);
    RETURN true; -- Vote added
  END IF;
END;
$ LANGUAGE plpgsql;

-- =====================================================
-- 7. SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample admin profile
INSERT INTO profiles (email, first_name, last_name, full_name, phone, password)
VALUES (
  'admin@bikeparts.com',
  'Admin',
  'User',
  'Admin User',
  '+919876543210',
  'admin123'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample reviews (only if products exist)
INSERT INTO reviews (product_id, user_name, user_email, rating, title, comment, helpful_count, verified_purchase, created_at)
SELECT 
  p.id,
  'Rajesh Kumar',
  'rajesh.kumar@gmail.com',
  5,
  'Excellent Quality',
  'Amazing product! The build quality is excellent and it fits perfectly on my Royal Enfield. Installation was easy and the performance improvement is noticeable. Highly recommended!',
  12,
  true,
  NOW() - INTERVAL '2 days'
FROM products p 
WHERE p.name ILIKE '%headlight%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. CLEANUP OLD TRIGGERS (OPTIONAL)
-- =====================================================

-- Remove any problematic auth triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =====================================================
-- SETUP COMPLETE
-- =====================================================

SELECT 'Database setup completed successfully!' as status,
       'Tables: profiles, orders, order_items, reviews, review_replies, review_helpful_votes' as tables_created,
       'All RLS policies disabled for admin access' as security_note,
       'Ready for BikeParts India application!' as ready_status;