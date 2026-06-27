import { FiCheckCircle, FiCircle, FiClock, FiDollarSign } from "react-icons/fi";

/**
 * Renders a procedure's requirements as a checklist, plus its fee/processing-time
 * summary. Pure presentational component — `procedure` is the raw response shape
 * from GET /api/v1/procedures/<id>.
 */
const ProcedureChecklist = ({ procedure }) => {
  if (!procedure) return null;

  const {
    name,
    description,
    estimated_government_fee,
    estimated_processing_days,
    government_authority,
    requirements = [],
  } = procedure;

  const hasFee = estimated_government_fee !== null && estimated_government_fee !== undefined;
  const hasDays = estimated_processing_days !== null && estimated_processing_days !== undefined;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background-primary)]">
      {/* Header */}
      <div className="border-b border-[var(--border)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--text-primary)]">{name}</p>
        {description ? (
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{description}</p>
        ) : null}
        {government_authority ? (
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{government_authority}</p>
        ) : null}
      </div>

      {/* Fees / processing time */}
      {(hasFee || hasDays) && (
        <div className="flex flex-wrap gap-4 border-b border-[var(--border)] px-4 py-3">
          {hasFee && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <FiDollarSign className="text-[var(--primary)]" size={16} />
              <span>
                الرسوم الرسمية:{" "}
                <span className="font-semibold">
                  {Number(estimated_government_fee).toLocaleString()} ج.م
                </span>
              </span>
            </div>
          )}
          {hasDays && (
            <div className="flex items-center gap-2 text-sm text-[var(--text-primary)]">
              <FiClock className="text-[var(--primary)]" size={16} />
              <span>
                مدة الإجراء التقديرية:{" "}
                <span className="font-semibold">{estimated_processing_days} يوم</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Checklist */}
      <ul className="divide-y divide-[var(--border)]">
        {requirements.map((req) => (
          <li key={req.id} className="flex items-start gap-3 px-4 py-3">
            {req.done ? (
              <FiCheckCircle className="mt-0.5 shrink-0 text-green-500" size={18} />
            ) : (
              <FiCircle className="mt-0.5 shrink-0 text-[var(--text-secondary)]" size={18} />
            )}
            <div>
              <p
                className={`text-sm ${
                  req.done
                    ? "text-[var(--text-secondary)] line-through"
                    : "text-[var(--text-primary)]"
                }`}
              >
                {req.title}
              </p>
              {req.description ? (
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {req.description}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProcedureChecklist;