import { supabase } from './supabase';

export const reviewsService = {
  // Get all reviews for a specific product
  async getProductReviews(productId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  },

  // Get review statistics for a product
  async getReviewStats(productId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };
      }

      const ratings = data.map(review => review.rating);
      const totalReviews = ratings.length;
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews;

      // Calculate rating breakdown
      const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratings.forEach(rating => {
        ratingBreakdown[rating]++;
      });

      // Convert to percentages
      Object.keys(ratingBreakdown).forEach(key => {
        ratingBreakdown[key] = Math.round((ratingBreakdown[key] / totalReviews) * 100);
      });

      return {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews,
        ratingBreakdown
      };
    } catch (error) {
      console.error('Error fetching review stats:', error);
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
  },

  // Add a new review
  async addReview(reviewData) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding review:', error);
      return { data: null, error: error.message };
    }
  },

  // Delete a review (admin only)
  async deleteReview(reviewId) {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting review:', error);
      return { success: false, error: error.message };
    }
  },

  // Toggle helpful vote for a review
  async toggleHelpfulVote(reviewId, userEmail) {
    try {
      const { data, error } = await supabase.rpc('toggle_helpful_vote', {
        review_uuid: reviewId,
        user_email_param: userEmail
      });

      if (error) throw error;
      return { success: true, voted: data, error: null };
    } catch (error) {
      console.error('Error toggling helpful vote:', error);
      return { success: false, voted: false, error: error.message };
    }
  },

  // Get helpful count and user vote status for a review
  async getHelpfulInfo(reviewId, userEmail = null) {
    try {
      const { data: countData, error: countError } = await supabase.rpc('get_helpful_count', {
        review_uuid: reviewId
      });

      if (countError) throw countError;

      let userVoted = false;
      if (userEmail) {
        const { data: voteData, error: voteError } = await supabase.rpc('user_voted_helpful', {
          review_uuid: reviewId,
          user_email_param: userEmail
        });
        
        if (voteError) throw voteError;
        userVoted = voteData;
      }

      return {
        success: true,
        helpfulCount: countData || 0,
        userVoted,
        error: null
      };
    } catch (error) {
      console.error('Error getting helpful info:', error);
      return {
        success: false,
        helpfulCount: 0,
        userVoted: false,
        error: error.message
      };
    }
  },

  // Add a reply to a review
  async addReply(reviewId, replyData) {
    try {
      const { data, error } = await supabase
        .from('review_replies')
        .insert([{
          review_id: reviewId,
          user_name: replyData.userName,
          user_email: replyData.userEmail,
          reply_text: replyData.replyText
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, error: null };
    } catch (error) {
      console.error('Error adding reply:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // Get replies for a review
  async getReviewReplies(reviewId) {
    try {
      const { data, error } = await supabase
        .from('review_replies')
        .select('*')
        .eq('review_id', reviewId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { success: true, data: data || [], error: null };
    } catch (error) {
      console.error('Error getting replies:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  // Delete a reply (user's own or admin)
  async deleteReply(replyId) {
    try {
      const { error } = await supabase
        .from('review_replies')
        .delete()
        .eq('id', replyId);

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting reply:', error);
      return { success: false, error: error.message };
    }
  },

  // Format review date for display
  formatReviewDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} month${Math.ceil(diffDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.ceil(diffDays / 365)} year${Math.ceil(diffDays / 365) > 1 ? 's' : ''} ago`;
  },

  // Get user initials for avatar
  getUserInitials(name) {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  },

  // Get avatar color based on name
  getAvatarColor(name) {
    const colors = [
      'bg-amber-100 text-amber-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
};

// Create the increment_helpful_count function in Supabase (run this SQL in Supabase SQL Editor)
/*
CREATE OR REPLACE FUNCTION increment_helpful_count(review_id UUID, increment_by INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE reviews 
  SET helpful_count = GREATEST(0, helpful_count + increment_by)
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;
*/