import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCompanies } from "../../api/companyApi";
import {
  FiSearch,
  FiMapPin,
  FiPhone,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
  FiClock,
  FiHeart,
} from "react-icons/fi";

const GOVERNORATES = [
  "All Areas",
  "Cairo",
  "Giza",
  "Alexandria",
  "Dakahlia",
  "Red Sea",
  "Beheira",
  "Fayoum",
  "Gharbiya",
  "Ismailia",
  "Menofia",
  "Minya",
  "Qaliubiya",
  "Port Said",
  "Luxor",
  "Qena",
  "Sohag",
  "Suez",
  "Aswan",
  "Assiut",
  "Beni Suef",
  "Kafr El Sheikh",
  "Sharqia",
  "Damietta",
];

function CompanyCard({ company, onViewDetails }) {
  const services = company.company_services || [];
  const minFee = services.length
    ? Math.min(...services.map((s) => parseFloat(s.company_service_fee)))
    : null;
  const minDays = services.length
    ? Math.min(...services.map((s) => s.estimated_completion_days))
    : null;

  // Unique procedure names as tags
  const tags = [
    ...new Set(
      services
        .filter((s) => s.is_available && s.company_offerings?.name)
        .map((s) => s.company_offerings.name)
        .slice(0, 3),
    ),
  ];

  return (
    <div className="bg-[var(--background-primary)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-[var(--primary)] transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="h-12 w-12 rounded-xl bg-[var(--primary-light)] flex items-center justify-center shrink-0">
            <span className="text-[var(--primary)] font-bold text-lg uppercase">
              {company.name?.[0] || "C"}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-tight line-clamp-1">
              {company.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mt-0.5">
              <FiMapPin size={11} />
              <span>
                {company.governorate}
                {company.city ? `, ${company.city}` : ""}
              </span>
            </div>
          </div>
        </div>
        {/* <button
          className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors shrink-0"
          aria-label="Save company"
        >
          <FiHeart size={18} />
        </button> */}
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
        {company.description || "No description provided."}
      </p>

      {/* Service tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)]"
            >
              {tag}
            </span>
          ))}
          {services.length > 3 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--background-secondary)] text-[var(--text-secondary)]">
              +{services.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] mt-auto">
        <div className="flex flex-col gap-0.5">
          {minFee !== null && (
            <span className="text-xs font-semibold text-[var(--text-primary)]">
              From EGP {minFee.toLocaleString()}
            </span>
          )}
          {minDays !== null && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
              <FiClock size={10} />
              {minDays}–{minDays + 2} days
            </span>
          )}
        </div>
        <button
          onClick={() => onViewDetails(company.id)}
          className="text-xs font-semibold px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      )
        pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronLeft size={16} />
      </button>

      {getPages().map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="px-1 text-[var(--text-secondary)] text-sm"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors
              ${
                currentPage === page
                  ? "bg-[var(--primary)] text-white border border-[var(--primary)]"
                  : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
}

export default function CompaniesList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [companies, setCompanies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filters derived from URL params
  const [nameSearch, setNameSearch] = useState(searchParams.get("name") || "");
  const [governorate, setGovernorate] = useState(
    searchParams.get("governorate") || "",
  );
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [showFilters, setShowFilters] = useState(false);

  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const buildParams = useCallback(
    (page = currentPage) => {
      const params = { page };
      if (nameSearch.trim()) params.name = nameSearch.trim();
      if (governorate && governorate !== "All Areas")
        params.governorate = governorate;
      if (city.trim()) params.city = city.trim();
      return params;
    },
    [nameSearch, governorate, city, currentPage],
  );

  const fetchCompanies = useCallback(
    async (page = currentPage) => {
      setLoading(true);
      setError("");
      try {
        const params = buildParams(page);
        const res = await getCompanies(params);
        setCompanies(res.data.results || []);
        setTotalCount(res.data.count || 0);

        // Sync URL
        const urlParams = {};
        if (params.name) urlParams.name = params.name;
        if (params.governorate) urlParams.governorate = params.governorate;
        if (params.city) urlParams.city = params.city;
        if (page > 1) urlParams.page = page;
        setSearchParams(urlParams, { replace: true });
      } catch (err) {
        setError("Failed to load companies. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [buildParams, currentPage, setSearchParams],
  );

  // Initial load
  useEffect(() => {
    fetchCompanies(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCompanies(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCompanies(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setNameSearch("");
    setGovernorate("");
    setCity("");
    setCurrentPage(1);
    // Fetch without params
    setLoading(true);
    getCompanies({ page: 1 })
      .then((res) => {
        setCompanies(res.data.results || []);
        setTotalCount(res.data.count || 0);
        setSearchParams({}, { replace: true });
      })
      .catch(() => setError("Failed to load companies."))
      .finally(() => setLoading(false));
  };

  const hasActiveFilters =
    nameSearch || (governorate && governorate !== "All Areas") || city;

  return (
    <div className="min-h-screen bg-[var(--background-secondary)]">
      {/* ── Header ── */}
      <div className="bg-[var(--background-primary)] border-b border-[var(--border)] px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
            Companies
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Find and compare trusted service providers
          </p>

          {/* Search + filter bar */}
          <form
            onSubmit={handleSearch}
            className="mt-5 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
                size={16}
              />
              <input
                type="text"
                placeholder="Search companies..."
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            {/* Governorate filter */}
            <select
              value={governorate}
              onChange={(e) => setGovernorate(e.target.value)}
              className="h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors"
            >
              {GOVERNORATES.map((g) => (
                <option key={g} value={g === "All Areas" ? "" : g}>
                  {g}
                </option>
              ))}
            </select>

            {/* Toggle more filters */}
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-2 h-10 px-4 rounded-lg border text-sm font-medium transition-colors
                ${
                  showFilters
                    ? "border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                }`}
            >
              <FiFilter size={14} />
              Filters
            </button>

            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </form>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--text-secondary)]">
                  City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nasr City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors w-48"
                />
              </div>
            </div>
          )}

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-3">
              {nameSearch && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                  Name: {nameSearch}
                  <button
                    onClick={() => setNameSearch("")}
                    className="hover:opacity-70"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              {governorate && governorate !== "All Areas" && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                  {governorate}
                  <button
                    onClick={() => setGovernorate("")}
                    className="hover:opacity-70"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              {city && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)]">
                  {city}
                  <button
                    onClick={() => setCity("")}
                    className="hover:opacity-70"
                  >
                    <FiX size={11} />
                  </button>
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="text-xs text-[var(--text-secondary)] hover:text-[var(--danger)] underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Result count */}
        {!loading && !error && (
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            {totalCount > 0
              ? `Showing ${companies.length} of ${totalCount} companies`
              : "No companies found"}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-[var(--danger-light)] text-[var(--danger)] px-5 py-4 text-sm mb-5">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-52 rounded-xl bg-[var(--background-primary)] border border-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Company grid */}
        {!loading && !error && companies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewDetails={(id) => navigate(`/companies/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && companies.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-full bg-[var(--primary-light)] flex items-center justify-center mb-4">
              <FiSearch size={28} className="text-[var(--primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No companies found
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-xs">
              Try adjusting your search or clearing the filters to see more
              results.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-4 text-sm text-[var(--primary)] font-medium underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
