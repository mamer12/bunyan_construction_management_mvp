import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TrendingUp, ArrowDownLeft, ArrowUpRight, CheckCircle2, History } from "lucide-react";
import { motion } from "framer-motion";
import { MotionListItem } from "./ui/motion";

export function TransactionHistory() {
    const transactions = useQuery(api.wallet.getMyTransactions, { limit: 10 });

    if (!transactions) {
        return (
            <motion.div 
                className="bento-card span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div style={{ padding: "1.5rem" }}>
                    <h2 style={{ 
                        fontSize: "1rem", 
                        fontWeight: 700, 
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        <History size={18} style={{ color: "var(--brand-primary)" }} />
                        Recent Transactions
                    </h2>
                    <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                        <div className="loading-spinner" />
                    </div>
                </div>
            </motion.div>
        );
    }

    const getTransactionIcon = (type: string) => {
        const iconStyles = {
            width: 36,
            height: 36,
            borderRadius: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        };

        switch (type) {
            case "TASK_APPROVED":
                return (
                    <div style={{ ...iconStyles, background: "var(--bg-mint)", color: "var(--success)" }}>
                        <TrendingUp size={18} />
                    </div>
                );
            case "PAYOUT_REQUESTED":
                return (
                    <div style={{ ...iconStyles, background: "#FFFBEB", color: "var(--warning)" }}>
                        <ArrowUpRight size={18} />
                    </div>
                );
            case "PAYOUT_PAID":
                return (
                    <div style={{ ...iconStyles, background: "var(--bg-mint)", color: "var(--success)" }}>
                        <CheckCircle2 size={18} />
                    </div>
                );
            case "PAYOUT_REJECTED":
                return (
                    <div style={{ ...iconStyles, background: "#FEF2F2", color: "var(--danger)" }}>
                        <ArrowDownLeft size={18} />
                    </div>
                );
            default:
                return (
                    <div style={{ ...iconStyles, background: "var(--bg-primary)", color: "var(--text-muted)" }}>
                        <TrendingUp size={18} />
                    </div>
                );
        }
    };

    const getAmountColor = (amount: number) => {
        if (amount > 0) return "var(--success)";
        if (amount < 0) return "var(--text-muted)";
        return "var(--text-secondary)";
    };

    return (
        <motion.div 
            className="bento-card span-2"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ 
                y: -4,
                boxShadow: "0 12px 24px rgba(5, 150, 105, 0.1)"
            }}
        >
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-light)" }}>
                <h2 style={{ 
                    fontSize: "1rem", 
                    fontWeight: 700,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                }}>
                    <History size={18} style={{ color: "var(--brand-primary)" }} />
                    Recent Transactions
                </h2>
            </div>

            {transactions.length === 0 ? (
                <div className="empty-state" style={{ padding: "2rem" }}>
                    <motion.div
                        animate={{ 
                            opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <History size={40} style={{ color: "var(--brand-primary)", opacity: 0.3 }} />
                    </motion.div>
                    <p className="empty-text" style={{ marginTop: "0.75rem" }}>No transactions yet</p>
                </div>
            ) : (
                <div style={{ maxHeight: 280, overflowY: "auto" }}>
                    {transactions.map((tx: any, index: number) => (
                        <MotionListItem 
                            key={tx._id}
                            index={index}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "0.875rem 1.5rem",
                                    borderBottom: "1px solid var(--border-light)"
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                                    {getTransactionIcon(tx.type)}
                                    <div>
                                        <div style={{ 
                                            fontSize: "0.875rem", 
                                            fontWeight: 600, 
                                            color: "var(--text-primary)",
                                            marginBottom: "0.125rem"
                                        }}>
                                            {tx.description}
                                        </div>
                                        <div style={{ 
                                            fontSize: "0.75rem", 
                                            color: "var(--text-muted)" 
                                        }}>
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
                                    fontWeight: 700,
                                    fontSize: "0.9rem",
                                    color: getAmountColor(tx.amount)
                                }}>
                                    {tx.amount > 0 ? "+" : ""}{tx.amount !== 0 ? `$${Math.abs(tx.amount).toLocaleString()}` : "---"}
                                </div>
                            </div>
                        </MotionListItem>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
