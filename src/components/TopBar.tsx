import { useState, useRef, useEffect } from "react";
import { Bell, Search, Globe, Menu, Sparkles, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotifications } from "../contexts/NotificationContext";
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

export function TopBar({ breadcrumb = "Dashboard", onToggleSidebar, userName = "User", userRole = "guest" }: TopBarProps) {
    const { t, language, setLanguage } = useLanguage();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

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
                height: 80,
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 2rem",
                position: "sticky",
                top: 0,
                zIndex: 20
            }}
        >
            {/* Left Side - Welcome Message */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* Mobile Menu Toggle */}
                {onToggleSidebar && (
                    <motion.button
                        onClick={onToggleSidebar}
                        className="md:hidden"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0.5rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                        whileHover={{ background: "rgba(5, 150, 105, 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Menu size={24} color="var(--text-primary)" />
                    </motion.button>
                )}

                {/* Welcome Message */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.25rem"
                    }}>
                        <Sparkles size={14} style={{ color: "var(--brand-primary)" }} />
                        <span style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            fontWeight: 500
                        }}>
                            {breadcrumb}
                        </span>
                    </div>
                    <h1 style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        margin: 0,
                        lineHeight: 1.2
                    }}>
                        Welcome back, <span style={{ color: "var(--brand-primary)" }}>{userName}</span>
                    </h1>
                </motion.div>
            </div>

            {/* Right Side - Actions */}
            <motion.div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                {/* Search Bar */}
                <motion.div
                    style={{
                        position: "relative",
                        display: "none"
                    }}
                    className="md:flex"
                    whileHover={{ scale: 1.02 }}
                >
                    <Search
                        size={18}
                        style={{
                            position: "absolute",
                            left: language === 'en' ? 14 : 'auto',
                            right: language === 'ar' ? 14 : 'auto',
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "var(--text-muted)"
                        }}
                    />
                    <input
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        style={{
                            padding: language === 'en' ? "0.75rem 1rem 0.75rem 2.75rem" : "0.75rem 2.75rem 0.75rem 1rem",
                            borderRadius: "1rem",
                            border: "1px solid var(--border)",
                            background: "var(--bg-primary)",
                            fontSize: "0.875rem",
                            outline: "none",
                            width: 220,
                            transition: "all 0.2s",
                            fontFamily: "inherit"
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = "var(--brand-primary)";
                            e.target.style.boxShadow = "0 0 0 3px rgba(5, 150, 105, 0.1)";
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = "var(--border)";
                            e.target.style.boxShadow = "none";
                        }}
                    />
                </motion.div>

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
                        borderRadius: "1rem",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        fontFamily: "inherit"
                    }}
                    whileHover={{
                        scale: 1.05,
                        background: "#D1FAE5"
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
                                color: "var(--text-secondary)",
                                cursor: "pointer",
                                padding: "0.625rem",
                                borderRadius: "1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative"
                            }}
                            whileHover={{
                                borderColor: "var(--brand-primary)",
                                color: "var(--brand-primary)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Bell size={20} />
                            {/* Notification indicator */}
                            {unreadCount > 0 && (
                                <span style={{
                                    position: "absolute",
                                    top: -4,
                                    right: -4,
                                    minWidth: 18,
                                    height: 18,
                                    borderRadius: "50%",
                                    background: "#EF4444",
                                    color: "white",
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "0 4px"
                                }}>
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
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
                                    <h4 style={{ margin: 0, fontWeight: 600 }}>{t("notifications")}</h4>
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

                {/* Profile */}
                <motion.div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        paddingLeft: "1rem",
                        borderLeft: "1px solid var(--border)",
                        marginLeft: "0.5rem"
                    }}
                    className="hidden md:flex"
                >
                    <div style={{ textAlign: "right" }}>
                        <div style={{
                            fontSize: "0.875rem",
                            fontWeight: 700,
                            color: "var(--text-primary)"
                        }}>
                            {userName}
                        </div>
                        <div style={{
                            fontSize: "0.75rem",
                            color: "var(--text-secondary)"
                        }}>
                            {ROLE_DISPLAY_NAMES[userRole] || userRole}
                        </div>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 700,
                            fontSize: "1rem",
                            boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)"
                        }}
                    >
                        AA
                    </motion.div>
                </motion.div>
            </motion.div>
        </motion.header>
    );
}
