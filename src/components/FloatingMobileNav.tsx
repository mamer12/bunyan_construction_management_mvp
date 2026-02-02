import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Building2,
    Banknote,
    Users,
    Package,
    Settings,
    Briefcase,
    ShoppingBag
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

interface FloatingMobileNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    allowedMenuIds: string[];
}

export function FloatingMobileNav({ activeTab, onTabChange, allowedMenuIds }: FloatingMobileNavProps) {
    const { t } = useLanguage();

    const allMenuItems = [
        { id: "dashboard", icon: LayoutDashboard },
        { id: "management", icon: Briefcase },
        { id: "projects", icon: Building2 },
        { id: "sales", icon: ShoppingBag },
        { id: "finance", icon: Banknote },
        { id: "team", icon: Users },
        { id: "stock", icon: Package },
        { id: "settings", icon: Settings },
    ];

    // Filter and limit to 5 most important items for mobile
    const menuItems = allMenuItems
        .filter(item => allowedMenuIds.includes(item.id))
        .slice(0, 5);

    return (
        <div
            style={{
                position: "fixed",
                bottom: 20,
                left: 0,
                right: 0,
                display: "flex",
                justifyContent: "center",
                zIndex: 50,
                padding: "0 1rem",
                pointerEvents: "none" // Allow clicks through to background if not on buttons
            }}
            className="md:hidden"
        >
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{
                    width: "fit-content",
                    pointerEvents: "auto" // Re-enable clicks for the nav itself
                }}
            >
                <div
                    style={{
                        background: "var(--glass-bg)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid var(--glass-border)",
                        borderRadius: "2rem",
                        padding: "0.75rem 1rem",
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center"
                    }}
                >
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => onTabChange(item.id)}
                                style={{
                                    background: isActive ? "var(--brand-primary)" : "transparent",
                                    color: isActive ? "white" : "var(--text-secondary)",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "0.875rem",
                                    borderRadius: "1.25rem",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    minWidth: 48,
                                    transition: "all 0.2s ease"
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    background: isActive ? "var(--brand-primary)" : "var(--bg-mint)"
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            borderRadius: "1.25rem",
                                            background: "var(--brand-primary)",
                                            zIndex: -1
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 35
                                        }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.nav>
        </div>
    );
}
