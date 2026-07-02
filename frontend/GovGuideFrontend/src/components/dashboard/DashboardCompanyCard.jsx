import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  FiStar,
  FiArrowRight,
  FiMapPin,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

export default function DashboardCompanyCard({ company }) {
  const services = company.company_services || [];
  const logoUrl = company.logo ? `http://127.0.0.1:8000${company.logo}` : null;

  const [reviewsCount, setReviewsCount] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchReviewsCount() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/v1/companies/${company.id}/reviews`,
        );
        const data = await res.json();
        // handles either a plain array or a paginated { count, results } shape
        const count = Array.isArray(data)
          ? data.length
          : (data.count ?? data.results?.length ?? 0);
        if (isMounted) setReviewsCount(count);
      } catch {
        if (isMounted) setReviewsCount(0);
      }
    }

    if (company.id) fetchReviewsCount();

    return () => {
      isMounted = false;
    };
  }, [company.id]);

  const minFee = services.length
    ? Math.min(...services.map((s) => parseFloat(s.company_service_fee || 0)))
    : null;

  const minDays = services.length
    ? Math.min(...services.map((s) => s.estimated_completion_days || 0))
    : null;

  const tags = [
    ...new Set(
      services
        .filter((s) => s.is_available && s.company_offerings?.name)
        .map((s) => s.company_offerings.name)
        .slice(0, 2),
    ),
  ];

  return (
    <div className="group relative rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-5 transition-all duration-300 hover:border-[var(--primary)] hover:shadow-lg">
      {/* Logo */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[var(--primary-light)]">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={company.name}
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <span className="text-xl font-bold text-[var(--primary)]">
              {company.name?.[0]}
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 className="mt-4 line-clamp-1 text-center font-semibold">
        {company.name}
      </h3>

      {/* Rating */}
      <div className="mt-2 flex items-center justify-center gap-1 text-yellow-500">
        <FiStar className="fill-current" />
        <span className="font-medium">
          {company.rating?.toFixed(1) || "0.0"}
        </span>
        <span className="text-xs text-[var(--text-secondary)]">
          ({reviewsCount ?? "…"})
        </span>
      </div>

      {/* Location */}
      {company.city && (
        <div className="mt-2 flex items-center justify-center gap-1 text-sm text-[var(--text-secondary)]">
          <FiMapPin size={14} />
          {company.city}
        </div>
      )}

      {/* Extra Info Row */}
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--text-secondary)]">
        {/* Price */}
        <div className="flex items-center gap-1">
          <FiDollarSign size={14} />
          <span>
            {minFee !== null
              ? `From EGP ${minFee.toLocaleString()}`
              : "No price"}
          </span>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1">
          <FiClock size={14} />
          <span>
            {minDays !== null ? `${minDays}-${minDays + 2} days` : "N/A"}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="rounded-full bg-[var(--primary-light)] px-2 py-1 text-xs text-[var(--primary)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <Link
        to={`/user/companies/${company.id}`}
        className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        View Profile
        <FiArrowRight />
      </Link>
    </div>
  );
}
