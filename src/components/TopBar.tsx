import { Bell, Search, Globe, Menu, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../contexts/LanguageContext";
import { ShakingBell, PulseIndicator } from "./ui/motion";

interface TopBarProps {
    breadcrumb?: string;
    onToggleSidebar?: () => void;
    userName?: string;
}

export function TopBar({ breadcrumb = "Dashboard", onToggleSidebar, userName = "Eng. Ali" }: TopBarProps) {
    const { t, language, setLanguage } = useLanguage();

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
                <ShakingBell>
                    <motion.button 
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
                        <span style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                        }}>
                            <PulseIndicator color="#EF4444" />
                        </span>
                    </motion.button>
                </ShakingBell>

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
                            Ahmed Al-Rahim
                        </div>
                        <div style={{ 
                            fontSize: "0.75rem", 
                            color: "var(--text-secondary)" 
                        }}>
                            Lead Engineer
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
