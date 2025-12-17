import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Truck, Shield, RefreshCw, Trash2 } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../lib/utils';
import { reviewsService } from '../lib/reviewsService';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();
    const { user, isAdmin } = useAuth();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [reviewStats, setReviewStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [helpfulVotes, setHelpfulVotes] = useState({});
    const [showReplyForm, setShowReplyForm] = useState({});
    const [replyText, setReplyText] = useState({});
    const [reviewReplies, setReviewReplies] = useState({});
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (products.length > 0) {
            // Try both string and number comparison for ID
            const found = products.find(p => p.id === id || p.id === parseInt(id));
            if (found) {
                setProduct(found);
                loadReviews(found.id);
            }
        }
    }, [id, products]);

    const loadReviews = async (productId) => {
        setReviewsLoading(true);
        try {
            const [reviewsData, statsData] = await Promise.all([
                reviewsService.getProductReviews(productId),
                reviewsService.getReviewStats(productId)
            ]);
            
            setReviews(reviewsData);
            setReviewStats(statsData);

            // Load helpful votes and replies for the reviews
            if (reviewsData.length > 0) {
                const reviewIds = reviewsData.map(r => r.id);
                await Promise.all([
                    loadHelpfulVotes(reviewIds),
                    loadReplies(reviewIds)
                ]);
            }
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
            return;
        }

        try {
            const result = await reviewsService.deleteReview(reviewId);
            if (result.success) {
                // Reload reviews after successful deletion
                await loadReviews(product.id);
                alert('Review deleted successfully');
            } else {
                alert('Failed to delete review: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    // Use centralized admin check from AuthContext
    const userIsAdmin = isAdmin();

    // Load helpful votes for reviews
    const loadHelpfulVotes = async (reviewIds) => {
        const votes = {};
        for (const reviewId of reviewIds) {
            const result = await reviewsService.getHelpfulInfo(reviewId, user?.email);
            if (result.success) {
                votes[reviewId] = {
                    count: result.helpfulCount,
                    userVoted: result.userVoted
                };
            }
        }
        setHelpfulVotes(votes);
    };

    // Load replies for reviews
    const loadReplies = async (reviewIds) => {
        const replies = {};
        for (const reviewId of reviewIds) {
            const result = await reviewsService.getReviewReplies(reviewId);
            if (result.success) {
                replies[reviewId] = result.data;
            }
        }
        setReviewReplies(replies);
    };

    // Handle helpful vote toggle
    const handleHelpfulVote = async (reviewId) => {
        if (!user) {
            alert('Please login to vote');
            return;
        }

        try {
            const result = await reviewsService.toggleHelpfulVote(reviewId, user.email);
            if (result.success) {
                // Reload helpful votes for this review
                const helpfulInfo = await reviewsService.getHelpfulInfo(reviewId, user.email);
                if (helpfulInfo.success) {
                    setHelpfulVotes(prev => ({
                        ...prev,
                        [reviewId]: {
                            count: helpfulInfo.helpfulCount,
                            userVoted: helpfulInfo.userVoted
                        }
                    }));
                }
            } else {
                alert('Failed to vote: ' + result.error);
            }
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote');
        }
    };

    // Handle reply submission
    const handleReplySubmit = async (reviewId) => {
        if (!user) {
            alert('Please login to reply');
            return;
        }

        const text = replyText[reviewId]?.trim();
        if (!text) {
            alert('Please enter a reply');
            return;
        }

        try {
            // Get user name from profile data
            let userName = user.email.split('@')[0]; // fallback
            
            try {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, full_name')
                    .eq('id', user.id)
                    .single();

                if (profileData && profileData.first_name && profileData.last_name) {
                    userName = `${profileData.first_name} ${profileData.last_name}`;
                } else if (profileData && profileData.full_name) {
                    userName = profileData.full_name;
                }
            } catch (profileError) {
                console.warn('Could not load profile for reply:', profileError);
            }

            const result = await reviewsService.addReply(reviewId, {
                userName: userName,
                userEmail: user.email,
                replyText: text
            });

            if (result.success) {
                // Clear reply form
                setReplyText(prev => ({ ...prev, [reviewId]: '' }));
                setShowReplyForm(prev => ({ ...prev, [reviewId]: false }));
                
                // Reload replies for this review
                const repliesResult = await reviewsService.getReviewReplies(reviewId);
                if (repliesResult.success) {
                    setReviewReplies(prev => ({
                        ...prev,
                        [reviewId]: repliesResult.data
                    }));
                }
            } else {
                alert('Failed to add reply: ' + result.error);
            }
        } catch (error) {
            console.error('Error adding reply:', error);
            alert('Failed to add reply');
        }
    };

    // Handle reply deletion
    const handleDeleteReply = async (replyId, reviewId) => {
        if (!window.confirm('Are you sure you want to delete this reply?')) {
            return;
        }

        try {
            const result = await reviewsService.deleteReply(replyId);
            if (result.success) {
                // Reload replies for this review
                const repliesResult = await reviewsService.getReviewReplies(reviewId);
                if (repliesResult.success) {
                    setReviewReplies(prev => ({
                        ...prev,
                        [reviewId]: repliesResult.data
                    }));
                }
            } else {
                alert('Failed to delete reply: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting reply:', error);
            alert('Failed to delete reply');
        }
    };

    // Handle review submission
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            alert('Please login to write a review');
            return;
        }

        if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
            alert('Please fill in all fields');
            return;
        }

        setSubmittingReview(true);
        
        try {
            // Get user name from profile data
            let userName = user.email.split('@')[0]; // fallback
            
            // Try to get profile data for proper name
            try {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, full_name')
                    .eq('id', user.id)
                    .single();

                if (profileData && profileData.first_name && profileData.last_name) {
                    userName = `${profileData.first_name} ${profileData.last_name}`;
                } else if (profileData && profileData.full_name) {
                    userName = profileData.full_name;
                }
            } catch (profileError) {
                console.warn('Could not load profile for review:', profileError);
            }

            const reviewData = {
                product_id: product.id,
                user_name: userName,
                user_email: user.email,
                rating: reviewForm.rating,
                title: reviewForm.title.trim(),
                comment: reviewForm.comment.trim(),
                verified_purchase: false // You can implement purchase verification later
            };

            console.log('📝 Submitting review:', reviewData);

            const result = await reviewsService.addReview(reviewData);
            
            if (result.error) {
                console.error('❌ Review submission failed:', result.error);
                alert('Failed to submit review: ' + result.error);
            } else {
                console.log('✅ Review submitted successfully:', result.data);
                alert('Review submitted successfully!');
                
                // Reset form and close modal
                setReviewForm({ rating: 5, title: '', comment: '' });
                setShowReviewForm(false);
                
                // Reload reviews to show the new one
                await loadReviews(product.id);
            }
        } catch (error) {
            console.error('❌ Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setSubmittingReview(false);
        }
    };

    // Open review form
    const handleWriteReview = () => {
        if (!user) {
            alert('Please login to write a review');
            return;
        }
        setShowReviewForm(true);
    };

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
                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${product.inStock > 0 ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                        {product.inStock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
                                    </span>
                                    <button 
                                        onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors"
                                    >
                                        {reviewStats.totalReviews} Customer Reviews
                                    </button>
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

                {/* Reviews Section */}
                <div id="reviews-section" className="mt-12 bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                        
                        {/* Review Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-5xl font-bold text-gray-900">
                                        {reviewStats.averageRating || 0}
                                    </span>
                                    <div>
                                        <div className="flex items-center mb-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= Math.floor(reviewStats.averageRating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-600 text-sm">Based on {reviewStats.totalReviews} reviews</p>
                                    </div>
                                </div>
                                
                                {/* Rating Breakdown */}
                                <div className="space-y-2">
                                    {[5, 4, 3, 2, 1].map((rating) => {
                                        const percentage = reviewStats.ratingBreakdown[rating] || 0;
                                        return (
                                            <div key={rating} className="flex items-center gap-2 text-sm">
                                                <span className="w-3 text-gray-600">{rating}</span>
                                                <Star className="w-3 h-3 text-amber-400 fill-current" />
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-amber-400 h-2 rounded-full" 
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="w-8 text-gray-600 text-xs">{percentage}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="flex flex-col justify-center">
                                <button 
                                    onClick={handleWriteReview}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors mb-4"
                                >
                                    Write a Review
                                </button>
                                <p className="text-gray-600 text-sm text-center">Share your experience with other customers</p>
                            </div>
                        </div>

                        {/* Individual Reviews */}
                        <div className="space-y-6">
                            {reviewsLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                                    <p className="text-gray-500 mt-2">Loading reviews...</p>
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                                </div>
                            ) : (
                                <>
                                    {reviews.slice(0, 3).map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-6">
                                            <div className="flex items-start gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${reviewsService.getAvatarColor(review.user_name)}`}>
                                                    {reviewsService.getUserInitials(review.user_name)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h4 className="font-semibold text-gray-900">{review.user_name}</h4>
                                                        {review.verified_purchase && (
                                                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                                                Verified Purchase
                                                            </span>
                                                        )}
                                                        <span className="text-gray-400 text-sm">•</span>
                                                        <span className="text-gray-500 text-sm">
                                                            {reviewsService.formatReviewDate(review.created_at)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center mb-3">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                        <span className="ml-2 text-sm font-medium text-gray-700">{review.title}</span>
                                                    </div>
                                                    <p className="text-gray-700 mb-3">{review.comment}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <button 
                                                            className={`hover:text-amber-600 transition-colors ${helpfulVotes[review.id]?.userVoted ? 'text-amber-600 font-medium' : ''}`}
                                                            onClick={() => handleHelpfulVote(review.id)}
                                                        >
                                                            👍 Helpful ({helpfulVotes[review.id]?.count || 0})
                                                        </button>
                                                        <button 
                                                            className="hover:text-amber-600 transition-colors"
                                                            onClick={() => setShowReplyForm(prev => ({ ...prev, [review.id]: !prev[review.id] }))}
                                                        >
                                                            Reply
                                                        </button>
                                                        {userIsAdmin && (
                                                            <button 
                                                                className="hover:text-red-600 transition-colors text-red-500 font-medium flex items-center gap-1"
                                                                onClick={() => handleDeleteReview(review.id)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Reply Form */}
                                                    {showReplyForm[review.id] && (
                                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                            <textarea
                                                                value={replyText[review.id] || ''}
                                                                onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                                                placeholder="Write your reply..."
                                                                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                                rows="3"
                                                            />
                                                            <div className="flex justify-end gap-2 mt-3">
                                                                <button
                                                                    onClick={() => setShowReplyForm(prev => ({ ...prev, [review.id]: false }))}
                                                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReplySubmit(review.id)}
                                                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                                                                >
                                                                    Post Reply
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Replies */}
                                                    {reviewReplies[review.id] && reviewReplies[review.id].length > 0 && (
                                                        <div className="mt-4 space-y-3">
                                                            {reviewReplies[review.id].map((reply) => (
                                                                <div key={reply.id} className="ml-6 p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${reviewsService.getAvatarColor(reply.user_name)}`}>
                                                                            {reviewsService.getUserInitials(reply.user_name)}
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <h5 className="font-medium text-gray-900 text-sm">{reply.user_name}</h5>
                                                                                <span className="text-gray-400 text-xs">•</span>
                                                                                <span className="text-gray-500 text-xs">
                                                                                    {reviewsService.formatReviewDate(reply.created_at)}
                                                                                </span>
                                                                                {(user?.email === reply.user_email || userIsAdmin) && (
                                                                                    <button
                                                                                        onClick={() => handleDeleteReply(reply.id, review.id)}
                                                                                        className="text-red-500 hover:text-red-700 text-xs ml-auto"
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                            <p className="text-gray-700 text-sm">{reply.reply_text}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Load More Reviews */}
                                    {reviews.length > 3 && (
                                        <div className="text-center pt-4">
                                            <button className="text-amber-600 hover:text-amber-700 font-medium transition-colors">
                                                View All Reviews ({reviewStats.totalReviews})
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
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

            {/* Review Form Modal */}
            {showReviewForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowReviewForm(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h2>
                        <p className="text-gray-600 mb-6">Share your experience with {product.name}</p>

                        <form onSubmit={handleReviewSubmit} className="space-y-6">
                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rating *
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                            className="focus:outline-none"
                                        >
                                            <Star
                                                className={`w-8 h-8 transition-colors ${
                                                    star <= reviewForm.rating 
                                                        ? 'text-amber-400 fill-current' 
                                                        : 'text-gray-300 hover:text-amber-300'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({reviewForm.rating} star{reviewForm.rating !== 1 ? 's' : ''})
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Review Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={reviewForm.title}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                                    placeholder="Summarize your experience..."
                                    maxLength={100}
                                />
                                <p className="text-xs text-gray-500 mt-1">{reviewForm.title.length}/100 characters</p>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Review *
                                </label>
                                <textarea
                                    required
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                                    placeholder="Tell others about your experience with this product..."
                                    rows="5"
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-500 mt-1">{reviewForm.comment.length}/1000 characters</p>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
