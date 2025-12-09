import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, Shield, RefreshCw } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        if (products.length > 0) {
            const found = products.find(p => p.id === parseInt(id));
            if (found) {
                setProduct(found);
            } else {
                // Handle not found
            }
        }
    }, [id, products]);

    if (loading || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-amber-500 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
                </button>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative group">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                                />
                                {product.originalPrice > product.price && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div>
                            <div className="mb-6">
                                <h2 className="text-sm font-medium text-amber-600 mb-2">{product.brand}</h2>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center bg-amber-100 px-2 py-1 rounded text-amber-700 text-sm font-bold">
                                        <Star className="w-4 h-4 mr-1 fill-current" />
                                        {product.rating}
                                    </div>
                                    <span className="text-gray-500 text-sm">{product.reviews || 0} Reviews</span>
                                    <span className={`text-sm font-medium ${product.inStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.inStock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                                <div className="flex items-end gap-3 mb-6">
                                    <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                                    {product.originalPrice > product.price && (
                                        <span className="text-xl text-gray-400 line-through mb-1">
                                            {formatPrice(product.originalPrice)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description || 'No description available for this product.'}
                                </p>

                                {product.compatibility && product.compatibility.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Compatible with:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {product.compatibility.map((bike, index) => (
                                                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                    {bike}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mb-8">
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.inStock <= 0}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    {product.inStock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </button>
                                <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-amber-500 hover:text-amber-500 transition-colors">
                                    <Heart className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
                                <div className="text-center">
                                    <Truck className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 font-medium">Free Shipping</p>
                                </div>
                                <div className="text-center">
                                    <Shield className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 font-medium">1 Year Warranty</p>
                                </div>
                                <div className="text-center">
                                    <RefreshCw className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-600 font-medium">30 Days Return</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
