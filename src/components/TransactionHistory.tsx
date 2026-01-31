import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrendingUp, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function TransactionHistory() {
    const transactions = useQuery(api.wallet.getMyTransactions, { limit: 10 });

    if (!transactions) {
        return (
            <div className="bento-card span-2">
                <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 16 }}>Recent Transactions</h2>
                <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                    <div className="loading-spinner" />
                </div>
            </div>
        );
    }

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case "TASK_APPROVED":
                return <TrendingUp size={16} style={{ color: "var(--success)" }} />;
            case "PAYOUT_REQUESTED":
                return <ArrowUpRight size={16} style={{ color: "var(--warning)" }} />;
            case "PAYOUT_PAID":
                return <CheckCircle2 size={16} style={{ color: "var(--success)" }} />;
            case "PAYOUT_REJECTED":
                return <ArrowDownLeft size={16} style={{ color: "var(--danger)" }} />;
            default:
                return <TrendingUp size={16} style={{ color: "var(--text-muted)" }} />;
        }
    };

    const getAmountColor = (amount: number) => {
        if (amount > 0) return "var(--success)";
        if (amount < 0) return "var(--text-muted)";
        return "var(--text-secondary)";
    };

    return (
        <div className="bento-card span-2">
            <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 16 }}>Recent Transactions</h2>

            {transactions.length === 0 ? (
                <div className="empty-state" style={{ padding: "24px 0" }}>
                    <p className="empty-text">No transactions yet</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    {transactions.map((tx: any) => (
                        <div
                            key={tx._id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 0",
                                borderBottom: "1px solid var(--border)"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--bg-secondary)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    {getTransactionIcon(tx.type)}
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>
                                        {tx.description}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        {new Date(tx.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: getAmountColor(tx.amount)
                            }}>
                                {tx.amount > 0 ? "+" : ""}{tx.amount !== 0 ? `$${Math.abs(tx.amount).toLocaleString()}` : "—"}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
