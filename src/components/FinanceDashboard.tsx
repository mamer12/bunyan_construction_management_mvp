import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { FloatingMobileNav } from "./FloatingMobileNav";
import { useIsMobile } from "../hooks/use-mobile";
import { Modal } from "./ui/modal";
import { MotionCard, MotionButton, StaggerContainer, StaggerItem } from "./ui/motion";
import {
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle2,
    XCircle,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    FileText,
    CreditCard,
    PiggyBank,
    BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";

const ROLE_MENU_ACCESS = {
    admin: ["dashboard", "projects", "teams", "wallet", "settings"],
    acting_manager: ["dashboard", "projects", "teams", "wallet", "settings"],
    lead: ["dashboard", "projects", "teams", "wallet"],
    engineer: ["dashboard", "tasks", "wallet"],
    guest: ["dashboard"]
};

export function FinanceDashboard() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isMobile = useIsMobile();
    const [selectedPayout, setSelectedPayout] = useState<any>(null);

    // User Data
    const currentUser = useQuery(api.auth.loggedInUser);
    const role = (currentUser?.role as keyof typeof ROLE_MENU_ACCESS) || "guest";
    const allowedMenuIds = ROLE_MENU_ACCESS[role] || [];
    const users = useQuery(api.users.getUsers);

    // Payout Data
    const payoutStats = useQuery(api.wallet.getPayoutStats);
    const pendingPayouts = useQuery(api.wallet.getPendingPayouts) || [];
    const allPayouts = useQuery(api.wallet.getAllPayouts, {}) || [];
    const processPayout = useMutation(api.wallet.processPayout);

    const handleProcess = async (payoutId: string, action: "pay" | "reject") => {
        try {
            await processPayout({ payoutId: payoutId as any, action });
            toast.success(`Payout ${action === "pay" ? "approved" : "rejected"} successfully`);
            setSelectedPayout(null);
        } catch (error) {
            toast.error("Failed to process payout");
        }
    };

    // Calculate stats
    const stats = {
        pendingCount: pendingPayouts.length,
        pendingAmount: pendingPayouts.reduce((sum, p: any) => sum + p.amount, 0),
        totalPaid: payoutStats?.paidAmount || 0,
        totalPayouts: allPayouts.length,
    };

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main 
                className="main-content"
                style={{ 
                    marginLeft: isMobile ? 0 : (isSidebarCollapsed ? '80px' : '280px'),
                    transition: "margin-left 0.3s ease"
                }}
            >
                <TopBar
                    userName={currentUser?.name || "User"}
                    userRole={currentUser?.role || "guest"}
                />

                <div className="dashboard-content">
                    {/* Stats Overview */}
                    <StaggerContainer className="stats-grid">
                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--warning">
                                <div className="stat-card__icon">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">{stats.pendingCount}</span>
                                    <span className="stat-card__label">Pending Payouts</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>

                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--info">
                                <div className="stat-card__icon">
                                    <Wallet size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">${stats.pendingAmount.toLocaleString()}</span>
                                    <span className="stat-card__label">Pending Amount</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>

                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--success">
                                <div className="stat-card__icon">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">${stats.totalPaid.toLocaleString()}</span>
                                    <span className="stat-card__label">Total Paid Out</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>

                        <StaggerItem>
                            <MotionCard className="stat-card stat-card--primary">
                                <div className="stat-card__icon">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="stat-card__content">
                                    <span className="stat-card__value">{stats.totalPayouts}</span>
                                    <span className="stat-card__label">Total Transactions</span>
                                </div>
                            </MotionCard>
                        </StaggerItem>
                    </StaggerContainer>

                    {/* Pending Payouts Section */}
                    <MotionCard className="dashboard-card">
                        <div className="card-header">
                            <div className="card-header__title">
                                <Clock size={20} className="text-warning" />
                                <h3>Pending Payout Requests</h3>
                            </div>
                            <span className="badge badge--warning">{stats.pendingCount} pending</span>
                        </div>

                        <div className="card-body">
                            {pendingPayouts.length === 0 ? (
                                <div className="empty-state">
                                    <CheckCircle2 size={48} className="empty-state__icon" />
                                    <p>No pending payout requests</p>
                                </div>
                            ) : (
                                <div className="payout-list">
                                    {pendingPayouts.map((payout: any) => (
                                        <motion.div
                                            key={payout._id}
                                            className="payout-item"
                                            whileHover={{ scale: 1.01 }}
                                            onClick={() => setSelectedPayout(payout)}
                                        >
                                            <div className="payout-item__info">
                                                <div className="payout-item__avatar">
                                                    {payout.userName?.charAt(0) || "U"}
                                                </div>
                                                <div className="payout-item__details">
                                                    <span className="payout-item__name">{payout.userName || "Unknown User"}</span>
                                                    <span className="payout-item__method">
                                                        <CreditCard size={12} />
                                                        {payout.paymentMethod || "Not specified"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="payout-item__amount">
                                                <span className="amount">${payout.amount.toLocaleString()}</span>
                                                <span className="date">
                                                    {new Date(payout.requestedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="payout-item__actions">
                                                <MotionButton
                                                    className="btn-icon btn-icon--success"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProcess(payout._id, "pay");
                                                    }}
                                                >
                                                    <CheckCircle2 size={18} />
                                                </MotionButton>
                                                <MotionButton
                                                    className="btn-icon btn-icon--danger"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleProcess(payout._id, "reject");
                                                    }}
                                                >
                                                    <XCircle size={18} />
                                                </MotionButton>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </MotionCard>

                    {/* All Payouts History */}
                    <MotionCard className="dashboard-card">
                        <div className="card-header">
                            <div className="card-header__title">
                                <FileText size={20} />
                                <h3>Payout History</h3>
                            </div>
                        </div>

                        <div className="card-body">
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Amount</th>
                                            <th>Method</th>
                                            <th>Status</th>
                                            <th>Requested</th>
                                            <th>Processed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allPayouts.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-muted">
                                                    No payout history
                                                </td>
                                            </tr>
                                        ) : (
                                            allPayouts.slice(0, 20).map((payout: any) => (
                                                <tr key={payout._id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <div className="user-cell__avatar">
                                                                {payout.userName?.charAt(0) || "U"}
                                                            </div>
                                                            <span>{payout.userName || "Unknown"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="font-semibold">${payout.amount.toLocaleString()}</td>
                                                    <td>{payout.paymentMethod || "-"}</td>
                                                    <td>
                                                        <span className={`badge badge--${payout.status === "PAID" ? "success" :
                                                            payout.status === "PENDING" ? "warning" :
                                                                payout.status === "REJECTED" ? "danger" : "neutral"
                                                            }`}>
                                                            {payout.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">
                                                        {new Date(payout.requestedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="text-muted">
                                                        {payout.processedAt
                                                            ? new Date(payout.processedAt).toLocaleDateString()
                                                            : "-"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </MotionCard>
                </div>

            {/* Payout Detail Modal */}
            {selectedPayout && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedPayout(null)}
                    title="Process Payout"
                    maxWidth="md"
                >
                    <div className="payout-modal">
                        <div className="payout-modal__header">
                            <div className="payout-modal__avatar">
                                {selectedPayout.userName?.charAt(0) || "U"}
                            </div>
                            <div>
                                <h4>{selectedPayout.userName || "Unknown User"}</h4>
                                <p className="text-muted">{selectedPayout.userEmail || ""}</p>
                            </div>
                        </div>

                        <div className="payout-modal__amount">
                            <span className="label">Requested Amount</span>
                            <span className="value">${selectedPayout.amount.toLocaleString()}</span>
                        </div>

                        <div className="payout-modal__details">
                            <div className="detail-row">
                                <span className="label">Payment Method</span>
                                <span className="value">{selectedPayout.paymentMethod || "Not specified"}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Requested At</span>
                                <span className="value">
                                    {new Date(selectedPayout.requestedAt).toLocaleString()}
                                </span>
                            </div>
                            {selectedPayout.notes && (
                                <div className="detail-row">
                                    <span className="label">Notes</span>
                                    <span className="value">{selectedPayout.notes}</span>
                                </div>
                            )}
                        </div>

                        <div className="payout-modal__actions">
                            <MotionButton
                                className="btn-danger flex-1"
                                onClick={() => handleProcess(selectedPayout._id, "reject")}
                            >
                                <XCircle size={18} />
                                Reject
                            </MotionButton>
                            <MotionButton
                                className="btn-success flex-1"
                                onClick={() => handleProcess(selectedPayout._id, "pay")}
                            >
                                <CheckCircle2 size={18} />
                                Approve & Pay
                            </MotionButton>
                        </div>
                    </div>
                </Modal>
            )}
            
            {isMobile && (
                <FloatingMobileNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    allowedMenuIds={allowedMenuIds}
                />
            )}
            </main>
        </div>
    );
}
