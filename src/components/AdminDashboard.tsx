import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Users,
    Shield,
    Building2,
    Banknote,
    Package,
    Settings,
    TrendingUp,
    UserCog,
    BarChart3,
    Activity
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
    StaggerContainer,
    StaggerItem
} from "./ui/motion";

// Role configuration
const ROLES = [
    { id: "admin", label: "Admin", color: "#DC2626", bg: "#FEF2F2" },
    { id: "acting_manager", label: "Acting Manager", color: "#7C3AED", bg: "#F5F3FF" },
    { id: "engineering_lead", label: "Engineering Lead", color: "#059669", bg: "#ECFDF5" },
    { id: "engineer", label: "Engineer", color: "#3B82F6", bg: "#EFF6FF" },
    { id: "finance_manager", label: "Finance Manager", color: "#F59E0B", bg: "#FFFBEB" },
    { id: "stock_manager", label: "Stock Manager", color: "#8B5CF6", bg: "#F5F3FF" },
] as const;

export function AdminDashboard() {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);

    const users = useQuery(api.roles.getAllUsers) || [];
    const stats = useQuery(api.tasks.getStats);
    const stockStats = useQuery(api.stock.getStockStats);

    const assignRole = useMutation(api.roles.assignRole);

    const handleAssignRole = async (userId: string, role: string) => {
        try {
            await assignRole({ targetUserId: userId, role: role as any });
            toast.success("Role assigned successfully");
            setShowRoleModal(false);
            setSelectedUser(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to assign role");
        }
    };

    const adminMenuItems = [
        { id: "dashboard", label: "Dashboard", icon: BarChart3 },
        { id: "users", label: "User Management", icon: Users },
        { id: "projects", label: "Projects", icon: Building2 },
        { id: "finance", label: "Finance", icon: Banknote },
        { id: "stock", label: "Stock", icon: Package },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="layout-container" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                menuItems={adminMenuItems}
            />

            <main className="main-content">
                <TopBar
                    breadcrumb="Admin Panel"
                    onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                    userName="Administrator"
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
                                {/* Stats Grid */}
                                <div className="bento-grid" style={{ padding: 0, marginBottom: "1.5rem" }}>
                                    <MotionCard delay={0.1}>
                                        <div className="stat-card">
                                            <div className="stat-icon emerald">
                                                <Users size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={users.length} />
                                            </div>
                                            <div className="stat-label">Total Users</div>
                                        </div>
                                    </MotionCard>

                                    <MotionCard delay={0.15}>
                                        <div className="stat-card">
                                            <div className="stat-icon blue">
                                                <Building2 size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={stats?.totalProjects || 0} />
                                            </div>
                                            <div className="stat-label">Active Projects</div>
                                        </div>
                                    </MotionCard>

                                    <MotionCard delay={0.2}>
                                        <div className="stat-card">
                                            <div className="stat-icon orange">
                                                <Activity size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={stats?.totalTasks || 0} />
                                            </div>
                                            <div className="stat-label">Total Tasks</div>
                                        </div>
                                    </MotionCard>

                                    <MotionCard delay={0.25}>
                                        <div className="stat-card">
                                            <div className="stat-icon" style={{ background: "#F5F3FF", color: "#8B5CF6" }}>
                                                <Package size={20} />
                                            </div>
                                            <div className="stat-value">
                                                <AnimatedCounter value={stockStats?.totalMaterials || 0} />
                                            </div>
                                            <div className="stat-label">Materials</div>
                                        </div>
                                    </MotionCard>
                                </div>

                                {/* Role Distribution */}
                                <MotionCard delay={0.3}>
                                    <div className="card-header">
                                        <h3 className="card-title">Role Distribution</h3>
                                    </div>
                                    <div className="card-body">
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                                            {ROLES.map((role) => {
                                                const count = users.filter((u: any) => u.role === role.id).length;
                                                return (
                                                    <motion.div
                                                        key={role.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        style={{
                                                            padding: "1rem",
                                                            background: role.bg,
                                                            borderRadius: "1rem",
                                                            border: `1px solid ${role.color}20`
                                                        }}
                                                    >
                                                        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: role.color }}>
                                                            {count}
                                                        </div>
                                                        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                                                            {role.label}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </MotionCard>
                            </motion.div>
                        )}

                        {activeTab === "users" && (
                            <motion.div
                                key="users"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <MotionCard>
                                    <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h3 className="card-title">User Management</h3>
                                    </div>
                                    <div style={{ overflowX: "auto" }}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Email</th>
                                                    <th>Current Role</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user: any, index: number) => {
                                                    const roleConfig = ROLES.find(r => r.id === user.role) || ROLES[3];
                                                    return (
                                                        <motion.tr
                                                            key={user._id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.1 + index * 0.03 }}
                                                        >
                                                            <td>
                                                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                                    <div style={{
                                                                        width: 36,
                                                                        height: 36,
                                                                        borderRadius: "10px",
                                                                        background: roleConfig.bg,
                                                                        color: roleConfig.color,
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        fontWeight: 700,
                                                                        fontSize: "0.875rem"
                                                                    }}>
                                                                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                                                                    </div>
                                                                    <span style={{ fontWeight: 600 }}>{user.name}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                                                            <td>
                                                                <span 
                                                                    className="badge"
                                                                    style={{ 
                                                                        background: roleConfig.bg, 
                                                                        color: roleConfig.color,
                                                                        border: `1px solid ${roleConfig.color}30`
                                                                    }}
                                                                >
                                                                    {roleConfig.label}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <MotionButton
                                                                    className="btn-secondary"
                                                                    onClick={() => {
                                                                        setSelectedUser(user);
                                                                        setShowRoleModal(true);
                                                                    }}
                                                                    style={{ padding: "0.5rem 1rem", fontSize: "0.8rem" }}
                                                                >
                                                                    <UserCog size={14} /> Change Role
                                                                </MotionButton>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </MotionCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Role Assignment Modal */}
            <Modal
                isOpen={showRoleModal}
                onClose={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                }}
                title="Assign Role"
                subtitle={selectedUser ? `Changing role for ${selectedUser.name}` : ""}
                size="sm"
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {ROLES.map((role) => (
                        <motion.button
                            key={role.id}
                            onClick={() => handleAssignRole(selectedUser?.userId, role.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                background: selectedUser?.role === role.id ? role.bg : "var(--bg-primary)",
                                border: `2px solid ${selectedUser?.role === role.id ? role.color : "var(--border)"}`,
                                borderRadius: "1rem",
                                cursor: "pointer",
                                textAlign: "left"
                            }}
                            whileHover={{
                                background: role.bg,
                                borderColor: role.color
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div style={{
                                width: 40,
                                height: 40,
                                borderRadius: "10px",
                                background: role.bg,
                                color: role.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <Shield size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{role.label}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                    {getRoleDescription(role.id)}
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </Modal>
        </div>
    );
}

function getRoleDescription(roleId: string): string {
    const descriptions: Record<string, string> = {
        admin: "Full system access and control",
        acting_manager: "Project and team management",
        engineering_lead: "Lead engineering tasks and reviews",
        engineer: "Execute tasks and submit work",
        finance_manager: "Manage finances and payouts",
        stock_manager: "Manage inventory and materials",
    };
    return descriptions[roleId] || "";
}

// Admin-specific Sidebar
function AdminSidebar({ activeTab, onTabChange, isOpen, onClose, menuItems }: {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen: boolean;
    onClose: () => void;
    menuItems: { id: string; label: string; icon: any }[];
}) {
    const { signOut } = require("@convex-dev/auth/react").useAuthActions();
    const { t } = useLanguage();
    const isMobile = require("../hooks/use-mobile").useIsMobile();

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
                    background: "linear-gradient(180deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)"
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
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>Bunyan</h1>
                        <span style={{ fontSize: "0.75rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Admin Panel
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
                                color: activeTab === item.id ? "#DC2626" : "rgba(255,255,255,0.8)",
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
