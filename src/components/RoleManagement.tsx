import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Shield,
    Plus,
    Edit2,
    Trash2,
    Save,
    X,
    Check,
    Users,
    Palette,
    Tag,
    Lock,
    UserPlus,
    ChevronDown,
    ChevronUp,
    AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MotionCard, MotionButton, StaggerContainer, StaggerItem } from "./ui/motion";
import { Modal } from "./ui/modal";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

// Available modules for permissions
const ALL_MODULES = [
    { id: "dashboard", label: { en: "Dashboard", ar: "لوحة التحكم" } },
    { id: "management", label: { en: "Management", ar: "الإدارة" } },
    { id: "projects", label: { en: "Projects", ar: "المشاريع" } },
    { id: "finance", label: { en: "Finance", ar: "المالية" } },
    { id: "team", label: { en: "Team", ar: "الفريق" } },
    { id: "stock", label: { en: "Stock", ar: "المخزون" } },
    { id: "settings", label: { en: "Settings", ar: "الإعدادات" } },
];

// Color options for roles
const COLOR_OPTIONS = [
    "#DC2626", "#F59E0B", "#059669", "#3B82F6", "#8B5CF6",
    "#EC4899", "#6366F1", "#14B8A6", "#84CC16", "#6B7280"
];

export function RoleManagement() {
    const { language } = useLanguage();
    const [isCreating, setIsCreating] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [showUserAssign, setShowUserAssign] = useState<any>(null);

    // Queries
    const customRoles = useQuery(api.users.getCustomRoles) || [];
    const users = useQuery(api.users.getUsers) || [];

    // Mutations
    const createRole = useMutation(api.users.createCustomRole);
    const updateRole = useMutation(api.users.updateCustomRole);
    const deleteRole = useMutation(api.users.deleteCustomRole);
    const assignUserRoles = useMutation(api.users.assignUserRoles);
    const seedRoles = useMutation(api.users.seedSystemRoles);

    // New role form state
    const [newRole, setNewRole] = useState({
        name: "",
        displayName: "",
        displayNameAr: "",
        permissions: ["dashboard"],
        color: "#6B7280"
    });

    const handleCreateRole = async () => {
        if (!newRole.name || !newRole.displayName) {
            toast.error(language === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields');
            return;
        }

        try {
            await createRole({
                name: newRole.name,
                displayName: newRole.displayName,
                displayNameAr: newRole.displayNameAr,
                permissions: newRole.permissions,
                color: newRole.color,
            });
            toast.success(language === 'ar' ? 'تم إنشاء الدور بنجاح' : 'Role created successfully');
            setIsCreating(false);
            setNewRole({ name: "", displayName: "", displayNameAr: "", permissions: ["dashboard"], color: "#6B7280" });
        } catch (error: any) {
            toast.error(error.message || 'Failed to create role');
        }
    };

    const handleUpdateRole = async () => {
        if (!editingRole) return;

        try {
            await updateRole({
                roleId: editingRole._id,
                displayName: editingRole.displayName,
                displayNameAr: editingRole.displayNameAr,
                permissions: editingRole.permissions,
                color: editingRole.color,
            });
            toast.success(language === 'ar' ? 'تم تحديث الدور بنجاح' : 'Role updated successfully');
            setEditingRole(null);
        } catch (error: any) {
            toast.error(error.message || 'Failed to update role');
        }
    };

    const handleDeleteRole = async (roleId: any) => {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الدور?' : 'Are you sure you want to delete this role?')) {
            return;
        }

        try {
            await deleteRole({ roleId });
            toast.success(language === 'ar' ? 'تم حذف الدور' : 'Role deleted');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete role');
        }
    };

    const handleSeedRoles = async () => {
        try {
            const result = await seedRoles({});
            toast.success(`Created ${result.created} system roles`);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const togglePermission = (permId: string, isEdit: boolean) => {
        if (isEdit && editingRole) {
            const perms = editingRole.permissions || [];
            if (perms.includes(permId)) {
                // Don't allow removing dashboard
                if (permId === "dashboard") return;
                setEditingRole({ ...editingRole, permissions: perms.filter((p: string) => p !== permId) });
            } else {
                setEditingRole({ ...editingRole, permissions: [...perms, permId] });
            }
        } else {
            const perms = newRole.permissions;
            if (perms.includes(permId)) {
                if (permId === "dashboard") return;
                setNewRole({ ...newRole, permissions: perms.filter(p => p !== permId) });
            } else {
                setNewRole({ ...newRole, permissions: [...perms, permId] });
            }
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {language === 'ar' ? 'إدارة الأدوار' : 'Role Management'}
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        {language === 'ar' ? 'إنشاء وتعديل الأدوار وتعيين الصلاحيات' : 'Create, edit roles and assign permissions'}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {customRoles.length === 0 && (
                        <MotionButton className="btn-ghost" onClick={handleSeedRoles}>
                            <Shield size={16} />
                            {language === 'ar' ? 'تهيئة الأدوار الافتراضية' : 'Initialize System Roles'}
                        </MotionButton>
                    )}
                    <MotionButton className="btn-primary" onClick={() => setIsCreating(true)}>
                        <Plus size={16} />
                        {language === 'ar' ? 'دور جديد' : 'New Role'}
                    </MotionButton>
                </div>
            </div>

            {/* Roles Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customRoles.map((role: any, index: number) => (
                    <StaggerItem key={role._id}>
                        <MotionCard delay={index * 0.05}>
                            <div style={{ padding: "1.25rem" }}>
                                {/* Role Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: "0.75rem",
                                            background: role.color || "#6B7280",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white"
                                        }}>
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                                                {language === 'ar' && role.displayNameAr ? role.displayNameAr : role.displayName}
                                            </p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                {role.name}
                                            </p>
                                        </div>
                                    </div>
                                    {role.isSystem && (
                                        <span title="System role">
                                            <Lock size={14} color="var(--text-muted)" />
                                        </span>
                                    )}
                                </div>

                                {/* Permissions */}
                                <div style={{ marginBottom: "1rem" }}>
                                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                        {language === 'ar' ? 'الصلاحيات:' : 'Permissions:'}
                                    </p>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                                        {(role.permissions || []).map((perm: string) => (
                                            <span key={perm} style={{
                                                fontSize: "0.65rem",
                                                padding: "0.2rem 0.5rem",
                                                background: "var(--bg-secondary)",
                                                borderRadius: "0.25rem",
                                                color: "var(--text-secondary)"
                                            }}>
                                                {ALL_MODULES.find(m => m.id === perm)?.label[language === 'ar' ? 'ar' : 'en'] || perm}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* User count with this role */}
                                <div style={{
                                    fontSize: "0.75rem",
                                    color: "var(--text-muted)",
                                    marginBottom: "1rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem"
                                }}>
                                    <Users size={12} />
                                    {users.filter((u: any) => u.roles?.includes(role.name) || u.role === role.name).length} {language === 'ar' ? 'مستخدم' : 'users'}
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <MotionButton
                                        className="btn-ghost btn-sm"
                                        style={{ flex: 1 }}
                                        onClick={() => setShowUserAssign(role)}
                                    >
                                        <UserPlus size={14} />
                                        {language === 'ar' ? 'تعيين' : 'Assign'}
                                    </MotionButton>
                                    {!role.isSystem && (
                                        <>
                                            <MotionButton
                                                className="btn-ghost btn-sm"
                                                onClick={() => setEditingRole({ ...role })}
                                            >
                                                <Edit2 size={14} />
                                            </MotionButton>
                                            <MotionButton
                                                className="btn-ghost btn-sm"
                                                onClick={() => handleDeleteRole(role._id)}
                                                style={{ color: "#DC2626" }}
                                            >
                                                <Trash2 size={14} />
                                            </MotionButton>
                                        </>
                                    )}
                                </div>
                            </div>
                        </MotionCard>
                    </StaggerItem>
                ))}
            </StaggerContainer>

            {customRoles.length === 0 && (
                <MotionCard>
                    <div style={{ padding: "3rem", textAlign: "center" }}>
                        <Shield size={48} color="var(--text-muted)" style={{ marginBottom: "1rem", opacity: 0.5 }} />
                        <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>
                            {language === 'ar' ? 'لا توجد أدوار. قم بتهيئة الأدوار الافتراضية أو أنشئ دوراً جديداً.' : 'No roles found. Initialize system roles or create a new one.'}
                        </p>
                        <MotionButton className="btn-primary" onClick={handleSeedRoles}>
                            <Shield size={16} />
                            {language === 'ar' ? 'تهيئة الأدوار الافتراضية' : 'Initialize System Roles'}
                        </MotionButton>
                    </div>
                </MotionCard>
            )}

            {/* Create Role Modal */}
            {isCreating && (
                <Modal
                    isOpen={true}
                    onClose={() => setIsCreating(false)}
                    title={language === 'ar' ? 'إنشاء دور جديد' : 'Create New Role'}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'معرف الدور *' : 'Role ID *'}
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., site_supervisor"
                                value={newRole.name}
                                onChange={(e) => setNewRole({ ...newRole, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'اسم العرض *' : 'Display Name *'}
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Site Supervisor"
                                value={newRole.displayName}
                                onChange={(e) => setNewRole({ ...newRole, displayName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                            </label>
                            <input
                                type="text"
                                className="input"
                                placeholder="مشرف الموقع"
                                value={newRole.displayNameAr}
                                onChange={(e) => setNewRole({ ...newRole, displayNameAr: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'اللون' : 'Color'}
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {COLOR_OPTIONS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setNewRole({ ...newRole, color })}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "0.5rem",
                                            background: color,
                                            border: newRole.color === color ? "3px solid var(--text-primary)" : "2px solid transparent",
                                            cursor: "pointer"
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
                            </label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {ALL_MODULES.map(module => (
                                    <button
                                        key={module.id}
                                        onClick={() => togglePermission(module.id, false)}
                                        disabled={module.id === "dashboard"}
                                        style={{
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "0.5rem",
                                            border: "1px solid var(--border)",
                                            background: newRole.permissions.includes(module.id) ? "#ECFDF5" : "var(--bg-secondary)",
                                            color: newRole.permissions.includes(module.id) ? "#059669" : "var(--text-secondary)",
                                            cursor: module.id === "dashboard" ? "not-allowed" : "pointer",
                                            fontSize: "0.875rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem"
                                        }}
                                    >
                                        {newRole.permissions.includes(module.id) && <Check size={14} />}
                                        {language === 'ar' ? module.label.ar : module.label.en}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                            <MotionButton className="btn-ghost" onClick={() => setIsCreating(false)}>
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </MotionButton>
                            <MotionButton className="btn-primary" onClick={handleCreateRole}>
                                <Plus size={16} />
                                {language === 'ar' ? 'إنشاء الدور' : 'Create Role'}
                            </MotionButton>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Role Modal */}
            {editingRole && (
                <Modal
                    isOpen={true}
                    onClose={() => setEditingRole(null)}
                    title={language === 'ar' ? 'تعديل الدور' : 'Edit Role'}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'اسم العرض' : 'Display Name'}
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={editingRole.displayName}
                                onChange={(e) => setEditingRole({ ...editingRole, displayName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'}
                            </label>
                            <input
                                type="text"
                                className="input"
                                value={editingRole.displayNameAr || ""}
                                onChange={(e) => setEditingRole({ ...editingRole, displayNameAr: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'اللون' : 'Color'}
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {COLOR_OPTIONS.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setEditingRole({ ...editingRole, color })}
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "0.5rem",
                                            background: color,
                                            border: editingRole.color === color ? "3px solid var(--text-primary)" : "2px solid transparent",
                                            cursor: "pointer"
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>
                                {language === 'ar' ? 'الصلاحيات' : 'Permissions'}
                            </label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {ALL_MODULES.map(module => (
                                    <button
                                        key={module.id}
                                        onClick={() => togglePermission(module.id, true)}
                                        disabled={module.id === "dashboard"}
                                        style={{
                                            padding: "0.5rem 0.75rem",
                                            borderRadius: "0.5rem",
                                            border: "1px solid var(--border)",
                                            background: editingRole.permissions?.includes(module.id) ? "#ECFDF5" : "var(--bg-secondary)",
                                            color: editingRole.permissions?.includes(module.id) ? "#059669" : "var(--text-secondary)",
                                            cursor: module.id === "dashboard" ? "not-allowed" : "pointer",
                                            fontSize: "0.875rem",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.25rem"
                                        }}
                                    >
                                        {editingRole.permissions?.includes(module.id) && <Check size={14} />}
                                        {language === 'ar' ? module.label.ar : module.label.en}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                            <MotionButton className="btn-ghost" onClick={() => setEditingRole(null)}>
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </MotionButton>
                            <MotionButton className="btn-primary" onClick={handleUpdateRole}>
                                <Save size={16} />
                                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                            </MotionButton>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Assign Users Modal */}
            {showUserAssign && (
                <UserRoleAssignmentModal
                    role={showUserAssign}
                    users={users}
                    allRoles={customRoles}
                    onClose={() => setShowUserAssign(null)}
                    assignUserRoles={assignUserRoles}
                    language={language}
                />
            )}
        </div>
    );
}

// User Role Assignment Modal
function UserRoleAssignmentModal({
    role,
    users,
    allRoles,
    onClose,
    assignUserRoles,
    language
}: {
    role: any;
    users: any[];
    allRoles: any[];
    onClose: () => void;
    assignUserRoles: any;
    language: string;
}) {
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [userRolesMap, setUserRolesMap] = useState<Record<string, string[]>>({});

    // Initialize user roles
    useState(() => {
        const map: Record<string, string[]> = {};
        users.forEach((u: any) => {
            map[u._id] = u.roles || (u.role ? [u.role] : []);
        });
        setUserRolesMap(map);
    });

    const toggleUserRole = (userId: string, roleName: string) => {
        setUserRolesMap(prev => {
            const currentRoles = prev[userId] || [];
            if (currentRoles.includes(roleName)) {
                return { ...prev, [userId]: currentRoles.filter(r => r !== roleName) };
            } else {
                return { ...prev, [userId]: [...currentRoles, roleName] };
            }
        });
    };

    const handleSaveUserRoles = async (userId: string) => {
        try {
            await assignUserRoles({
                userId: userId as any,
                roles: userRolesMap[userId] || []
            });
            toast.success(language === 'ar' ? 'تم تحديث أدوار المستخدم' : 'User roles updated');
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const filteredUsers = users.filter((u: any) => u.role); // Only show users with roles

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={`${language === 'ar' ? 'تعيين الأدوار' : 'Assign Roles'}`}
        >
            <div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                    {language === 'ar'
                        ? 'اضغط على المستخدم لتعيين أدوار متعددة'
                        : 'Click on a user to assign multiple roles'}
                </p>

                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {filteredUsers.map((user: any) => {
                        const isExpanded = expandedUser === user._id;
                        const currentRoles = userRolesMap[user._id] || user.roles || (user.role ? [user.role] : []);

                        return (
                            <div key={user._id} style={{ borderBottom: "1px solid var(--border)" }}>
                                {/* User Header */}
                                <div
                                    onClick={() => setExpandedUser(isExpanded ? null : user._id)}
                                    style={{
                                        padding: "0.75rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        background: isExpanded ? "var(--bg-secondary)" : "transparent"
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            color: "white",
                                            fontWeight: 600,
                                            fontSize: "0.875rem"
                                        }}>
                                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 500, color: "var(--text-primary)" }}>{user.name || user.email}</p>
                                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                {currentRoles.length > 0 ? currentRoles.join(", ") : "No roles"}
                                            </p>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>

                                {/* Expanded Role Selection */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: "hidden" }}
                                        >
                                            <div style={{ padding: "1rem", background: "var(--bg-secondary)" }}>
                                                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                                                    {language === 'ar' ? 'اختر الأدوار:' : 'Select roles:'}
                                                </p>
                                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                                                    {allRoles.map((r: any) => {
                                                        const isSelected = (userRolesMap[user._id] || currentRoles).includes(r.name);
                                                        return (
                                                            <button
                                                                key={r._id}
                                                                onClick={() => toggleUserRole(user._id, r.name)}
                                                                style={{
                                                                    padding: "0.5rem 0.75rem",
                                                                    borderRadius: "0.5rem",
                                                                    border: `2px solid ${isSelected ? r.color : "var(--border)"}`,
                                                                    background: isSelected ? `${r.color}20` : "var(--bg-card)",
                                                                    color: isSelected ? r.color : "var(--text-secondary)",
                                                                    cursor: "pointer",
                                                                    fontSize: "0.875rem",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: "0.25rem"
                                                                }}
                                                            >
                                                                {isSelected && <Check size={14} />}
                                                                {language === 'ar' && r.displayNameAr ? r.displayNameAr : r.displayName}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <MotionButton
                                                    className="btn-primary btn-sm"
                                                    onClick={() => handleSaveUserRoles(user._id)}
                                                >
                                                    <Save size={14} />
                                                    {language === 'ar' ? 'حفظ' : 'Save'}
                                                </MotionButton>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}
