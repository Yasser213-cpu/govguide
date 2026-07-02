import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiAlertCircle,
    FiFileText,
    FiLoader,
    FiLink,
} from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import { getOrderById } from "../../features/orders/api/Ordersapi";

const STATUS_LABELS = {
    pending: "Pending",
    accepted: "Accepted",
    paid: "Paid",
    in_progress: "In Progress",
    completed: "Completed",
    rejected: "Cancelled",
};

export default function RequestDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrder() {
            setLoading(true);
            setError("");

            try {
                const data = await getOrderById(id);
                setOrder(data);
            } catch (err) {
                setError(
                    err?.response?.data?.detail ||
                    err?.response?.data?.message ||
                    "Failed to load request details. Please try again."
                );
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            loadOrder();
        }
    }, [id]);

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString("en-EG", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-8">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline"
            >
                <FiArrowLeft />
                Back to requests
            </button>

            <PageHeader
                title="Request Details"
                subtitle="View the full details of your paperwork request"
            />

            {loading && (
                <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-8 flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                    <FiLoader className="animate-spin" /> Loading request details...
                </div>
            )}

            {error && !loading && (
                <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 flex items-start gap-3">
                    <FiAlertCircle size={18} />
                    <div>{error}</div>
                </div>
            )}

            {order && !loading && !error && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
                            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-[0.12em] mb-3">
                                Request Information
                            </h2>
                            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                                <div>
                                    <p className="font-semibold text-[var(--text-primary)]">Company</p>
                                    <p>{order.company || "-"}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--text-primary)]">Service</p>
                                    <p>{order.procedure || "-"}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--text-primary)]">Status</p>
                                    <p>{STATUS_LABELS[order.status] || order.status}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--text-primary)]">Created At</p>
                                    <p>{formatDate(order.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6 lg:col-span-2">
                            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-[0.12em] mb-3">
                                Notes
                            </h2>
                            <p className="text-sm text-[var(--text-primary)] min-h-[4rem]">
                                {order.notes || "No notes provided."}
                            </p>

                            {order.rejection_reason ? (
                                <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                                    <p className="font-semibold">Rejection Reason</p>
                                    <p>{order.rejection_reason}</p>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--background-primary)] p-6">
                        <div className="flex items-center justify-between gap-3 mb-5">
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                                    Uploaded Documents
                                </h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Documents attached to this request.
                                </p>
                            </div>
                        </div>

                        {order.documents?.length > 0 ? (
                            <div className="space-y-4">
                                {order.documents.map((document) => {
                                    const fileName = document.file
                                        ? document.file.split("/").pop()
                                        : "Document";
                                    const fileUrl = document.file
                                        ? new URL(document.file, "http://localhost:8000").toString()
                                        : "#";
                                    return (
                                        <div
                                            key={`${document.requirement}-${document.file}`}
                                            className="rounded-xl border border-[var(--border)] bg-white p-4"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                        Requirement #{document.requirement}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                                                        {fileName}
                                                    </p>
                                                </div>
                                                <a
                                                    href={fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer noopener"
                                                    className="inline-flex items-center gap-2 text-sm text-[var(--primary)] font-semibold hover:underline"
                                                >
                                                    <FiLink /> View file
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background-secondary)] p-6 text-sm text-[var(--text-secondary)]">
                                No documents have been uploaded for this request yet.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
