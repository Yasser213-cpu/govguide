import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiChevronRight,
} from "react-icons/fi";

/**
 * Renders the ranked company list returned by POST /ai/recommend-companies/.
 * `results` is already sorted by score descending — render in order, no
 * client-side sorting needed.
 *
 * Clicking a card navigates to /companies/:id (company profile page).
 */
const CompanyRecommendations = ({ results = [] }) => {
  const navigate = useNavigate();

  if (!results.length) {
    return (
      <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--background-primary)] px-4 py-4 text-sm text-[var(--text-secondary)]">
        لا توجد شركات متاحة لهذا الإجراء حاليًا.
      </div>
    );
  }

  const goToCompany = (companyId) => {
    navigate(`/companies/${companyId}`);
  };

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
        الشركات المقترحة
      </p>

      {results.map((company) => (
        <button
          key={company.company_id}
          type="button"
          onClick={() => goToCompany(company.company_id)}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--background-primary)] px-4 py-3 text-left transition-all hover:border-[var(--primary)] hover:shadow-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {company.company_name}
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <FiMapPin size={13} />
                {company.city}
                {company.governorate ? `، ${company.governorate}` : ""}
              </span>
              <span className="flex items-center gap-1">
                <FiDollarSign size={13} />
                {Number(company.price).toLocaleString()} ج.م
              </span>
              <span className="flex items-center gap-1">
                <FiClock size={13} />
                {company.estimated_days} يوم
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-[var(--primary-light)] px-2 py-1 text-xs font-semibold text-[var(--primary)]">
              {Math.round(company.score * 100)}%
            </span>
            <FiChevronRight
              className="text-[var(--text-secondary)]"
              size={16}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default CompanyRecommendations;
