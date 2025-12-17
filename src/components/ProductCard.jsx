import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user, openAuthModal } = useAuth();
    const [isWishlist, setIsWishlist] = React.useState(false);
    const [showToast, setShowToast] = React.useState(false);

    const discountPercent = product.originalPrice > product.price ?
        Math.round((1 - product.price / product.originalPrice) * 100) : 0;

    const handleAddToCart = () => {
        if (!user) {
            // Show toast and open login modal
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setTimeout(() => openAuthModal('login'), 500);
            return;
        }
        addToCart(product);
    };

    return (
        <div className="product-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group relative">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Link to={`/product/${product.id}`}>
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>

                {/* Discount Badge */}
                {discountPercent > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {discountPercent}% OFF
                    </div>
                )}

                {/* Brand Badge */}
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">
                    {product.brand}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={() => setIsWishlist(!isWishlist)}
                    className={`absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 ${isWishlist ? 'text-red-500' : 'text-gray-400'}`}
                >
                    <Heart className={`w-4 h-4 ${isWishlist ? 'fill-current' : ''}`} />
                </button>

                {/* Stock Status */}
                <div className={`absolute bottom-3 left-3 px-2 py-1 rounded text-xs font-medium ${product.inStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.inStock > 0 ? `${product.inStock} in stock` : 'Out of stock'}
                </div>
            </div>

            <div className="p-4">
                <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center mb-2">
                    {product.rating > 0 ? (
                        <>
                            <div className="flex text-yellow-400 text-sm">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                                ))}
                            </div>
                            <span className="text-gray-600 text-xs ml-2">
                                {product.rating} ({product.reviews} review{product.reviews !== 1 ? 's' : ''})
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-500 text-xs">No reviews yet</span>
                    )}
                </div>

                <div className="flex items-center justify-between mb-3">
                    <div>
                        <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                        {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        disabled={product.inStock === 0}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {product.inStock > 0 ? 'Add' : 'No Stock'}
                    </button>
                    <Link
                        to={`/product/${product.id}`}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-600 flex items-center justify-center"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Login Required Toast */}
            {showToast && (
                <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">Login Required</p>
                            <p className="text-sm text-white/90">Please login to add items to cart</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
