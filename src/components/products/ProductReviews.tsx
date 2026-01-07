import React, { useState } from 'react';
import { Star, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useReviews } from '@/context/ReviewContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { user, isAdmin } = useAuth();
  const { getProductReviews, addReview, hasUserReviewed, getAverageRating, deleteReview } = useReviews();
  
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviews = getProductReviews(productId);
  const averageRating = getAverageRating(productId);
  const userHasReviewed = user ? hasUserReviewed(productId, user.id) : false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to leave a review');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    
    addReview({
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      comment: comment.trim(),
    });

    setComment('');
    setRating(5);
    toast.success('Review submitted successfully!');
    setIsSubmitting(false);
  };

  const handleDelete = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReview(reviewId);
      toast.success('Review deleted');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
      : 0,
  }));

  return (
    <div className="mt-16">
      <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
        Customer Reviews
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-foreground">{averageRating || '-'}</p>
              <div className="flex justify-center gap-1 my-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(averageRating)
                        ? 'fill-[hsl(42,75%,55%)] text-[hsl(42,75%,55%)]'
                        : 'text-muted'
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">{reviews.length} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-8">{star}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[hsl(42,75%,55%)] rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Form */}
          {user && !userHasReviewed && (
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 border border-border mt-6">
              <h3 className="font-semibold text-foreground mb-4">Write a Review</h3>
              
              {/* Star Rating */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Your Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'fill-[hsl(42,75%,55%)] text-[hsl(42,75%,55%)]'
                            : 'text-muted'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-4">
                <Textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[hsl(42,75%,55%)] text-[hsl(25,30%,15%)] hover:bg-[hsl(42,70%,50%)]"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}

          {user && userHasReviewed && (
            <div className="bg-[hsl(42,75%,55%)]/10 rounded-xl p-4 mt-6 text-center">
              <p className="text-sm text-[hsl(42,80%,35%)]">
                ✓ You have already reviewed this product
              </p>
            </div>
          )}

          {!user && (
            <div className="bg-muted rounded-xl p-4 mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Login to write a review
              </p>
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2">
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div
                  key={review.id}
                  className="bg-card rounded-xl p-6 border border-border animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[hsl(42,75%,55%)]/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-[hsl(42,75%,55%)]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{review.userName}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(review.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-[hsl(42,75%,55%)] text-[hsl(42,75%,55%)]'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-foreground mb-2">No reviews yet</p>
              <p className="text-muted-foreground">
                Be the first to review this product!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
