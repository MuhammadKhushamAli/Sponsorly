/**
 * ReviewsSection
 * Reusable component used on:
 *  - CreatorPublicProfilePage
 *  - SponsorPublicProfilePage
 *  - DashboardPage (read-only, shows reviews you received)
 *
 * Props:
 *  - revieweeUserId  {string}  The User._id of the person whose reviews to show
 *  - revieweeName    {string}  Display name (for the write-review heading)
 *  - canReview       {bool}    Whether the current viewer can write a review
 *  - readOnly        {bool}    When true, hides the write-review form entirely
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { reviewAPI } from '../../services/api';
import { Spinner } from './UIComponents';
import { Star, Trash2, MessageSquare } from 'lucide-react';

// ── Star display / selector ───────────────────────────────────────────────────
const StarRow = ({ value, interactive = false, onChange }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? () => onChange(n) : undefined}
        className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        disabled={!interactive}
        aria-label={interactive ? `Rate ${n} star${n > 1 ? 's' : ''}` : undefined}
      >
        <Star
          size={interactive ? 24 : 16}
          className={n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-100'}
        />
      </button>
    ))}
  </div>
);

// ── Average rating bar ────────────────────────────────────────────────────────
const RatingBar = ({ value, count }) => {
  const pct = Math.round((value / 5) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="text-4xl font-black text-gray-900 tabular-nums leading-none">{value}</div>
      <div>
        <StarRow value={Math.round(Number(value))} />
        <p className="text-xs text-gray-500 mt-1">{count} review{count !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden ml-2">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ── Single review card ────────────────────────────────────────────────────────
const ReviewCard = ({ review, currentUserId, onDelete }) => {
  const reviewer = review.reviewerId;
  const name = reviewer?.name || 'Anonymous';
  const isOwn = String(reviewer?._id || reviewer) === String(currentUserId);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete your review?')) return;
    setDeleting(true);
    try {
      await reviewAPI.delete(review._id);
      onDelete(review._id);
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        {/* Reviewer */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shrink-0 uppercase">
            {name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{name}</p>
            <p className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StarRow value={review.rating} />
          {isOwn && (
            <button
              id={`delete-review-${review._id}`}
              onClick={handleDelete}
              disabled={deleting}
              className="p-1 rounded-lg text-gray-300 hover:text-error hover:bg-red-50 transition-colors"
              title="Delete your review"
            >
              {deleting ? <Spinner size="sm" /> : <Trash2 size={14} />}
            </button>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="mt-3 text-sm text-gray-700 leading-relaxed border-t border-gray-50 pt-3">
          {review.comment}
        </p>
      )}
    </div>
  );
};

// ── Write review form ─────────────────────────────────────────────────────────
const WriteReviewForm = ({ revieweeUserId, revieweeName, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please choose a star rating.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await reviewAPI.create(revieweeUserId, { rating, comment });
      onSubmitted(res.data.review);
      setRating(0);
      setComment('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-primary-50 to-secondary-50 border border-primary-100 rounded-2xl p-5"
    >
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare size={16} className="text-primary-500" />
        Write a review for {revieweeName}
      </h4>

      {/* Star selector */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">Your rating</p>
        <StarRow value={rating} interactive onChange={setRating} />
      </div>

      {/* Comment */}
      <textarea
        id="review-comment-input"
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)…"
        className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none resize-none transition-colors"
      />

      {error && <p className="text-xs text-error mt-2">{error}</p>}

      <button
        id="submit-review-btn"
        type="submit"
        disabled={submitting || rating === 0}
        className="mt-3 px-5 py-2 bg-gradient-brand text-white rounded-xl font-semibold text-sm
          disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all hover:shadow-brand"
      >
        {submitting ? <Spinner size="sm" /> : <Star size={14} />}
        Submit Review
      </button>
    </form>
  );
};

// ── Main export ───────────────────────────────────────────────────────────────
const ReviewsSection = ({
  revieweeUserId,
  revieweeName = 'this user',
  canReview = false,
  readOnly = false,
}) => {
  const { user } = useSelector((s) => s.auth);
  const currentUserId = user?.id || user?._id;

  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState('0.0');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!revieweeUserId) return;
    setLoading(true);
    try {
      const res = await reviewAPI.getForUser(revieweeUserId);
      setReviews(res.data?.reviews || []);
      setAverage(res.data?.average || '0.0');
    } catch {
      /* silent fail – profile still works */
    } finally {
      setLoading(false);
    }
  }, [revieweeUserId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmitted = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
    // Recalculate average locally
    const all = [newReview, ...reviews];
    const avg = (all.reduce((s, r) => s + Number(r.rating), 0) / all.length).toFixed(1);
    setAverage(avg);
  };

  const handleDeleted = (deletedId) => {
    const remaining = reviews.filter((r) => r._id !== deletedId);
    setReviews(remaining);
    const avg = remaining.length
      ? (remaining.reduce((s, r) => s + Number(r.rating), 0) / remaining.length).toFixed(1)
      : '0.0';
    setAverage(avg);
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Star size={18} className="text-yellow-400 fill-yellow-400" />
          Reviews & Ratings
        </h3>
      </div>

      {/* Summary bar */}
      {!loading && (
        <RatingBar value={average} count={reviews.length} />
      )}

      {/* Write review */}
      {!readOnly && canReview && (
        <WriteReviewForm
          revieweeUserId={revieweeUserId}
          revieweeName={revieweeName}
          onSubmitted={handleSubmitted}
        />
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
          <Star size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              currentUserId={currentUserId}
              onDelete={handleDeleted}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ReviewsSection;
