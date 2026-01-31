import {
    LayoutDashboard,
    Building2,
    Banknote,
    Users,
    LogOut,
    Sparkles,
    Package,
    Settings,
    Briefcase
} from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useIsMobile } from "../hooks/use-mobile";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    isOpen?: boolean;
    onClose?: () => void;
}

// Role to display name mapping
const ROLE_DISPLAY_NAMES: Record<string, string> = {
    admin: "Administrator",
    acting_manager: "Acting Manager",
    lead: "Lead Engineer",
    engineer: "Site Engineer",
    finance: "Finance Officer",
    stock: "Stock Manager",
    guest: "Guest",
};

// Define which menu items each role can see
const ROLE_MENU_ACCESS: Record<string, string[]> = {
    admin: ["dashboard", "management", "projects", "finance", "team", "stock", "settings"],
    acting_manager: ["dashboard", "management", "projects", "finance", "team"],
    lead: ["dashboard", "projects", "finance", "team"],
    engineer: ["dashboard", "projects"],
    finance: ["dashboard", "finance"],
    stock: ["dashboard", "stock"],
    guest: ["dashboard"],
};

export function Sidebar({ activeTab, onTabChange, isOpen = true, onClose }: SidebarProps) {
    const { signOut } = useAuthActions();
    const { t } = useLanguage();
    const isMobile = useIsMobile();

    // Fetch actual user data
    const role = useQuery(api.roles.getMyRole);
    const users = useQuery(api.users.getUsers);
    const currentUser = users?.find((u: any) => u.role === role);

    const allMenuItems = [
        { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
        { id: "management", label: t("management"), icon: Briefcase },
        { id: "projects", label: t("projects"), icon: Building2 },
        { id: "finance", label: t("finance"), icon: Banknote },
        { id: "team", label: t("team"), icon: Users },
        { id: "stock", label: t("stock"), icon: Package },
        { id: "settings", label: t("settings"), icon: Settings },
    ];

    // Filter menu items based on role
    const allowedMenuIds = ROLE_MENU_ACCESS[role || "guest"] || ROLE_MENU_ACCESS.guest;
    const menuItems = allMenuItems.filter(item => allowedMenuIds.includes(item.id));

    const sidebarVariants = {
        hidden: { x: -280, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            x: -280,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i: number) => ({
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.1 + i * 0.05,
                duration: 0.3,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        })
    };

    const logoVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delay: 0.1,
                duration: 0.4,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const shouldBeOpen = isMobile ? isOpen : true;

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        className="sidebar-overlay md:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ display: 'block' }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                className={`sidebar ${shouldBeOpen ? 'open' : ''}`}
                variants={sidebarVariants}
                initial={false}
                animate={shouldBeOpen ? "visible" : "hidden"}
            >
                {/* Logo Section */}
                <motion.div
                    variants={logoVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        padding: "2rem 1.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        borderBottom: "1px solid rgba(255,255,255,0.1)"
                    }}
                >
                    <motion.div
                        style={{
                            width: 48,
                            height: 48,
                            background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "1.5rem",
                            boxShadow: "0 4px 12px rgba(52, 211, 153, 0.3)"
                        }}
                        whileHover={{
                            scale: 1.05,
                            rotate: 5,
                            transition: { duration: 0.2 }
                        }}
                    >
                        B
                    </motion.div>
                    <div>
                        <h1 style={{
                            fontSize: "1.5rem",
                            fontWeight: "800",
                            lineHeight: 1,
                            margin: 0,
                            letterSpacing: "-0.02em"
                        }}>
                            Bunyan
                        </h1>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            marginTop: "0.25rem"
                        }}>
                            <Sparkles size={12} style={{ opacity: 0.7 }} />
                            <span style={{
                                fontSize: "0.75rem",
                                opacity: 0.7,
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                fontWeight: 500
                            }}>
                                Enterprise
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "1.5rem 0" }}>
                    <div style={{
                        padding: "0 1.5rem",
                        marginBottom: "0.75rem",
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        opacity: 0.5,
                        fontWeight: 600
                    }}>
                        Menu
                    </div>
                    {menuItems.map((item, index) => (
                        <motion.button
                            key={item.id}
                            custom={index}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={() => {
                                onTabChange(item.id);
                                if (window.innerWidth < 768) onClose?.();
                            }}
                            className={`sidebar-link ${activeTab === item.id ? "active" : ""}`}
                            style={{
                                width: "calc(100% - 1.5rem)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                                margin: "0 0.75rem",
                                position: "relative",
                            }}
                            whileHover={activeTab !== item.id ? {
                                x: 4,
                                transition: { duration: 0.15 }
                            } : {}}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    position: "relative",
                                    zIndex: 1
                                }}
                            >
                                <item.icon size={20} />
                                <span style={{ fontSize: "0.95rem", fontWeight: activeTab === item.id ? 700 : 500 }}>
                                    {item.label}
                                </span>
                            </motion.div>

                            {/* Active indicator pill */}
                            {activeTab === item.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: "white",
                                        borderRadius: "1rem",
                                        zIndex: 0
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}
                        </motion.button>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div style={{
                    padding: "1.5rem",
                    borderTop: "1px solid rgba(255,255,255,0.1)"
                }}>
                    {/* User Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            background: "rgba(255,255,255,0.05)",
                            borderRadius: "1rem",
                            marginBottom: "1rem"
                        }}
                    >
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            background: "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.9rem",
                            fontWeight: 700
                        }}>
                            AA
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis"
                            }}>
                                {currentUser?.name || "User"}
                            </div>
                            <div style={{
                                fontSize: "0.75rem",
                                opacity: 0.6
                            }}>
                                {ROLE_DISPLAY_NAMES[role || "guest"] || role || "Guest"}
                            </div>
                        </div>
                    </motion.div>

                    {/* Sign Out Button */}
                    <motion.button
                        className="sidebar-link"
                        onClick={() => void signOut()}
                        style={{
                            width: "100%",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.2)",
                            color: "#FCA5A5",
                            borderRadius: "1rem",
                            justifyContent: "center"
                        }}
                        whileHover={{
                            background: "rgba(239, 68, 68, 0.2)",
                            scale: 1.02,
                            transition: { duration: 0.15 }
                        }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <LogOut size={18} />
                        <span style={{ fontWeight: 600 }}>{t("signOut")}</span>
                    </motion.button>
                </div>
            </motion.aside>
        </>
    );
}
