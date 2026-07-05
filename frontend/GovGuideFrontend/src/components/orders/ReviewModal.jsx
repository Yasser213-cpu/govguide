import { FiStar } from "react-icons/fi";
import { submitReview } from "../../features/orders/api/Ordersapi";
import { useState } from "react";

export default function ReviewModal({ order, onClose, showToast }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please enter a comment.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await submitReview(order.id, {
        rating,
        comment,
      });

      showToast("Review submitted successfully!");

      onClose();
    } catch (err) {
      console.error(err);

      const errorMessage =
        err.response?.data?.detail ||
        "Failed to submit review. Please try again.";

      setError(errorMessage);

      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-[var(--background-primary)] border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              Leave a Review
            </h3>

            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Share your experience with{" "}
              <span className="font-semibold">{order.company}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-lg hover:bg-[var(--background-secondary)] transition flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* الفورم هيتحط هنا بعدين */}
        <div className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Rating
            </label>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className={`text-4xl transition-all duration-200  ${
                    (hoveredRating || rating) >= star
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                >
                  <FiStar
                    className={`transition-all duration-200 ${
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    size={38}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
              Comment
            </label>

            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background-primary)] px-4 py-3 outline-none resize-none focus:border-[var(--primary)] transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--background-secondary)] transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-medium hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
