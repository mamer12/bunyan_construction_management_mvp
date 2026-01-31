import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Banknote,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    XCircle,
    Wallet,
    Receipt,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useLanguage } from "../contexts/LanguageContext";
import { Modal, ModalFooter, FormField } from "./ui/Modal";
import {
    MotionCard,
    MotionGradientCard,
    AnimatedCounter,
    MotionButton,
    MotionListItem
} from "./ui/motion";

export function FinanceDashboard() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<any>(null);

    // Queries
    const stats = useQuery(api.tasks.getStats);
    const pendingPayouts = useQuery(api.wallet.getPendingPayouts) || [];
    const allPayouts = useQuery(api.wallet.getAllPayouts) || [];

    // Mutations
    const processPayout = useMutation(api.wallet.processPayout);

    const handleProcessPayout = async (payoutId: string, action: "PAID" | "REJECTED") => {
        try {
            await processPayout({ 
                payoutId: payoutId as any, 
                action, 
                notes: action === "REJECTED" ? "Rejected by finance manager" : undefined 
            });
            toast.success(action === "PAID" ? "Payout processed!" : "Payout rejected");
            setSelectedPayout(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to process payout");
        }
    };

    const totalDisbursed = allPayouts
        .filter((p: any) => p.status === "PAID")
        .reduce((sum: number, p: any) => sum + p.amount, 0);

    const pendingAmount = pendingPayouts.reduce((sum: number, p: any) => sum + p.amount, 0);

    const financeMenuItems = [
        { id: "dashboard", label: t("dashboard"), icon: TrendingUp },
        { id: "payouts", label: "Payouts", icon: Wallet },
        { id: "transactions", label: "Transactions", icon: Receipt },
    ];

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <FinanceSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="main-content">
                <TopBar
                    breadcrumb="Finance"
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    userName="Finance Manager"
                />

                <div className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === "dashboard" && (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Stats */}
                                <div className="bento-grid" style={{ padding: 0, marginBottom: "1.5rem" }}>
                                    <MotionGradientCard delay={0.1} className="span-2">
                                        <div style={{ padding: "1.5rem" }}>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "0.5rem",
                                                marginBottom: "1rem",
                                                opacity: 0.9
                                            }}>
                                                <DollarSign size={20} />
                                                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                                    Total Disbursed
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "2.5rem", fontWeight: 800 }}>
                                                $<AnimatedCounter value={totalDisbursed} duration={1.5} />
                                            </div>
                                            <div style={{ 
                                                display: "flex", 
                                                alignItems: "center", 
                                                gap: "0.5rem",
                                                marginTop: "0.5rem",
                                                fontSize: "0.875rem",
                                                opacity: 0.9
                                            }}>
                                                <ArrowUpRight size={16} />
                                                <span>All-time payouts processed</span>
                                            </div>
                                        </div>
                                    </MotionGradientCard>

                                    <MotionCard delay={0.15}>
                                        <div className="stat-card">
                                            <div className="stat-icon orange">
                                                <Clock size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={pendingPayouts.length} />
                                            </div>
                                            <div className="stat-label">Pending Payouts</div>
                                        </div>
                                    </MotionCard>

                                    <MotionCard delay={0.2}>
                                        <div className="stat-card">
                                            <div className="stat-icon" style={{ background: "#FEF3C7", color: "#B45309" }}>
                                                <Banknote size={20} />
                                            </div>
                                            <div className="stat-value" style={{ color: "#B45309" }}>
                                                $<AnimatedCounter value={pendingAmount} />
                                            </div>
                                            <div className="stat-label">Pending Amount</div>
                                        </div>
                                    </MotionCard>
                                </div>

                                {/* Pending Payouts */}
                                <MotionCard delay={0.25}>
                                    <div className="card-header">
                                        <h3 className="card-title">Pending Payout Requests</h3>
                                    </div>
                                    {pendingPayouts.length === 0 ? (
                                        <div className="empty-state">
                                            <CheckCircle2 size={48} style={{ color: "var(--success)", opacity: 0.5 }} />
                                            <p className="empty-title" style={{ marginTop: "1rem" }}>All caught up!</p>
                                            <p className="empty-text">No pending payout requests</p>
                                        </div>
                                    ) : (
                                        <div style={{ overflowX: "auto" }}>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Engineer</th>
                                                        <th>Amount</th>
                                                        <th>Method</th>
                                                        <th>Requested</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingPayouts.map((payout: any, index: number) => (
                                                        <motion.tr
                                                            key={payout._id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.3 + index * 0.05 }}
                                                        >
                                                            <td>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                                    <div style={{
                                                                        width: 36,
                                                                        height: 36,
                                                                        borderRadius: "10px",
                                                                        background: "var(--bg-mint)",
                                                                        color: "var(--brand-primary)",
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        fontWeight: 700
                                                                    }}>
                                                                        {payout.userName?.charAt(0) || "U"}
                                                                    </div>
                                                                    <span style={{ fontWeight: 600 }}>{payout.userName || "Unknown"}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ fontWeight: 700, color: "var(--brand-primary)" }}>
                                                                ${payout.amount.toLocaleString()}
                                                            </td>
                                                            <td>
                                                                <span className="badge badge-neutral">
                                                                    {payout.paymentMethod || "Cash"}
                                                                </span>
                                                            </td>
                                                            <td style={{ color: "var(--text-secondary)" }}>
                                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                                    <MotionButton
                                                                        className="btn-success"
                                                                        onClick={() => handleProcessPayout(payout._id, "PAID")}
                                                                        style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                                                                    >
                                                                        <CheckCircle2 size={14} /> Pay
                                                                    </MotionButton>
                                                                    <MotionButton
                                                                        className="btn-danger"
                                                                        onClick={() => handleProcessPayout(payout._id, "REJECTED")}
                                                                        style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}
                                                                    >
                                                                        <XCircle size={14} />
                                                                    </MotionButton>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </MotionCard>
                            </motion.div>
                        )}

                        {activeTab === "payouts" && (
                            <motion.div
                                key="payouts"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MotionCard>
                                    <div className="card-header">
                                        <h3 className="card-title">All Payouts</h3>
                                    </div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Engineer</th>
                                                    <th>Amount</th>
                                                    <th>Method</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allPayouts.map((payout: any, index: number) => (
                                                    <motion.tr
                                                        key={payout._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 + index * 0.03 }}
                                                    >
                                                        <td style={{ fontWeight: 600 }}>{payout.userName || "Unknown"}</td>
                                                        <td style={{ fontWeight: 700, color: "var(--brand-primary)" }}>
                                                            ${payout.amount.toLocaleString()}
                                                        </td>
                                                        <td>{payout.paymentMethod || "Cash"}</td>
                                                        <td>
                                                            <span className={`badge ${
                                                                payout.status === "PAID" ? "badge-success" :
                                                                payout.status === "REJECTED" ? "badge-danger" :
                                                                "badge-warning"
                                                            }`}>
                                                                {payout.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: "var(--text-secondary)" }}>
                                                            {new Date(payout.requestedAt).toLocaleDateString()}
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </MotionCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

// Finance-specific Sidebar
function FinanceSidebar({ activeTab, onTabChange, isOpen, onClose }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
}) {
    const { signOut } = require("@convex-dev/auth/react").useAuthActions();
    const { t } = useLanguage();
    const isMobile = require("../hooks/use-mobile").useIsMobile();

    const menuItems = [
        { id: "dashboard", label: "Overview", icon: TrendingUp },
        { id: "payouts", label: "Payouts", icon: Wallet },
        { id: "transactions", label: "Transactions", icon: Receipt },
    ];

    const shouldBeOpen = isMobile ? isOpen : true;

    return (
        <>
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        className="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            <motion.aside
                className={`sidebar ${shouldBeOpen ? 'open' : ''}`}
                initial={false}
                animate={shouldBeOpen ? { x: 0, opacity: 1 } : { x: -280, opacity: 0 }}
                style={{
                    background: "linear-gradient(180deg, #F59E0B 0%, #D97706 50%, #B45309 100%)"
                }}
            >
                {/* Logo */}
                <div style={{
                    padding: "2rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1.25rem"
                    }}>
                        <Banknote size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Bunyan</h1>
                        <span style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Finance
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "1.5rem 0" }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                onTabChange(item.id);
                                if (isMobile) onClose();
                            }}
                            className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
                            style={{
                                width: "calc(100% - 1.5rem)",
                                background: activeTab === item.id ? "white" : "none",
                                color: activeTab === item.id ? "#B45309" : "rgba(255,255,255,0.8)",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                margin: "0.25rem 0.75rem"
                            }}
                        >
                            <item.icon size={20} />
                            <span style={{ fontWeight: activeTab === item.id ? 700 : 500 }}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Sign Out */}
                <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <button
                        className="sidebar-link"
                        onClick={() => void signOut()}
                        style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.1)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "1rem",
                            justifyContent: "center"
                        }}
                    >
                        {t("signOut")}
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
