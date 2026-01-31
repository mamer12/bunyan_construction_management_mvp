import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Wallet, TrendingUp, Clock, ArrowUpRight } from "lucide-react";

interface WalletCardProps {
    onRequestPayout: () => void;
}

export function WalletCard({ onRequestPayout }: WalletCardProps) {
    const wallet = useQuery(api.wallet.getMyWallet);

    if (!wallet) {
        return (
            <div className="bento-card span-2" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="bento-card span-2" style={{
            background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.1) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.3)"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md)",
                        background: "rgba(59, 130, 246, 0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#3b82f6"
                    }}>
                        <Wallet size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Available Balance</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            ${wallet.availableBalance.toLocaleString()}
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={onRequestPayout}
                    disabled={wallet.availableBalance <= 0}
                >
                    <ArrowUpRight size={18} />
                    Request Payout
                </button>
            </div>

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
                borderTop: "1px solid var(--border)",
                paddingTop: 16
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <Clock size={14} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Pending</span>
                    </div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--warning)" }}>
                        ${wallet.pendingBalance.toLocaleString()}
                    </div>
                </div>

                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <TrendingUp size={14} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Earned</span>
                    </div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--success)" }}>
                        ${wallet.totalEarned.toLocaleString()}
                    </div>
                </div>

                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <ArrowUpRight size={14} style={{ color: "var(--text-muted)" }} />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Withdrawn</span>
                    </div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                        ${wallet.totalWithdrawn.toLocaleString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
