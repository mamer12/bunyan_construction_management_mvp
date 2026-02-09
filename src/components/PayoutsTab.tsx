import { useState } from "react";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { generatePayoutInvoice } from "../utils/pdfGenerator";
import { Download, Banknote, Clock, CheckCircle2, XCircle, Smartphone, Building2, Filter } from "lucide-react";
import { toast } from "sonner";
import { LoadMoreButton } from "./ui/LoadMoreButton";
import { Id } from "../../convex/_generated/dataModel";

export function PayoutsTab() {
    const [statusFilter, setStatusFilter] = useState<"PENDING" | "PAID" | "REJECTED" | undefined>(undefined);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const stats = useQuery(api.wallet.getPayoutStats);
    const { results: payouts, status: paginationStatus, loadMore } = usePaginatedQuery(
        api.wallet.listPayouts,
        statusFilter ? { status: statusFilter } : {},
        { initialNumItems: 20 }
    );
    const processPayout = useMutation(api.wallet.processPayout);

    const handleProcess = async (payoutId: string, action: "pay" | "reject") => {
        setProcessingId(payoutId);
        try {
            await processPayout({ payoutId: payoutId as Id<"payouts">, action });
            toast.success(action === "pay" ? "Payout marked as paid!" : "Payout rejected");
        } catch (error) {
            toast.error(error.message || "Failed to process payout");
        } finally {
            setProcessingId(null);
        }
    };

    const getMethodIcon = (method?: string) => {
        switch (method) {
            case "ZAINCASH":
                return <Smartphone size={14} style={{ color: "#00a651" }} />;
            case "BANK":
                return <Building2 size={14} style={{ color: "#3b82f6" }} />;
            default:
                return <Banknote size={14} style={{ color: "#f59e0b" }} />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
            case "PAID":
                return <span className="badge badge-approved"><CheckCircle2 size={12} /> Paid</span>;
            case "REJECTED":
                return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                <div className="bento-card stat-card">
                    <div className="stat-icon orange">
                        <Clock size={20} />
                    </div>
                    <div className="stat-value">${stats?.pendingAmount.toLocaleString() || 0}</div>
                    <div className="stat-label">{stats?.pendingCount || 0} Pending Payouts</div>
                </div>

                <div className="bento-card stat-card">
                    <div className="stat-icon green">
                        <CheckCircle2 size={20} />
                    </div>
                    <div className="stat-value">${stats?.paidThisMonthAmount.toLocaleString() || 0}</div>
                    <div className="stat-label">Paid This Month</div>
                </div>

                <div className="bento-card stat-card">
                    <div className="stat-icon blue">
                        <Banknote size={20} />
                    </div>
                    <div className="stat-value">${stats?.paidAmount.toLocaleString() || 0}</div>
                    <div className="stat-label">Total Paid All Time</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <Filter size={18} style={{ color: "var(--text-muted)" }} />
                <div className="tabs">
                    <button
                        className={`tab ${!statusFilter ? "active" : ""}`}
                        onClick={() => setStatusFilter(undefined)}
                    >
                        All
                    </button>
                    <button
                        className={`tab ${statusFilter === "PENDING" ? "active" : ""}`}
                        onClick={() => setStatusFilter("PENDING")}
                    >
                        Pending
                    </button>
                    <button
                        className={`tab ${statusFilter === "PAID" ? "active" : ""}`}
                        onClick={() => setStatusFilter("PAID")}
                    >
                        Paid
                    </button>
                    <button
                        className={`tab ${statusFilter === "REJECTED" ? "active" : ""}`}
                        onClick={() => setStatusFilter("REJECTED")}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {/* Payouts List */}
            <div className="bento-card">
                {!payouts || payouts.length === 0 ? (
                    <div className="empty-state">
                        <Banknote className="empty-icon" />
                        <p className="empty-title">No payouts {statusFilter ? `with status "${statusFilter}"` : ""}</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {payouts.map((payout) => (
                            <div
                                key={payout._id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "16px 0",
                                    borderBottom: "1px solid var(--border)"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: "50%",
                                        background: "var(--bg-secondary)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "var(--accent)",
                                        fontWeight: 600
                                    }}>
                                        {payout.engineerName?.charAt(0) || "?"}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 500, color: "var(--text-primary)", marginBottom: 4 }}>
                                            {payout.engineerName}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
                                            {getMethodIcon(payout.paymentMethod)}
                                            <span style={{ color: "var(--text-muted)" }}>{payout.paymentMethod || "Cash"}</span>
                                            <span style={{ color: "var(--text-muted)" }}>•</span>
                                            <span style={{ color: "var(--text-muted)" }}>
                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {payout.notes && (
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                                                Note: {payout.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                                            ${payout.amount.toLocaleString()}
                                        </div>
                                        <div className="flex items-center justify-end gap-2">
                                            {getStatusBadge(payout.status)}
                                            {payout.status === "PAID" && (
                                                <button
                                                    onClick={() => generatePayoutInvoice(payout)}
                                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <Download size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {payout.status === "PENDING" && (
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleProcess(payout._id, "pay")}
                                                disabled={processingId === payout._id}
                                                style={{ padding: "8px 16px" }}
                                            >
                                                {processingId === payout._id ? (
                                                    <div className="loading-spinner" style={{ width: 16, height: 16 }} />
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={16} />
                                                        Pay
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                className="btn btn-danger"
                                                onClick={() => handleProcess(payout._id, "reject")}
                                                disabled={processingId === payout._id}
                                                style={{ padding: "8px 16px" }}
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <LoadMoreButton status={paginationStatus} loadMore={loadMore} />
            </div>
        </div>
    );
}
