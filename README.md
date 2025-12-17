# BikeParts India - E-commerce Platform

A modern, full-featured e-commerce platform for bike parts and accessories built with React, Vite, and Supabase.

## 🚀 Features

### 🛒 E-commerce Core
- **Product Catalog**: Dynamic product listing with categories, brands, and filters
- **Shopping Cart**: Add/remove items, quantity management, persistent cart
- **Product Details**: Detailed product pages with images, descriptions, compatibility
- **Search & Filter**: Advanced filtering by category, brand, price, rating, bike model
- **Responsive Design**: Mobile-first design with Tailwind CSS

### 👤 User Authentication & Profiles
- **User Registration**: Create account with email verification
- **Email Verification**: Required email verification before login
- **User Profiles**: Automatic profile creation with personal information
- **Phone Validation**: Indian phone number format (+91) with 10-digit validation
- **Secure Login**: Database-backed authentication with Supabase

### 🔐 Admin System
- **Admin Authentication**: Secure admin login with role-based access
- **Admin Dashboard**: Product management, user management
- **Admin-Only Features**: Dashboard button and delete functions only for admins
- **Product Management**: Add, edit, delete products from admin panel

### ⭐ Reviews & Ratings
- **Dynamic Reviews**: Database-driven review system
- **Star Ratings**: Real average ratings calculated from customer reviews
- **Review Management**: Users can write reviews, admins can delete inappropriate ones
- **Helpful Votes**: Users can vote reviews as helpful
- **Reply System**: Threaded replies to reviews with user authentication
- **Review Statistics**: Rating breakdowns with percentage bars

### 🏪 Product Features
- **Dynamic Categories**: Clickable category cards with real product counts
- **Brand Filtering**: Filter by bike manufacturers and models
- **Price Filtering**: Dynamic price range based on actual product prices
- **Stock Management**: Real-time stock status and availability
- **Product Images**: High-quality product images with hover effects
- **Compatibility**: Bike model compatibility information

### 📱 User Experience
- **Modern UI**: Clean, professional design with smooth animations
- **Loading States**: Proper loading indicators and skeleton screens
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Toast Notifications**: Success/error notifications for user actions
- **Breadcrumb Navigation**: Easy navigation (removed for mobile optimization)

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks and context
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **React Router**: Client-side routing

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Row Level Security**: Database-level security policies
- **Real-time Updates**: Live data synchronization
- **Authentication**: Built-in auth with email verification

### Key Libraries
- **@supabase/supabase-js**: Supabase client library
- **react-router-dom**: Routing and navigation
- **lucide-react**: Icons and UI elements

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### 1. Clone & Install
```bash
git clone <repository-url>
cd bike-parts-react
npm install
```

### 2. Environment Setup
Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run these SQL scripts in Supabase SQL Editor:

#### Products Table
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT,
  description TEXT,
  compatibility TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for testing
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
GRANT ALL ON profiles TO anon, authenticated, service_role;
```

#### Reviews Table
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Review Interactions Tables
```sql
-- Helpful votes table
CREATE TABLE review_helpful_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_email)
);

-- Review replies table
CREATE TABLE review_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

## 🔑 Admin Access

### Admin Credentials
- **Email**: `admin@bikeparts.com` | **Password**: `admin123`
- **Email**: `bikepartsindia1@gmail.com` | **Password**: `admin123`

### Admin Features
- Dashboard button in navbar (purple button)
- Delete reviews functionality
- Product management (if admin panel is implemented)
- User management capabilities

## 🎯 Key Features Explained

### Dynamic Product Ratings
- Ratings calculated from actual customer reviews
- No hardcoded ratings - all dynamic from database
- Rating breakdowns with percentage bars
- Products without reviews show "No reviews yet"

### Email Verification System
- Users must verify email before login
- Automatic verification email sent on registration
- Resend verification email option
- Clear error messages and instructions

### Review System
- Write reviews with star ratings and comments
- Helpful voting system (users can vote once per review)
- Threaded reply system with user authentication
- Admin moderation (delete inappropriate reviews)
- Real-time updates without page refresh

### Phone Number Validation
- Indian phone number format
- Automatic +91 prefix handling
- 10-digit validation
- Clean input with real-time validation

### Secure Authentication
- Role-based access control
- Admin features only visible to authenticated admins
- Profile creation with user registration
- Database-backed user management

## 🚀 Deployment

### Netlify Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Set environment variables in Netlify dashboard
4. Configure redirects with `netlify.toml`

### Environment Variables for Production
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🧪 Testing

### Test User Registration
1. Create account with valid details
2. Check email for verification link
3. Verify email and login
4. Check profile creation in database

### Test Admin Features
1. Login with admin credentials
2. Verify dashboard button appears
3. Test review deletion functionality
4. Check admin-only features visibility

### Test Review System
1. Create account and login
2. Write a review on any product
3. Test helpful voting
4. Test reply functionality
5. Test admin review deletion

## 📁 Project Structure

```
bike-parts-react/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── AuthModal.jsx    # Login/Register modal
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── ProductCard.jsx  # Product display card
│   │   └── ...
│   ├── context/             # React Context providers
│   │   ├── AuthContext.jsx  # Authentication state
│   │   ├── ProductContext.jsx # Product data management
│   │   └── CartContext.jsx  # Shopping cart state
│   ├── lib/                 # Utility libraries
│   │   ├── supabase.js      # Supabase client
│   │   ├── reviewsService.js # Review operations
│   │   └── profilesService.js # Profile operations
│   ├── pages/               # Page components
│   │   ├── Home.jsx         # Homepage
│   │   ├── Products.jsx     # Product listing
│   │   ├── ProductDetails.jsx # Product detail page
│   │   └── ...
│   └── ...
├── public/                  # Static assets
├── .env                     # Environment variables
└── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the browser console for error messages
- Verify Supabase connection and credentials
- Ensure all database tables are created correctly
- Test with admin credentials for admin features

---

**BikeParts India** - Your one-stop shop for premium bike parts and accessories! 🏍️
