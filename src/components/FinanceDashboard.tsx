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
    Clock,
    CheckCircle2,
    XCircle,
    Wallet,
    FileText,
    CreditCard,
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

export function FinanceDashboard({ showHeader = true }: { showHeader?: boolean }) {
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const isMobile = useIsMobile();
    const [selectedPayout, setSelectedPayout] = useState<any>(null);

    // User Data
    const currentUser = useQuery(api.auth.loggedInUser);
    const role = (currentUser?.role as keyof typeof ROLE_MENU_ACCESS) || "guest";
    const allowedMenuIds = ROLE_MENU_ACCESS[role] || [];

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

    const renderContent = () => (
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
            <MotionCard className="dashboard-card shadow-sm border border-slate-200 mt-6">
                <div className="card-header p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="card-header__title flex items-center gap-2">
                        <Clock size={20} className="text-amber-500" />
                        <h3 className="font-semibold text-slate-800">Pending Payout Requests</h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        {stats.pendingCount} pending
                    </span>
                </div>

                <div className="card-body p-4">
                    {pendingPayouts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <CheckCircle2 size={48} className="mb-3 opacity-20" />
                            <p>No pending payout requests</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {pendingPayouts.map((payout: any) => (
                                <motion.div
                                    key={payout._id}
                                    className="p-4 rounded-xl border border-slate-100 bg-white hover:border-emerald-100 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between"
                                    whileHover={{ scale: 1.005 }}
                                    onClick={() => setSelectedPayout(payout)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                            {payout.userName?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{payout.userName || "Unknown User"}</p>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <CreditCard size={12} />
                                                {payout.paymentMethod || "Not specified"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">${payout.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MotionButton
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProcess(payout._id, "pay");
                                                }}
                                            >
                                                <CheckCircle2 size={16} />
                                            </MotionButton>
                                            <MotionButton
                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProcess(payout._id, "reject");
                                                }}
                                            >
                                                <XCircle size={16} />
                                            </MotionButton>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </MotionCard>

            {/* All Payouts History */}
            <MotionCard className="dashboard-card shadow-sm border border-slate-200 mt-6">
                <div className="card-header p-4 border-b border-slate-100">
                    <div className="card-header__title flex items-center gap-2">
                        <FileText size={20} className="text-slate-500" />
                        <h3 className="font-semibold text-slate-800">Payout History</h3>
                    </div>
                </div>

                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-slate-500 border-b border-slate-50">
                                    <th className="px-4 py-3 font-medium">User</th>
                                    <th className="px-4 py-3 font-medium">Amount</th>
                                    <th className="px-4 py-3 font-medium">Method</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Requested</th>
                                    <th className="px-4 py-3 font-medium">Processed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allPayouts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-400">
                                            No payout history
                                        </td>
                                    </tr>
                                ) : (
                                    allPayouts.slice(0, 20).map((payout: any) => (
                                        <tr key={payout._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                        {payout.userName?.charAt(0) || "U"}
                                                    </div>
                                                    <span className="font-medium text-slate-700">{payout.userName || "Unknown"}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-bold text-slate-900">${payout.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-slate-500">{payout.paymentMethod || "-"}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${payout.status === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    payout.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                        payout.status === "REJECTED" ? "bg-rose-50 text-rose-700 border-rose-100" :
                                                            "bg-slate-50 text-slate-700 border-slate-100"
                                                    }`}>
                                                    {payout.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">
                                                {new Date(payout.requestedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">
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
    );

    if (!showHeader) {
        return (
            <div className="p-4 md:p-6">
                {renderContent()}
                {selectedPayout && (
                    <PayoutDetailModal
                        payout={selectedPayout}
                        onClose={() => setSelectedPayout(null)}
                        handleProcess={handleProcess}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            <main className="main-content">
                <TopBar
                    userName={currentUser?.name || "User"}
                    userRole={currentUser?.role || "guest"}
                />

                <div className="p-4 md:p-6">
                    {renderContent()}
                </div>

                {selectedPayout && (
                    <PayoutDetailModal
                        payout={selectedPayout}
                        onClose={() => setSelectedPayout(null)}
                        handleProcess={handleProcess}
                    />
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

function PayoutDetailModal({ payout, onClose, handleProcess }: {
    payout: any,
    onClose: () => void,
    handleProcess: (id: string, action: "pay" | "reject") => void
}) {
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Process Payout"
            maxWidth="md"
        >
            <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                        {payout.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-slate-900">{payout.userName || "Unknown User"}</h4>
                        <p className="text-slate-500">{payout.userEmail || ""}</p>
                    </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                    <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-semibold">Requested Amount</span>
                    <span className="text-3xl font-black text-slate-900">${payout.amount.toLocaleString()}</span>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Payment Method</span>
                        <span className="text-slate-900 font-semibold">{payout.paymentMethod || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                        <span className="text-slate-500 font-medium">Requested At</span>
                        <span className="text-slate-900 font-semibold">
                            {new Date(payout.requestedAt).toLocaleString()}
                        </span>
                    </div>
                    {payout.notes && (
                        <div>
                            <span className="text-slate-500 font-medium block mb-1">Notes</span>
                            <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-50 text-sm">{payout.notes}</p>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <MotionButton
                        className="flex-1 py-3 rounded-xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                        onClick={() => handleProcess(payout._id, "reject")}
                    >
                        <XCircle size={18} />
                        Reject
                    </MotionButton>
                    <MotionButton
                        className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-shadow shadow-md hover:shadow-emerald-200/50 flex items-center justify-center gap-2"
                        onClick={() => handleProcess(payout._id, "pay")}
                    >
                        <CheckCircle2 size={18} />
                        Approve & Pay
                    </MotionButton>
                </div>
            </div>
        </Modal>
    );
}
