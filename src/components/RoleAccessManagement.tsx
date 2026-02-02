import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
    Shield,
    Check,
    X,
    Edit2,
    Save,
    RotateCcw,
    Users,
    Building2,
    Banknote,
    Package,
    Settings,
    LayoutDashboard,
    Lock,
    Unlock
} from "lucide-react";
import { motion } from "framer-motion";
import { MotionCard, MotionButton } from "./ui/motion";
import { useLanguage } from "../contexts/LanguageContext";
import { toast } from "sonner";

// Define available modules/permissions
const ALL_MODULES = [
    { id: "dashboard", icon: LayoutDashboard, label: { en: "Dashboard", ar: "لوحة التحكم" } },
    { id: "projects", icon: Building2, label: { en: "Projects", ar: "المشاريع" } },
    { id: "finance", icon: Banknote, label: { en: "Finance", ar: "المالية" } },
    { id: "team", icon: Users, label: { en: "Team", ar: "الفريق" } },
    { id: "stock", icon: Package, label: { en: "Stock", ar: "المخزون" } },
    { id: "settings", icon: Settings, label: { en: "Settings", ar: "الإعدادات" } },
];

// Define all roles
const ALL_ROLES = [
    { id: "admin", label: { en: "Admin", ar: "مدير النظام" }, color: "#DC2626" },
    { id: "acting_manager", label: { en: "Acting Manager", ar: "مدير بالإنابة" }, color: "#8B5CF6" },
    { id: "lead", label: { en: "Lead", ar: "قائد الفريق" }, color: "#3B82F6" },
    { id: "engineer", label: { en: "Engineer", ar: "مهندس" }, color: "#059669" },
    { id: "finance", label: { en: "Finance", ar: "مالية" }, color: "#F59E0B" },
    { id: "stock", label: { en: "Stock", ar: "مخزون" }, color: "#6B7280" },
    { id: "guest", label: { en: "Guest", ar: "زائر" }, color: "#9CA3AF" },
];

// Default permissions - can be customized
const DEFAULT_PERMISSIONS: Record<string, string[]> = {
    admin: ["dashboard", "projects", "finance", "team", "stock", "settings"],
    acting_manager: ["dashboard", "projects", "finance", "team"],
    lead: ["dashboard", "projects", "finance", "team"],
    engineer: ["dashboard", "projects"],
    finance: ["dashboard", "finance"],
    stock: ["dashboard", "stock"],
    guest: ["dashboard"],
};

export function RoleAccessManagement() {
    const { language } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [permissions, setPermissions] = useState<Record<string, string[]>>(DEFAULT_PERMISSIONS);
    const [originalPermissions, setOriginalPermissions] = useState<Record<string, string[]>>(DEFAULT_PERMISSIONS);

    // In a real app, you'd save/load these from the database
    // For now, we use local state

    const handleTogglePermission = (roleId: string, moduleId: string) => {
        if (!isEditing) return;

        setPermissions(prev => {
            const rolePerms = prev[roleId] || [];
            if (rolePerms.includes(moduleId)) {
                // Don't allow removing dashboard access
                if (moduleId === "dashboard") {
                    toast.error(language === 'ar' ? 'لا يمكن إزالة الوصول للوحة التحكم' : "Cannot remove dashboard access");
                    return prev;
                }
                return { ...prev, [roleId]: rolePerms.filter(p => p !== moduleId) };
            } else {
                return { ...prev, [roleId]: [...rolePerms, moduleId] };
            }
        });
    };

    const handleSave = () => {
        setOriginalPermissions(permissions);
        setIsEditing(false);
        toast.success(language === 'ar' ? 'تم حفظ الصلاحيات بنجاح' : 'Permissions saved successfully');
        // In production, you would save to database here
    };

    const handleCancel = () => {
        setPermissions(originalPermissions);
        setIsEditing(false);
    };

    const handleReset = () => {
        setPermissions(DEFAULT_PERMISSIONS);
        toast.info(language === 'ar' ? 'تمت إعادة التعيين للافتراضي' : 'Reset to default permissions');
    };

    return (
        <MotionCard delay={0.1}>
            <div className="card-header" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "0.75rem",
                        background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white"
                    }}>
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="card-title" style={{ marginBottom: "0.125rem" }}>
                            {language === 'ar' ? 'إدارة صلاحيات الأدوار' : 'Role Access Management'}
                        </h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            {language === 'ar' ? 'تحكم في صلاحيات الوصول لكل دور' : 'Control access permissions for each role'}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {isEditing ? (
                        <>
                            <MotionButton className="btn-ghost btn-sm" onClick={handleCancel}>
                                <X size={16} />
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </MotionButton>
                            <MotionButton className="btn-ghost btn-sm" onClick={handleReset}>
                                <RotateCcw size={16} />
                                {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                            </MotionButton>
                            <MotionButton className="btn-primary btn-sm" onClick={handleSave}>
                                <Save size={16} />
                                {language === 'ar' ? 'حفظ' : 'Save'}
                            </MotionButton>
                        </>
                    ) : (
                        <MotionButton className="btn-primary btn-sm" onClick={() => setIsEditing(true)}>
                            <Edit2 size={16} />
                            {language === 'ar' ? 'تعديل الصلاحيات' : 'Edit Permissions'}
                        </MotionButton>
                    )}
                </div>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 600
                }}>
                    <thead>
                        <tr style={{ background: "var(--bg-secondary)" }}>
                            <th style={{
                                padding: "0.875rem 1rem",
                                textAlign: language === 'ar' ? "right" : "left",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                position: "sticky",
                                left: 0,
                                background: "var(--bg-secondary)",
                                zIndex: 1
                            }}>
                                {language === 'ar' ? 'الدور' : 'Role'}
                            </th>
                            {ALL_MODULES.map(module => (
                                <th key={module.id} style={{
                                    padding: "0.875rem 0.5rem",
                                    textAlign: "center",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    color: "var(--text-muted)"
                                }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
                                        <module.icon size={18} />
                                        <span>{language === 'ar' ? module.label.ar : module.label.en}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {ALL_ROLES.map((role, index) => {
                            const rolePerms = permissions[role.id] || [];
                            const isAdminRole = role.id === "admin";

                            return (
                                <motion.tr
                                    key={role.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                        background: isAdminRole ? "rgba(220, 38, 38, 0.05)" : "transparent"
                                    }}
                                >
                                    <td style={{
                                        padding: "0.875rem 1rem",
                                        position: "sticky",
                                        left: 0,
                                        background: isAdminRole ? "rgba(220, 38, 38, 0.05)" : "var(--bg-card)",
                                        zIndex: 1
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: "50%",
                                                background: role.color
                                            }} />
                                            <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                                                {language === 'ar' ? role.label.ar : role.label.en}
                                            </span>
                                            {isAdminRole && (
                                                <Lock size={14} color="var(--text-muted)" />
                                            )}
                                        </div>
                                    </td>
                                    {ALL_MODULES.map(module => {
                                        const hasAccess = rolePerms.includes(module.id);
                                        const isLocked = isAdminRole || (module.id === "dashboard");

                                        return (
                                            <td key={module.id} style={{
                                                padding: "0.5rem",
                                                textAlign: "center"
                                            }}>
                                                <motion.button
                                                    onClick={() => handleTogglePermission(role.id, module.id)}
                                                    disabled={!isEditing || isLocked}
                                                    style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: "0.5rem",
                                                        border: "none",
                                                        cursor: isEditing && !isLocked ? "pointer" : "default",
                                                        background: hasAccess
                                                            ? isLocked ? "rgba(5, 150, 105, 0.2)" : "#ECFDF5"
                                                            : isLocked ? "var(--bg-secondary)" : "var(--bg-secondary)",
                                                        color: hasAccess ? "#059669" : "var(--text-muted)",
                                                        transition: "all 0.2s",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        margin: "0 auto",
                                                        opacity: isLocked ? 0.7 : 1
                                                    }}
                                                    whileHover={isEditing && !isLocked ? { scale: 1.1 } : {}}
                                                    whileTap={isEditing && !isLocked ? { scale: 0.9 } : {}}
                                                >
                                                    {hasAccess ? <Check size={18} /> : <X size={18} />}
                                                </motion.button>
                                            </td>
                                        );
                                    })}
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div style={{
                padding: "1rem 1.25rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                flexWrap: "wrap",
                gap: "1.5rem",
                fontSize: "0.75rem",
                color: "var(--text-muted)"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: "0.375rem",
                        background: "var(--bg-success)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Check size={14} color="#059669" />
                    </div>
                    <span>{language === 'ar' ? 'لديه صلاحية' : 'Has Access'}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: "0.375rem",
                        background: "var(--bg-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <X size={14} color="var(--text-muted)" />
                    </div>
                    <span>{language === 'ar' ? 'لا يوجد صلاحية' : 'No Access'}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Lock size={14} />
                    <span>{language === 'ar' ? 'مقفل (لا يمكن تغييره)' : 'Locked (cannot change)'}</span>
                </div>
            </div>
        </MotionCard>
    );
}
