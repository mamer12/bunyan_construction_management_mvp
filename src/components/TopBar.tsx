import { useState, useRef, useEffect } from "react";
import { Bell, Search, Globe, Menu, Sparkles, Check, X, Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotifications } from "../contexts/NotificationContext";
import { useTheme } from "../contexts/ThemeContext";
import { ShakingBell, PulseIndicator } from "./ui/motion";

interface TopBarProps {
    breadcrumb?: string;
    onToggleSidebar?: () => void;
    userName?: string;
    userRole?: string;
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

// Get time-based greeting
const getGreeting = (language: string) => {
    const hour = new Date().getHours();
    if (language === 'ar') {
        if (hour < 12) return "صباح الخير";
        if (hour < 17) return "مساء الخير";
        return "مساء الخير";
    } else {
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    }
};

export function TopBar({ breadcrumb = "Dashboard", onToggleSidebar, userName = "User", userRole = "guest" }: TopBarProps) {
    const { t, language, setLanguage } = useLanguage();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const { theme, toggleTheme, isDark, effectiveTheme } = useTheme();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const greeting = getGreeting(language);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'ar' : 'en');
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
                height: 56,
                background: "var(--bg-card)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 1.25rem",
                position: "sticky",
                top: 0,
                zIndex: 30,
                boxShadow: "var(--shadow-sm)"
            }}
        >
            {/* Left Section - Greeting */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0, flex: 1 }}>
                <div style={{ minWidth: 0 }}>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{greeting}, {userName}</span>
                        <motion.span
                            animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                        >
                            👋
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            margin: 0,
                            fontWeight: 500
                        }}
                    >
                        {breadcrumb}
                    </motion.p>
                </div>
            </div>

            {/* Right Section - Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Theme Toggle */}
                <motion.button
                    onClick={toggleTheme}
                    style={{
                        background: "var(--bg-primary)",
                        border: "1px solid var(--border)",
                        color: "var(--text-secondary)",
                        cursor: "pointer",
                        padding: "0.625rem",
                        borderRadius: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    whileHover={{
                        borderColor: "var(--brand-primary)",
                        color: "var(--brand-primary)"
                    }}
                    whileTap={{ scale: 0.95 }}
                    title={theme === 'system' ? 'System theme' : effectiveTheme === 'dark' ? 'Dark mode' : 'Light mode'}
                >
                    {theme === 'system' ? (
                        <Monitor size={18} />
                    ) : effectiveTheme === 'dark' ? (
                        <Moon size={18} />
                    ) : (
                        <Sun size={18} />
                    )}
                </motion.button>

                {/* Language Toggle */}
                <motion.button
                    onClick={toggleLanguage}
                    style={{
                        background: "var(--bg-mint)",
                        border: "1px solid var(--border-emerald)",
                        color: "var(--brand-primary-dark)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        padding: "0.5rem 0.875rem",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        fontFamily: "inherit"
                    }}
                    whileHover={{
                        scale: 1.05,
                        background: "var(--bg-card-hover)"
                    }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Globe size={16} />
                    <span>{language === 'en' ? 'EN' : 'AR'}</span>
                </motion.button>

                {/* Notifications */}
                <div ref={notificationRef} style={{ position: "relative" }}>
                    <ShakingBell>
                        <motion.button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border)",
                                color: "var(--text-primary)",
                                cursor: "pointer",
                                padding: "0.625rem",
                                borderRadius: "0.75rem",
                                position: "relative",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            whileHover={{
                                borderColor: "var(--brand-primary)",
                                color: "var(--brand-primary)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    style={{
                                        position: "absolute",
                                        top: -4,
                                        right: -4,
                                        width: 18,
                                        height: 18,
                                        borderRadius: "50%",
                                        background: "var(--danger)",
                                        color: "white",
                                        fontSize: "0.65rem",
                                        fontWeight: "bold",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        border: "2px solid var(--bg-card)"
                                    }}
                                >
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </motion.div>
                            )}
                        </motion.button>
                    </ShakingBell>

                    {/* Notification Dropdown */}
                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: "absolute",
                                    top: "calc(100% + 8px)",
                                    right: 0,
                                    width: 320,
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "1rem",
                                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                                    overflow: "hidden",
                                    zIndex: 100
                                }}
                            >
                                {/* Header */}
                                <div style={{
                                    padding: "1rem",
                                    borderBottom: "1px solid var(--border)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}>
                                    <h4 style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{t("notifications")}</h4>
                                    {notifications.length > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                color: "var(--brand-primary)",
                                                fontSize: "0.75rem",
                                                cursor: "pointer",
                                                fontFamily: "inherit"
                                            }}
                                        >
                                            {language === 'ar' ? "تحديد الكل كمقروء" : "Mark all as read"}
                                        </button>
                                    )}
                                </div>

                                {/* Notification List */}
                                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                                    {notifications.length === 0 ? (
                                        <div style={{
                                            padding: "2rem",
                                            textAlign: "center",
                                            color: "var(--text-muted)"
                                        }}>
                                            <Bell size={32} style={{ marginBottom: "0.5rem", opacity: 0.5 }} />
                                            <p>{t("noNotifications")}</p>
                                        </div>
                                    ) : (
                                        notifications.slice(0, 10).map((notification) => (
                                            <div
                                                key={notification.id}
                                                onClick={() => markAsRead(notification.id)}
                                                style={{
                                                    padding: "0.875rem 1rem",
                                                    borderBottom: "1px solid var(--border)",
                                                    cursor: "pointer",
                                                    background: notification.read ? "transparent" : "var(--bg-mint)",
                                                    display: "flex",
                                                    gap: "0.75rem",
                                                    alignItems: "flex-start"
                                                }}
                                            >
                                                <div style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: "50%",
                                                    background: notification.read ? "transparent" : "var(--brand-primary)",
                                                    marginTop: 6,
                                                    flexShrink: 0
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <p style={{
                                                        margin: 0,
                                                        fontSize: "0.875rem",
                                                        color: "var(--text-primary)"
                                                    }}>
                                                        {notification.message}
                                                    </p>
                                                    <span style={{
                                                        fontSize: "0.7rem",
                                                        color: "var(--text-muted)"
                                                    }}>
                                                        {new Date(notification.timestamp).toLocaleString(language === 'ar' ? 'ar-IQ' : 'en-US')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.header>
    );
}
