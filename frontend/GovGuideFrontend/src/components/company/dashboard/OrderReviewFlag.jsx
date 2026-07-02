import { FiFlag } from "react-icons/fi";

export default function OrderReviewFlag({ count, compact = false, className = "" }) {
  if (!count) return null;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border border-orange-400 bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800 shadow-sm ${className}`}
      title={`${count} document${count > 1 ? "s" : ""} need OCR review`}
    >
      <FiFlag className="fill-orange-600 text-orange-600" size={12} />
      {compact ? "Review" : `${count} need review`}
    </span>
  );
}
