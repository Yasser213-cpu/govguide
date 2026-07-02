import { FiAlertTriangle, FiExternalLink, FiLoader } from "react-icons/fi";

const API_BASE = "http://localhost:8000";

const FLAG_LABELS = {
  low_confidence: "Low Confidence",
  little_text: "Little Text",
  type_uncertain: "Type Uncertain",
};

function resolveFileUrl(file) {
  if (!file) return null;
  if (file.startsWith("http")) return file;
  return `${API_BASE}${file.startsWith("/") ? file : `/${file}`}`;
}

function isImageFile(file) {
  if (!file) return false;
  return /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(file);
}

function OcrStatusSection({ status, extractedText }) {
  if (status === "pending") {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-600">
        <FiLoader className="animate-spin shrink-0" />
        <span>Processing OCR...</span>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-600">
        OCR Failed
      </span>
    );
  }

  if (status === "done") {
    return (
      <div>
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
          Extracted Text
        </p>
        <div className="max-h-40 overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] p-3 text-sm whitespace-pre-wrap">
          {extractedText?.trim() ? extractedText : "No text extracted."}
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-[var(--text-secondary)]">OCR status unavailable.</p>
  );
}

export default function DocumentReviewCard({ document }) {
  const {
    requirement,
    file,
    ocr_status,
    extracted_text,
    ocr_confidence,
    needs_review,
    verification_flags = [],
  } = document;

  const fileUrl = resolveFileUrl(file);
  const showImagePreview = isImageFile(file);

  const cardClass = needs_review
    ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-300"
    : "border-[var(--border)]";

  return (
    <div className={`rounded-xl border p-4 ${cardClass}`}>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-[var(--text-primary)]">
            {requirement || "Document"}
          </h4>
          {needs_review && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
              <FiAlertTriangle className="shrink-0" />
              Needs Review
            </span>
          )}
        </div>

        {ocr_confidence != null && ocr_status === "done" && (
          <span className="rounded-full bg-[var(--background-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-primary)]">
            {Math.round(ocr_confidence)}% confidence
          </span>
        )}
      </div>

      {fileUrl && (
        <div className="mb-4">
          {showImagePreview ? (
            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={fileUrl}
                alt={requirement || "Document preview"}
                className="max-h-48 w-full rounded-lg border border-[var(--border)] object-contain bg-white"
              />
            </a>
          ) : (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View file
              <FiExternalLink className="shrink-0" />
            </a>
          )}
        </div>
      )}

      <div className="space-y-3">
        <OcrStatusSection status={ocr_status} extractedText={extracted_text} />

        {verification_flags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {verification_flags.map((flag) => (
              <span
                key={flag}
                className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700"
              >
                {FLAG_LABELS[flag] ?? flag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
