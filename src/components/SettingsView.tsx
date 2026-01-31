import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Modal } from "./ui/modal";
import { MotionCard, MotionButton, StaggerContainer, StaggerItem } from "./ui/motion";
import {
    Settings as SettingsIcon,
    Users,
    Globe,
    Moon,
    Sun,
    Edit2,
    Trash2,
    Shield,
    UserCheck,
    UserX,
    Search,
    ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { RoleAccessManagement } from "./RoleAccessManagement";
import { RoleManagement } from "./RoleManagement";

// Role options for dropdown
const ROLES = [
    { value: "admin", label: "Administrator", labelAr: "مدير النظام" },
    { value: "acting_manager", label: "Acting Manager", labelAr: "المدير الفعلي" },
    { value: "lead", label: "Lead Engineer", labelAr: "مهندس مشرف" },
    { value: "engineer", label: "Site Engineer", labelAr: "مهندس موقع" },
    { value: "finance", label: "Finance Officer", labelAr: "مسؤول مالي" },
    { value: "stock", label: "Stock Manager", labelAr: "مدير المخزون" },
];

export function SettingsView() {
    const { t, language, setLanguage } = useLanguage();
    const { theme, setTheme, isDark } = useTheme();
    const [activeSection, setActiveSection] = useState<"general" | "users" | "access">("general");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    // Data
    const users = useQuery(api.users.getUsers) || [];

    // Mutations
    const updateUserRole = useMutation(api.users.updateUserRole);
    const updateUserStatus = useMutation(api.users.updateUserStatus);
    const deleteUser = useMutation(api.users.deleteUser);

    // Filter users - exclude auth-created duplicate entries (those without role)
    const filteredUsers = users
        .filter((u: any) => u.role) // Only show users with roles
        .filter((u: any) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            await updateUserRole({ userId: userId as any, role: newRole });
            toast.success(language === 'ar' ? "تم تحديث الدور بنجاح" : "Role updated successfully");
            setEditingUser(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to update role");
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        try {
            await updateUserStatus({ userId: userId as any, status: newStatus });
            toast.success(
                newStatus === "active"
                    ? (language === 'ar' ? "تم تفعيل المستخدم" : "User activated")
                    : (language === 'ar' ? "تم إلغاء تفعيل المستخدم" : "User deactivated")
            );
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await deleteUser({ userId: userId as any });
            toast.success(language === 'ar' ? "تم حذف المستخدم" : "User deleted successfully");
            setShowDeleteConfirm(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete user");
        }
    };

    const getRoleLabel = (role: string) => {
        const roleObj = ROLES.find(r => r.value === role);
        return language === 'ar' ? roleObj?.labelAr : roleObj?.label;
    };

    return (
        <div>
            {/* Section Tabs */}
            <div style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                borderBottom: "1px solid var(--border)",
                paddingBottom: "1rem"
            }}>
                <MotionButton
                    className={activeSection === "general" ? "btn-primary" : "btn-ghost"}
                    onClick={() => setActiveSection("general")}
                >
                    <SettingsIcon size={18} />
                    {t("generalSettings")}
                </MotionButton>
                <MotionButton
                    className={activeSection === "users" ? "btn-primary" : "btn-ghost"}
                    onClick={() => setActiveSection("users")}
                >
                    <Users size={18} />
                    {t("userManagement")}
                </MotionButton>
                <MotionButton
                    className={activeSection === "access" ? "btn-primary" : "btn-ghost"}
                    onClick={() => setActiveSection("access")}
                >
                    <Shield size={18} />
                    {language === 'ar' ? 'صلاحيات الأدوار' : 'Role Access'}
                </MotionButton>
            </div>

            {/* General Settings */}
            {activeSection === "general" && (
                <StaggerContainer>
                    <StaggerItem>
                        <MotionCard className="dashboard-card">
                            <div className="card-header">
                                <div className="card-header__title">
                                    <Globe size={20} />
                                    <h3>{t("language")}</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <MotionButton
                                        className={language === "en" ? "btn-primary" : "btn-ghost"}
                                        onClick={() => setLanguage("en")}
                                        style={{ flex: 1 }}
                                    >
                                        🇬🇧 {t("english")}
                                    </MotionButton>
                                    <MotionButton
                                        className={language === "ar" ? "btn-primary" : "btn-ghost"}
                                        onClick={() => setLanguage("ar")}
                                        style={{ flex: 1 }}
                                    >
                                        🇮🇶 {t("arabic")}
                                    </MotionButton>
                                </div>
                            </div>
                        </MotionCard>
                    </StaggerItem>

                    <StaggerItem>
                        <MotionCard className="dashboard-card" style={{ marginTop: "1.5rem" }}>
                            <div className="card-header">
                                <div className="card-header__title">
                                    <Sun size={20} />
                                    <h3>{t("theme")}</h3>
                                </div>
                            </div>
                            <div className="card-body">
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <MotionButton 
                                        className="btn-primary" 
                                        style={{ flex: 1 }}
                                    >
                                        <Sun size={18} /> {t("lightMode")}
                                    </MotionButton>
                                    <MotionButton 
                                        className="btn-ghost" 
                                        style={{ flex: 1, opacity: 0.5, cursor: "not-allowed" }}
                                        disabled
                                    >
                                        <Moon size={18} /> {t("darkMode")}
                                    </MotionButton>
                                </div>
                                <p style={{
                                    marginTop: "0.75rem",
                                    fontSize: "0.875rem",
                                    color: "var(--text-secondary)"
                                }}>
                                    {language === 'ar'
                                        ? "المظهر الداكن سيتوفر قريباً"
                                        : "Dark mode coming soon"}
                                </p>
                            </div>
                        </MotionCard>
                    </StaggerItem>
                </StaggerContainer>
            )}

            {/* User Management */}
            {activeSection === "users" && (
                <div>
                    {/* Stats */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <StaggerContainer className="stats-grid">
                            <StaggerItem>
                                <MotionCard className="stat-card stat-card--primary">
                                    <div className="stat-card__icon">
                                        <Users size={24} />
                                    </div>
                                    <div className="stat-card__content">
                                        <span className="stat-card__value">{filteredUsers.length}</span>
                                        <span className="stat-card__label">{t("total")} {t("users")}</span>
                                    </div>
                                </MotionCard>
                            </StaggerItem>
                            <StaggerItem>
                                <MotionCard className="stat-card stat-card--success">
                                    <div className="stat-card__icon">
                                        <UserCheck size={24} />
                                    </div>
                                    <div className="stat-card__content">
                                        <span className="stat-card__value">
                                            {filteredUsers.filter((u: any) => u.status === "active").length}
                                        </span>
                                        <span className="stat-card__label">{t("activeUsers")}</span>
                                    </div>
                                </MotionCard>
                            </StaggerItem>
                            <StaggerItem>
                                <MotionCard className="stat-card stat-card--warning">
                                    <div className="stat-card__icon">
                                        <UserX size={24} />
                                    </div>
                                    <div className="stat-card__content">
                                        <span className="stat-card__value">
                                            {filteredUsers.filter((u: any) => u.status !== "active").length}
                                        </span>
                                        <span className="stat-card__label">{t("inactiveUsers")}</span>
                                    </div>
                                </MotionCard>
                            </StaggerItem>
                        </StaggerContainer>
                    </div>

                    {/* Users Table */}
                    <MotionCard className="dashboard-card">
                        <div className="card-header">
                            <div className="card-header__title">
                                <Shield size={20} />
                                <h3>{t("users")}</h3>
                            </div>
                            <div className="card-header__actions">
                                <div className="search-input-wrapper">
                                    <Search size={16} />
                                    <input
                                        type="text"
                                        placeholder={t("search") + "..."}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="search-input"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>{t("name")}</th>
                                            <th>{t("email")}</th>
                                            <th>{t("role")}</th>
                                            <th>{t("status")}</th>
                                            <th>{t("actions")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user: any) => (
                                            <motion.tr
                                                key={user._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <td style={{ fontWeight: 600 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                                        <div style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: "10px",
                                                            background: "var(--bg-mint)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            color: "var(--brand-primary)",
                                                            fontWeight: 700,
                                                            fontSize: "0.875rem"
                                                        }}>
                                                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                                                        </div>
                                                        {user.name || "-"}
                                                    </div>
                                                </td>
                                                <td style={{ color: "var(--text-secondary)" }}>
                                                    {user.email}
                                                </td>
                                                <td>
                                                    <span className="badge badge--info">
                                                        {getRoleLabel(user.role) || user.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.status === "active"
                                                        ? "badge--success"
                                                        : "badge--warning"
                                                        }`}>
                                                        {user.status === "active" ? t("active") : t("inactive")}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon"
                                                            onClick={() => setEditingUser(user)}
                                                            title={t("edit") as string}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className={`btn-icon ${user.status === "active" ? "btn-icon--warning" : "btn-icon--success"}`}
                                                            onClick={() => handleToggleStatus(user._id, user.status)}
                                                            title={user.status === "active" ? t("deactivateUser") as string : t("activateUser") as string}
                                                        >
                                                            {user.status === "active" ? <UserX size={16} /> : <UserCheck size={16} />}
                                                        </button>
                                                        <button
                                                            className="btn-icon btn-icon--danger"
                                                            onClick={() => setShowDeleteConfirm(user._id)}
                                                            title={t("delete") as string}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </MotionCard>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <EditUserModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={handleUpdateRole}
                    language={language}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <Modal
                    isOpen={true}
                    onClose={() => setShowDeleteConfirm(null)}
                    title={t("confirmDelete") as string}
                    maxWidth="sm"
                >
                    <p style={{ marginBottom: "1.5rem", color: "var(--text-secondary)" }}>
                        {language === 'ar'
                            ? "هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المستخدم نهائياً."
                            : "This action cannot be undone. The user will be permanently deleted."}
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <MotionButton
                            className="btn-ghost"
                            onClick={() => setShowDeleteConfirm(null)}
                        >
                            {t("cancel")}
                        </MotionButton>
                        <MotionButton
                            className="btn-danger"
                            onClick={() => handleDeleteUser(showDeleteConfirm)}
                        >
                            {t("delete")}
                        </MotionButton>
                    </div>
                </Modal>
            )}

            {/* Role Access Management */}
            {activeSection === "access" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    {/* Role Management - Create, Edit, Delete, Assign */}
                    <RoleManagement />

                    {/* Permission Matrix */}
                    <RoleAccessManagement />
                </div>
            )}
        </div>
    );
}

// Edit User Modal
function EditUserModal({
    user,
    onClose,
    onSave,
    language
}: {
    user: any;
    onClose: () => void;
    onSave: (userId: string, role: string) => void;
    language: string;
}) {
    const { t } = useLanguage();
    const [selectedRole, setSelectedRole] = useState(user.role);

    return (
        <Modal isOpen={true} onClose={onClose} title={t("editUser") as string}>
            <div style={{ marginBottom: "1.5rem" }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    padding: "1rem",
                    background: "var(--bg-secondary)",
                    borderRadius: "0.75rem",
                    marginBottom: "1.5rem"
                }}>
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        background: "var(--bg-mint)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--brand-primary)",
                        fontWeight: 700,
                        fontSize: "1.25rem"
                    }}>
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                            {user.email}
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="label">{t("changeRole")}</label>
                    <select
                        className="input"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        {ROLES.map(role => (
                            <option key={role.value} value={role.value}>
                                {language === 'ar' ? role.labelAr : role.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="modal-actions">
                <MotionButton className="btn-ghost" onClick={onClose}>
                    {t("cancel")}
                </MotionButton>
                <MotionButton
                    className="btn-primary"
                    onClick={() => onSave(user._id, selectedRole)}
                >
                    {t("save")}
                </MotionButton>
            </div>
        </Modal>
    );
}
