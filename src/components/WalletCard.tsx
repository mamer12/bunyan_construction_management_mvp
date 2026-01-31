import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Wallet, TrendingUp, Clock, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedCounter, MotionButton } from "./ui/motion";

interface WalletCardProps {
    onRequestPayout: () => void;
}

export function WalletCard({ onRequestPayout }: WalletCardProps) {
    const wallet = useQuery(api.wallet.getMyWallet);

    if (!wallet) {
        return (
            <motion.div 
                className="bento-card span-2" 
                style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    minHeight: 180
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="loading-spinner" />
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="bento-card span-2"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ 
                y: -4,
                boxShadow: "0 20px 40px rgba(5, 150, 105, 0.15)"
            }}
            style={{
                background: "linear-gradient(135deg, rgba(5, 150, 105, 0.05) 0%, rgba(16, 185, 129, 0.1) 100%)",
                border: "1px solid rgba(5, 150, 105, 0.2)",
                position: "relative",
                overflow: "hidden"
            }}
        >
            {/* Decorative elements */}
            <div style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(5, 150, 105, 0.1)"
            }} />
            <div style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(5, 150, 105, 0.05)"
            }} />

            <div style={{ 
                position: "relative", 
                zIndex: 1,
                padding: "1.5rem"
            }}>
                {/* Header */}
                <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "start", 
                    marginBottom: "1.5rem" 
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <motion.div 
                            style={{
                                width: 52,
                                height: 52,
                                borderRadius: "1rem",
                                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)"
                            }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                        >
                            <Wallet size={26} />
                        </motion.div>
                        <div>
                            <div style={{ 
                                fontSize: "0.75rem", 
                                color: "var(--text-secondary)",
                                fontWeight: 500,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.375rem"
                            }}>
                                <Sparkles size={12} style={{ color: "var(--brand-primary)" }} />
                                Available Balance
                            </div>
                            <div style={{ 
                                fontSize: "2rem", 
                                fontWeight: 800, 
                                color: "var(--text-primary)",
                                lineHeight: 1.1
                            }}>
                                $<AnimatedCounter value={wallet.availableBalance} duration={1.5} />
                            </div>
                        </div>
                    </div>

                    <MotionButton
                        className="btn-primary"
                        onClick={onRequestPayout}
                        disabled={wallet.availableBalance <= 0}
                        style={{ 
                            padding: "0.625rem 1rem",
                            fontSize: "0.875rem"
                        }}
                    >
                        <ArrowUpRight size={16} />
                        Payout
                    </MotionButton>
                </div>

                {/* Stats Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    borderTop: "1px solid rgba(5, 150, 105, 0.15)",
                    paddingTop: "1rem"
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.375rem", 
                            marginBottom: "0.25rem" 
                        }}>
                            <Clock size={14} style={{ color: "var(--warning)" }} />
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                Pending
                            </span>
                        </div>
                        <div style={{ 
                            fontSize: "1.125rem", 
                            fontWeight: 700, 
                            color: "var(--warning)" 
                        }}>
                            $<AnimatedCounter value={wallet.pendingBalance} duration={1} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.375rem", 
                            marginBottom: "0.25rem" 
                        }}>
                            <TrendingUp size={14} style={{ color: "var(--success)" }} />
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                Total Earned
                            </span>
                        </div>
                        <div style={{ 
                            fontSize: "1.125rem", 
                            fontWeight: 700, 
                            color: "var(--success)" 
                        }}>
                            $<AnimatedCounter value={wallet.totalEarned} duration={1.2} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "0.375rem", 
                            marginBottom: "0.25rem" 
                        }}>
                            <ArrowUpRight size={14} style={{ color: "var(--text-secondary)" }} />
                            <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                                Withdrawn
                            </span>
                        </div>
                        <div style={{ 
                            fontSize: "1.125rem", 
                            fontWeight: 700, 
                            color: "var(--text-primary)" 
                        }}>
                            $<AnimatedCounter value={wallet.totalWithdrawn} duration={1.3} />
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
