import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import DashboardCompanyCard from "./DashboardCompanyCard";

export default function RecommendedCompanies({ companies, loading }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-60 rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommended For You</h2>

          <p className="text-sm text-[var(--text-secondary)]">
            Top rated companies selected based on customer reviews.
          </p>
        </div>

        <Link
          to="/companies"
          className="flex items-center gap-1 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          View All
          <FiArrowRight size={14} />
        </Link>
      </div>

      {companies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background-primary)] py-16 text-center">
          <div className="text-5xl">🏢</div>

          <h3 className="mt-4 text-lg font-semibold">No recommendations yet</h3>

          <p className="mt-2 text-[var(--text-secondary)]">
            Use the AI Assistant to receive personalized recommendations.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {companies.map((company) => (
            <DashboardCompanyCard key={company.id} company={company} />
          ))}
        </div>
      )}
    </section>
  );
}
