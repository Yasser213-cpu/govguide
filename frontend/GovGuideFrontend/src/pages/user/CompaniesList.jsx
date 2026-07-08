import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCompanies } from "../../api/companyApi";
import {
  FiSearch,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiX,
  FiClock,
  FiStar,
} from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import { usePageLoading } from "../../context/PageLoadingContext";
import useDocumentTitle from "../../hooks/useDocumentTitle";

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

  const rating = company.rating;

  // Unique procedure names as tags
  const tags = [
    ...new Set(
      services
        .filter((s) => s.is_available && s.company_offerings?.name)
        .map((s) => s.company_offerings.name)
        .slice(0, 3),
    ),
  ];
  const logoUrl = company.logo ? `http://127.0.0.1:8000${company.logo}` : null;

  return (
    <div className="bg-[var(--background-primary)] border border-[var(--border)] rounded-xl p-5 hover:shadow-md hover:border-[var(--primary)] transition-all">
      <div
        className="flex items-center justify-between gap-6"
        onClick={() => onViewDetails(company.id)}
      >
        {/* Left */}
        <div className="flex items-center gap-4 flex-1">
          <div className="h-16 w-16 rounded-xl bg-[var(--primary-light)] flex items-center justify-center shrink-0">
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

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">
              {company.name}
            </h3>

            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)] mt-1">
              <FiMapPin size={14} />
              <span>
                {company.governorate}
                {company.city ? `, ${company.city}` : ""}
              </span>
            </div>

            <p className="text-sm text-[var(--text-secondary)] mt-3 line-clamp-2">
              {company.description || "No description provided."}
            </p>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="flex items-center gap-1">
            <FiStar
              size={16}
              className={`${
                rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              }`}
            />

            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {rating ? Number(rating).toFixed(1) : "N/A"}
            </span>
          </div>
          {minFee !== null && (
            <div className="text-right">
              <p className="text-xs text-[var(--text-secondary)]">
                Starting From
              </p>

              <p className="font-bold text-lg text-[var(--text-primary)]">
                EGP {minFee.toLocaleString()}
              </p>
            </div>
          )}

          {minDays !== null && (
            <div className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
              <FiClock size={14} />
              {minDays}-{minDays + 2} days
            </div>
          )}

          <button
            onClick={() => onViewDetails(company.id)}
            className="px-5 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90"
          >
            View Details
          </button>
        </div>
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
  useDocumentTitle("Companies");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [companies, setCompanies] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageLoading(loading);

  // Filters derived from URL params
  const [nameSearch, setNameSearch] = useState(searchParams.get("name") || "");
  const [governorate, setGovernorate] = useState(
    searchParams.get("governorate") || "",
  );
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [sortBy, setSortBy] = useState("");
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1,
  );
  const [showFilters, setShowFilters] = useState(false);

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const buildParams = useCallback(
    (page = currentPage) => {
      const params = { page, page_size: PAGE_SIZE };

      if (nameSearch.trim()) params.name = nameSearch.trim();

      if (governorate && governorate !== "All Areas")
        params.governorate = governorate;

      if (city.trim()) params.city = city.trim();

      if (sortBy) params.ordering = sortBy;

      return params;
    },
    [nameSearch, governorate, city, sortBy, currentPage],
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
    <>
      <PageHeader
        title="Companies"
        subtitle="Find and compare trusted service providers"
      />

      <div className="space-y-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
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
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[var(--text-secondary)]">
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors w-48"
                >
                  <option value="">Default</option>
                  <option value="-average_rating">Highest Rating</option>
                  <option value="average_rating">Lowest Rating</option>
                </select>
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
      <div>
        {/* Result count */}
        {!error && (
          <p className="text-sm text-[var(--text-secondary)] mb-5 mt-5">
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

        {/* Company grid */}
        {!error && companies.length > 0 && (
          <div className="flex flex-col gap-4">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewDetails={(id) => navigate(`/user/companies/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!error && companies.length === 0 && (
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
    </>
  );
}
